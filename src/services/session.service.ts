import { SignJWT, jwtVerify } from "jose";
import { createServiceError } from "../lib/auth-errors";
import { prisma } from "../lib/prisma";
import { ApiResponse, AuthErrorKey } from "../types/api";
import {
  JWTPayload,
  RefreshTokenPayload,
  SessionFingerprint,
} from "../types/auth";

// Create secret keys for JWT
const accessSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key"
);
const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-key"
);

export class SessionService {
  /**
   * Create session fingerprint from request headers using Web Crypto API
   */
  static async createFingerprint(headers: {
    userAgent?: string;
    ipAddress?: string;
    acceptLanguage?: string;
    acceptEncoding?: string;
  }): Promise<string> {
    const fingerprintData = [
      headers.userAgent || "",
      headers.ipAddress || "",
      headers.acceptLanguage || "",
      headers.acceptEncoding || "",
    ].join("|");

    // Use Web Crypto API instead of Node.js crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Generate random bytes using Web Crypto API
   */
  static generateRandomBytes(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Create a new session with access and refresh tokens
   */
  static async createSession(
    userId: string,
    fingerprint: SessionFingerprint
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      sessionId: string;
    }>
  > {
    try {
      // Generate unique session ID using Web Crypto API
      const sessionId = this.generateRandomBytes(32);
      const fingerprintHash = await this.createFingerprint(fingerprint);

      // Create session record in database
      const session = await prisma.session.create({
        data: {
          id: sessionId,
          userId,
          token: sessionId, // Use sessionId as token identifier
          fingerprint: fingerprintHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Get user data for token payload
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          administrator: true,
          owner: true,
        },
      });

      if (!user) {
        return createServiceError(AuthErrorKey.USER_NOT_FOUND);
      }

      // Create access token (short-lived)
      const accessTokenPayload: JWTPayload = {
        userId,
        email: user.email,
        role: user.role,
        sessionId,
        fingerprint: fingerprintHash,
        administratorId: user.administrator?.id,
        ownerId: user.owner?.id,
      };

      const accessToken = await new SignJWT(accessTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m") // Short-lived access token
        .sign(accessSecret);

      // Create refresh token (long-lived)
      const refreshTokenPayload: RefreshTokenPayload = {
        userId,
        sessionId,
        fingerprint: fingerprintHash,
      };

      const refreshToken = await new SignJWT(refreshTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Long-lived refresh token
        .sign(refreshSecret);

      return {
        success: true,
        message: "Session created successfully",
        data: {
          accessToken,
          refreshToken,
          sessionId: session.id,
        },
      };
    } catch (error) {
      console.error("Session creation error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    currentFingerprint: SessionFingerprint
  ): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    try {
      // Verify refresh token
      const { payload } = await jwtVerify(refreshToken, refreshSecret);
      const refreshPayload = payload as RefreshTokenPayload;

      // Verify session exists and is valid
      const session = await prisma.session.findUnique({
        where: { id: refreshPayload.sessionId },
        include: { user: { include: { administrator: true, owner: true } } },
      });

      if (!session || session.expiresAt < new Date()) {
        return createServiceError(
          AuthErrorKey.INVALID_TOKEN,
          "Session expired or not found"
        );
      }

      // Verify fingerprint matches
      const currentFingerprintHash = await this.createFingerprint(
        currentFingerprint
      );
      if (session.fingerprint !== currentFingerprintHash) {
        // Log potential security issue
        console.warn("Session fingerprint mismatch detected", {
          sessionId: session.id,
          userId: session.userId,
          storedFingerprint: session.fingerprint,
          currentFingerprint: currentFingerprintHash,
        });

        return createServiceError(
          AuthErrorKey.INVALID_TOKEN,
          "Session fingerprint mismatch - possible session hijacking"
        );
      }

      // Create new access token
      const accessTokenPayload: JWTPayload = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.id,
        fingerprint: currentFingerprintHash,
        administratorId: session.user.administrator?.id,
        ownerId: session.user.owner?.id,
      };

      const accessToken = await new SignJWT(accessTokenPayload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(accessSecret);

      // Optionally rotate refresh token for enhanced security
      let newRefreshToken: string | undefined;
      const tokenAge = Date.now() / 1000 - (refreshPayload.iat || 0);
      const shouldRotateRefreshToken = tokenAge > 24 * 60 * 60; // Rotate after 24 hours

      if (shouldRotateRefreshToken) {
        const newRefreshPayload: RefreshTokenPayload = {
          userId: session.user.id,
          sessionId: session.id,
          fingerprint: currentFingerprintHash,
        };

        newRefreshToken = await new SignJWT(newRefreshPayload)
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(refreshSecret);
      }

      // Update session last accessed time
      await prisma.session.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });

      return {
        success: true,
        message: "Access token refreshed successfully",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return createServiceError(AuthErrorKey.INVALID_TOKEN);
    }
  }

  /**
   * Verify access token and validate session
   */
  static async verifyAccessToken(
    accessToken: string,
    currentFingerprint: SessionFingerprint
  ): Promise<ApiResponse<JWTPayload>> {
    try {
      // Verify JWT token
      const { payload } = await jwtVerify(accessToken, accessSecret);
      const jwtPayload = payload as JWTPayload;

      // Verify session exists and is valid
      const session = await prisma.session.findUnique({
        where: { id: jwtPayload.sessionId },
      });

      if (!session || session.expiresAt < new Date()) {
        return createServiceError(
          AuthErrorKey.INVALID_TOKEN,
          "Session expired or not found"
        );
      }

      // Verify fingerprint matches
      const currentFingerprintHash = await this.createFingerprint(
        currentFingerprint
      );
      if (session.fingerprint !== currentFingerprintHash) {
        console.warn("Session fingerprint mismatch detected", {
          sessionId: session.id,
          userId: session.userId,
          storedFingerprint: session.fingerprint,
          currentFingerprint: currentFingerprintHash,
        });

        return createServiceError(
          AuthErrorKey.INVALID_TOKEN,
          "Session fingerprint mismatch"
        );
      }

      return {
        success: true,
        message: "Token verified successfully",
        data: jwtPayload,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return createServiceError(AuthErrorKey.INVALID_TOKEN);
    }
  }

  /**
   * Invalidate a specific session
   */
  static async invalidateSession(
    sessionId: string
  ): Promise<ApiResponse<void>> {
    try {
      await prisma.session.delete({
        where: { id: sessionId },
      });

      return {
        success: true,
        message: "Session invalidated successfully",
        data: undefined,
      };
    } catch (error) {
      console.error("Session invalidation error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateAllUserSessions(
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        message: "All user sessions invalidated successfully",
        data: undefined,
      };
    } catch (error) {
      console.error("User sessions invalidation error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<
    ApiResponse<{ deletedCount: number }>
  > {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return {
        success: true,
        message: `Cleaned up ${result.count} expired sessions`,
        data: { deletedCount: result.count },
      };
    } catch (error) {
      console.error("Session cleanup error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<
    ApiResponse<
      Array<{
        id: string;
        fingerprint: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
      }>
    >
  > {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          fingerprint: true,
          createdAt: true,
          updatedAt: true,
          expiresAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        success: true,
        message: "User sessions retrieved successfully",
        data: sessions,
      };
    } catch (error) {
      console.error("Get user sessions error:", error);
      return createServiceError(AuthErrorKey.INTERNAL_ERROR);
    }
  }

  /**
   * Validate session fingerprint
   */
  static async validateFingerprint(
    storedFingerprint: string,
    currentFingerprint: SessionFingerprint
  ): Promise<boolean> {
    const currentFingerprintHash = await this.createFingerprint(
      currentFingerprint
    );
    return storedFingerprint === currentFingerprintHash;
  }

  /**
   * Create enhanced token with session validation
   */
  static async createEnhancedToken(
    payload: JWTPayload,
    fingerprint: SessionFingerprint
  ): Promise<string> {
    const enhancedPayload = {
      ...payload,
      fingerprint: await this.createFingerprint(fingerprint),
    };

    return await new SignJWT(enhancedPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(accessSecret);
  }
}
