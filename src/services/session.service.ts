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

      // Create session record in database (if you want to track sessions)
      // For now, we'll use in-memory/JWT-based sessions

      // Create access token (short-lived)
      const accessTokenPayload: JWTPayload = {
        userId,
        email: "", // Will be filled by auth service
        role: "OWNER", // Will be filled by auth service
        sessionId,
        fingerprint: fingerprintHash,
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
          sessionId,
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

      // Verify fingerprint matches
      const currentFingerprintHash = await this.createFingerprint(
        currentFingerprint
      );
      if (refreshPayload.fingerprint !== currentFingerprintHash) {
        return createServiceError(
          AuthErrorKey.INVALID_TOKEN,
          "Session fingerprint mismatch - possible session hijacking"
        );
      }

      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: refreshPayload.userId },
        include: {
          administrator: true,
          owner: true,
        },
      });

      if (!user) {
        return createServiceError(AuthErrorKey.USER_NOT_FOUND);
      }

      // Create new access token
      const accessTokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: refreshPayload.sessionId,
        fingerprint: currentFingerprintHash,
        administratorId: user.administrator?.id,
        ownerId: user.owner?.id,
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
          userId: user.id,
          sessionId: refreshPayload.sessionId,
          fingerprint: currentFingerprintHash,
        };

        newRefreshToken = await new SignJWT(newRefreshPayload)
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(refreshSecret);
      }

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
   * Verify access token and check fingerprint
   */
  static async verifyAccessToken(
    accessToken: string,
    currentFingerprint: SessionFingerprint
  ): Promise<ApiResponse<JWTPayload>> {
    try {
      const { payload } = await jwtVerify(accessToken, accessSecret);
      const jwtPayload = payload as JWTPayload;

      // Verify fingerprint if present
      if (jwtPayload.fingerprint) {
        const currentFingerprintHash = await this.createFingerprint(
          currentFingerprint
        );
        if (jwtPayload.fingerprint !== currentFingerprintHash) {
          return createServiceError(
            AuthErrorKey.INVALID_TOKEN,
            "Session fingerprint mismatch"
          );
        }
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
   * Invalidate session (logout)
   */
  static async invalidateSession(
    sessionId: string
  ): Promise<ApiResponse<void>> {
    try {
      // In a full implementation, you would mark the session as invalid in the database
      // For now, we rely on token expiration and client-side token removal

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
   * Validate session fingerprint for security
   */
  static async validateFingerprint(
    storedFingerprint: string,
    currentFingerprint: SessionFingerprint
  ): Promise<boolean> {
    const currentHash = await this.createFingerprint(currentFingerprint);
    return storedFingerprint === currentHash;
  }

  /**
   * Create enhanced JWT token with session tracking
   */
  static async createEnhancedToken(
    payload: JWTPayload,
    fingerprint: SessionFingerprint
  ): Promise<string> {
    const enhancedPayload = {
      ...payload,
      fingerprint: await this.createFingerprint(fingerprint),
      sessionId: payload.sessionId || this.generateRandomBytes(16),
    };

    return await new SignJWT(enhancedPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m") // Shorter expiration for better security
      .sign(accessSecret);
  }
}
