import type { UserWithRoleAndProfile } from "@/services/permission.service";

/**
 * Maps a user with role and profile to a safe API response format
 */
export function mapUserToApiResponse(user: UserWithRoleAndProfile) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    role: {
      id: user.role.id,
      name: user.role.name,
      description: user.role.description,
      isSystem: user.role.isSystem,
    },
    administrator: user.administrator,
    owner: user.owner,
  };
}

/**
 * Maps multiple users to API response format
 */
export function mapUsersToApiResponse(users: UserWithRoleAndProfile[]) {
  return users.map(mapUserToApiResponse);
}

/**
 * Maps user data for display purposes (excludes sensitive info)
 */
export function mapUserForDisplay(user: UserWithRoleAndProfile) {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role.name,
    isAdmin: user.administrator !== null,
    isOwner: user.owner !== null,
    apartmentCount: user.owner?.apartments?.length || 0,
    createdAt: user.createdAt,
  };
}

/**
 * Maps user data for select/dropdown components
 */
export function mapUserForSelect(user: UserWithRoleAndProfile) {
  return {
    value: user.id,
    label: `${user.firstName} ${user.lastName} (${user.email})`,
    role: user.role.name,
  };
}
