import { api } from "@/lib/axios";
import type {
  OrganizationRegistrationData,
  UserRegistrationData,
  SignInData,
} from "@/lib/validations/auth";

// Registration API functions
export const authApi = {
  // Organization registration
  registerOrganization: async (data: OrganizationRegistrationData) => {
    const response = await api.post("/auth/register/organization", data);
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

// Response types
export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  organizations: Array<{
    id: string;
    name: string;
    code: string;
    role: string;
  }>;
};

export type OrganizationRegistrationResponse = {
  success: true;
  message: string;
  data: {
    organization: {
      id: string;
      name: string;
      code: string;
      description?: string;
      subscriptionPlan: {
        id: string;
        name: string;
        price: string;
      };
    };
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    };
    role: {
      id: string;
      name: string;
      code: string;
    };
  };
};

export type UserRegistrationResponse = {
  success: true;
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

export type AuthErrorResponse = {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
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

export type EmailVerificationResponse = {
  success: true;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    };
  };
};
