import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Helper functions
  const hasPermission = (resource: string, action: string) => {
    const permissionCode = `${resource}:${action}`;
    return user?.permissions.includes(permissionCode) || false;
  };

  const hasRole = (roleName: string) => {
    return user?.roles.includes(roleName) || false;
  };

  const getCurrentOrganization = () => {
    return user?.organizations.find(
      (org) => org.id === user.currentOrganizationId
    );
  };

  const getFullName = () => {
    if (!user?.firstName && !user?.lastName) return null;
    return `${user.firstName} ${user.lastName}`.trim();
  };

  const getInitials = () => {
    if (!user?.firstName && !user?.lastName) return "U";
    const firstInitial = user.firstName?.[0] || "";
    const lastInitial = user.lastName?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission,
    hasRole,
    getCurrentOrganization,
    getFullName,
    getInitials,
  };
}
