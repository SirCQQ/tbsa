import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import {
  PermissionGuard,
  PermissionGuardOr,
  PermissionGuardAnd,
  usePermissions,
} from "@/components/auth/permission-guard";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ActionsEnum, ResourcesEnum } from "@prisma/client";
import { Session } from "next-auth";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<
  typeof useCurrentUser
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("PermissionGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  const mockUser: Session["user"] = {
    id: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    permissions: [
      `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
      `${ResourcesEnum.USERS}:${ActionsEnum.CREATE}`,
      `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
    ],
    roles: ["admin"],
    organizations: [{ id: "org-1", name: "Test Org", code: "TEST" }],
    currentOrganizationId: "org-1",
    isVerified: true,
    image: "https://example.com/image.png",
    name: "Test User",
  };

  const mockHasPermission = jest.fn();

  describe("Basic functionality", () => {
    it("should render children when user has required OR permissions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
          ]}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should render children when user has required AND permissions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          andPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
          ]}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should render fallback when user lacks OR permissions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
          ]}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render fallback when user lacks AND permissions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          andPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
          ]} // User has read but not delete
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("Combined OR and AND permissions", () => {
    it("should render children when user satisfies both OR and AND conditions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
          ]} // User has buildings:read
          andPermissions={[
            `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
          ]} // User has organizations:read
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should render fallback when user fails OR condition", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
          ]} // User has neither
          andPermissions={[
            `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
          ]} // User has this
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render fallback when user fails AND condition", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`]} // User has this
          andPermissions={[
            `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`,
          ]} // User missing buildings:delete
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("Authentication states", () => {
    it("should render fallback when user is not authenticated", () => {
      mockUseCurrentUser.mockReturnValue({
        //@ts-expect-error not expectiong null
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`]}
          fallback={<div>Please log in</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Please log in")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("should render loading component when loading", () => {
      mockUseCurrentUser.mockReturnValue({
        //@ts-expect-error not expectiong null
        user: null,
        isLoading: true,
        isAuthenticated: false,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`]}
          loading={<div>Loading permissions...</div>}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Loading permissions...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
    });

    it("should render nothing when loading and no loading component provided", () => {
      mockUseCurrentUser.mockReturnValue({
        //@ts-expect-error not expectiong null
        user: null,
        isLoading: true,
        isAuthenticated: false,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      const { container } = render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`]}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Redirection", () => {
    it("should redirect when withRedirect is true and user lacks permissions", async () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`]} // User doesn't have this
          withRedirect={true}
          redirectUrl="/access-denied"
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/access-denied");
      });
    });

    it("should use default redirect URL when none provided", async () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.DELETE}`]} // User doesn't have this
          withRedirect={true}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
      });
    });

    it("should not redirect when user has permissions", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuard
          orPermissions={[`${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`]} // User has this
          withRedirect={true}
          redirectUrl="/access-denied"
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  describe("Convenience components", () => {
    it("should work with PermissionGuardOr", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuardOr
          permissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
          ]}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuardOr>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("should work with PermissionGuardAnd", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      render(
        <PermissionGuardAnd
          permissions={[
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
            "organizations:read",
          ]}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuardAnd>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  describe("Invalid permission format", () => {
    it("should handle invalid permission format gracefully", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      mockHasPermission.mockImplementation(
        (resource: string, action: string) => {
          return mockUser.permissions.includes(`${resource}:${action}`);
        }
      );

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      render(
        <PermissionGuard
          orPermissions={[
            "invalid-permission",
            `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
          ]}
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid permission format: invalid-permission. Expected format: "resource:action"'
      );
      expect(screen.getByText("Protected Content")).toBeInTheDocument(); // Should still work with valid permission

      consoleSpy.mockRestore();
    });
  });

  describe("No permissions specified", () => {
    it("should allow access when no permissions are specified", () => {
      mockUseCurrentUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
        hasRole: jest.fn(),
        getCurrentOrganization: jest.fn(),
        getFullName: jest.fn(),
        getInitials: jest.fn(),
      });

      render(
        <PermissionGuard fallback={<div>Access Denied</div>}>
          <div>Protected Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });
});

describe("usePermissions hook", () => {
  const TestComponent = () => {
    const { hasAnyPermission, hasAllPermissions, hasExactPermissions } =
      usePermissions();

    const canManageBuildings = hasAnyPermission([
      `${ResourcesEnum.BUILDINGS}:${ActionsEnum.CREATE}`,
      `${ResourcesEnum.BUILDINGS}:${ActionsEnum.UPDATE}`,
    ]);
    const canFullyManageUsers = hasAllPermissions([
      `${ResourcesEnum.USERS}:${ActionsEnum.CREATE}`,
      `${ResourcesEnum.USERS}:${ActionsEnum.READ}`,
    ]);
    const canAccessDashboard = hasExactPermissions(
      [
        `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
        `${ResourcesEnum.APARTMENTS}:${ActionsEnum.READ}`,
      ],
      [`${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`]
    );

    return (
      <div>
        <div data-testid="manage-buildings">
          {canManageBuildings.toString()}
        </div>
        <div data-testid="manage-users">{canFullyManageUsers.toString()}</div>
        <div data-testid="access-dashboard">
          {canAccessDashboard.toString()}
        </div>
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser: Session["user"] = {
    id: "user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    permissions: [
      `${ResourcesEnum.BUILDINGS}:${ActionsEnum.READ}`,
      `${ResourcesEnum.USERS}:${ActionsEnum.CREATE}`,
      `${ResourcesEnum.ORGANIZATIONS}:${ActionsEnum.READ}`,
    ],
    roles: ["admin"],
    organizations: [{ id: "org-1", name: "Test Org", code: "TEST" }],
    currentOrganizationId: "org-1",
    isVerified: true,
    image: "https://example.com/image.png",
    name: "Test User",
  };

  const mockHasPermission = jest.fn();

  it("should return correct permission checks", () => {
    mockUseCurrentUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      hasPermission: mockHasPermission,
      hasRole: jest.fn(),
      getCurrentOrganization: jest.fn(),
      getFullName: jest.fn(),
      getInitials: jest.fn(),
    });

    mockHasPermission.mockImplementation((resource: string, action: string) => {
      return mockUser.permissions.includes(`${resource}:${action}`);
    });

    render(<TestComponent />);

    expect(screen.getByTestId("manage-buildings")).toHaveTextContent("false"); // No create/update permissions
    expect(screen.getByTestId("manage-users")).toHaveTextContent("false"); // Missing users:read
    expect(screen.getByTestId("access-dashboard")).toHaveTextContent("true"); // Has buildings:read and organizations:read
  });

  it("should return false when user is not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      //@ts-expect-error not expectiong null
      user: null,
      isLoading: false,
      isAuthenticated: false,
      hasPermission: mockHasPermission,
      hasRole: jest.fn(),
      getCurrentOrganization: jest.fn(),
      getFullName: jest.fn(),
      getInitials: jest.fn(),
    });

    render(<TestComponent />);

    expect(screen.getByTestId("manage-buildings")).toHaveTextContent("false");
    expect(screen.getByTestId("manage-users")).toHaveTextContent("false");
    expect(screen.getByTestId("access-dashboard")).toHaveTextContent("false");
  });
});
