import { api } from "@/lib/axios";
import type { UserRole } from "@prisma/client/wasm";
import type { SafeUser } from "@/types/auth";
import type { PaginatedResponse, PaginationParams } from "@/types/api";

export type CreateUserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
};

export type UpdateUserData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
};

export type UserSearchParams = PaginationParams & {
  search?: string;
  role?: string;
};

export type UserStatsResponse = {
  totalUsers: number;
  totalAdmins: number;
  totalOwners: number;
  recentUsers: SafeUser[];
};

export const userService = {
  // Get all users (admin only)
  async getUsers(
    params?: UserSearchParams
  ): Promise<PaginatedResponse<SafeUser>> {
    const response = await api.get<PaginatedResponse<SafeUser>>("/users", {
      params,
    });
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<SafeUser> {
    const response = await api.get<SafeUser>(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only)
  async createUser(data: CreateUserData): Promise<SafeUser> {
    const response = await api.post<SafeUser>("/users", data);
    return response.data;
  },

  // Update user
  async updateUser(id: string, data: UpdateUserData): Promise<SafeUser> {
    const response = await api.patch<SafeUser>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },

  // Get user statistics (admin only)
  async getUserStats(): Promise<UserStatsResponse> {
    const response = await api.get<UserStatsResponse>("/users/stats");
    return response.data;
  },

  // Search users
  async searchUsers(query: string): Promise<SafeUser[]> {
    const response = await api.get<SafeUser[]>("/users/search", {
      params: { q: query },
    });
    return response.data;
  },

  // Activate/deactivate user (admin only)
  async toggleUserStatus(id: string): Promise<SafeUser> {
    const response = await api.patch<SafeUser>(`/users/${id}/toggle-status`);
    return response.data;
  },
};
