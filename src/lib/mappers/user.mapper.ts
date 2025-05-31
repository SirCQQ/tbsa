import type { UserWithRoleAndProfile } from "@/types/permission";

/**
 * Maps a user with role and profile to a safe API response format
 */
function mapUserToApiResponse(user: UserWithRoleAndProfile) {
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
