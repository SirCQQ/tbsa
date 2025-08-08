import { api } from "@/lib/axios";
import type {
  OrganizationRegistrationData,
  UserRegistrationData,
  SignInData,
  OrganizationCreationData,
} from "@/lib/validations/auth";

// Response types
export type OrganizationRegistrationResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    organization: {
      id: string;
      name: string;
      code: string;
    };
    paymentLink?: string;
  };
};

export type UserRegistrationResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    };
    organization: {
      id: string;
      name: string;
      code: string;
    };
    role: {
      id: string;
      name: string;
      code: string;
    };
  };
};

export type EmailVerificationResponse = {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    };
  };
};

export type OrganizationCodeCheckResponse = {
  success: boolean;
  message: string;
  data: {
    available: boolean;
    code: string;
  };
};

export type AuthErrorResponse = {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
};

// Registration API functions
export const authApi = {
  // Organization creation (for authenticated users)
  createOrganization: async (data: OrganizationCreationData) => {
    const response = await api.post("/auth/register/organization", data);
    return response.data;
  },

  // Organization registration
  registerOrganization: async (data: OrganizationRegistrationData) => {
    const response = await api.post("/auth/register/organization/user", data);
    return response.data;
  },

  // User registration with invite code
  registerUser: async (data: UserRegistrationData) => {
    const response = await api.post("/auth/register/user", data);
    return response.data;
  },

  // Sign in
  signIn: async (data: SignInData) => {
    const response = await api.post("/auth/signin", data);
    return response.data;
  },

  // Sign out
  signOut: async () => {
    const response = await api.post("/auth/signout");
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  // Verify invite code
  verifyInviteCode: async (code: string) => {
    const response = await api.get(`/invite-codes/verify/${code}`);
    return response.data;
  },

  // Check if organization code is available
  checkOrganizationCode: async (code: string) => {
    const response = await api.get(`/auth/check-organization-code/${code}`);
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token: string) => {
    const response = await api.post("/auth/verify", { token });
    return response.data;
  },
};

export type InviteCodeVerification = {
  isValid: boolean;
  organizationName?: string;
  email?: string;
  expiresAt?: string;
};

export type OrganizationCodeCheck = {
  isAvailable: boolean;
  suggestion?: string;
};
