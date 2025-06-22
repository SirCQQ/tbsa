# PermissionGuard Component Documentation

A flexible, reusable React component for handling permission-based access control with support for OR/AND logic, redirection, and loading states.

## Features

- **OR Logic**: Show content if user has ANY one of the specified permissions
- **AND Logic**: Show content if user has ALL of the specified permissions  
- **Combined Logic**: Use both OR and AND conditions together
- **Redirection**: Automatically redirect users without permissions
- **Loading States**: Custom loading components while permissions are checked
- **Fallback Content**: Custom content when access is denied
- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Convenience Components**: Simplified components for common use cases
- **Custom Hook**: `usePermissions` hook for programmatic permission checks

## Installation

The component is already integrated into the project. Import it from:

```typescript
import { 
  PermissionGuard, 
  PermissionGuardOr, 
  PermissionGuardAnd, 
  usePermissions 
} from "@/components/auth/permission-guard";
```

## Basic Usage

### OR Permissions (ANY)

Show content if user has ANY one of the specified permissions:

```typescript
<PermissionGuardOr
  permissions={["buildings:read", "buildings:create", "buildings:update"]}
  fallback={<div>You need at least one building permission.</div>}
>
  <BuildingManagement />
</PermissionGuardOr>
```

### AND Permissions (ALL)

Show content if user has ALL of the specified permissions:

```typescript
<PermissionGuardAnd
  permissions={["users:read", "users:create", "users:update"]}
  fallback={<div>You need all user management permissions.</div>}
>
  <UserManagement />
</PermissionGuardAnd>
```

### Combined OR and AND Logic

Show content if user satisfies both OR and AND conditions:

```typescript
<PermissionGuard
  orPermissions={["buildings:read", "apartments:read"]} // User needs at least one
  andPermissions={["users:read", "organizations:read"]} // AND all of these
  fallback={<div>Insufficient permissions</div>}
>
  <AdvancedDashboard />
</PermissionGuard>
```

## Advanced Features

### Redirection

Automatically redirect users without permissions:

```typescript
<PermissionGuard
  orPermissions={["admin:access"]}
  withRedirect={true}
  redirectUrl="/auth/login?error=insufficient_permissions"
>
  <AdminPanel />
</PermissionGuard>
```

### Custom Loading State

Show custom loading content while permissions are being checked:

```typescript
<PermissionGuard
  orPermissions={["buildings:read"]}
  loading={
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  }
  fallback={<div>Access denied</div>}
>
  <BuildingsList />
</PermissionGuard>
```

### Nested Permission Guards

Use multiple permission guards for granular access control:

```typescript
<PermissionGuardOr
  permissions={["organizations:read"]}
  fallback={<div>Need organization access</div>}
>
  <div>
    <h2>Organization Dashboard</h2>
    <p>Basic organization info visible to all users with organization:read</p>
    
    {/* Nested guard for admin features */}
    <PermissionGuardAnd
      permissions={["organizations:update", "users:read"]}
      fallback={<div>Admin features require additional permissions</div>}
    >
      <AdminFeatures />
    </PermissionGuardAnd>
  </div>
</PermissionGuardOr>
```

## usePermissions Hook

For programmatic permission checks in components:

```typescript
function MyComponent() {
  const { hasAnyPermission, hasAllPermissions, hasExactPermissions } = usePermissions();

  const canManageBuildings = hasAnyPermission([
    "buildings:create", 
    "buildings:update", 
    "buildings:delete"
  ]);
  
  const canFullyManageUsers = hasAllPermissions([
    "users:read", 
    "users:create", 
    "users:update", 
    "users:delete"
  ]);
  
  const canAccessDashboard = hasExactPermissions(
    ["buildings:read", "apartments:read"], // OR permissions
    ["organizations:read"] // AND permissions
  );

  return (
    <div>
      {canManageBuildings && <Button>Manage Buildings</Button>}
      {canFullyManageUsers && <Button>Full User Management</Button>}
      {canAccessDashboard && <Button>Access Dashboard</Button>}
    </div>
  );
}
```

## API Reference

### PermissionGuard Props

```typescript
type PermissionGuardProps = {
  children: ReactNode;
  orPermissions?: string[];        // Array of permissions (ANY one must be satisfied)
  andPermissions?: string[];       // Array of permissions (ALL must be satisfied)
  withRedirect?: boolean;          // Whether to redirect on permission failure
  redirectUrl?: string;            // URL to redirect to (default: "/auth/login")
  fallback?: ReactNode;            // Component to show when access is denied
  loading?: ReactNode;             // Component to show while loading
};
```

### PermissionGuardOr Props

```typescript
type PermissionGuardOrProps = {
  children: ReactNode;
  permissions: string[];           // Array of permissions (ANY one must be satisfied)
  withRedirect?: boolean;
  redirectUrl?: string;
  fallback?: ReactNode;
  loading?: ReactNode;
};
```

### PermissionGuardAnd Props

```typescript
type PermissionGuardAndProps = {
  children: ReactNode;
  permissions: string[];           // Array of permissions (ALL must be satisfied)
  withRedirect?: boolean;
  redirectUrl?: string;
  fallback?: ReactNode;
  loading?: ReactNode;
};
```

### usePermissions Hook Returns

```typescript
type UsePermissionsReturn = {
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasExactPermissions: (orPermissions?: string[], andPermissions?: string[]) => boolean;
  checkPermissions: (orPermissions?: string[], andPermissions?: string[]) => boolean;
};
```

## Permission Format

Permissions must follow the `resource:action` format:

- **Valid**: `"buildings:read"`, `"users:create"`, `"organizations:update"`
- **Invalid**: `"buildings"`, `"read"`, `"buildings-read"`

### Common Permissions

- **Buildings**: `buildings:read`, `buildings:create`, `buildings:update`, `buildings:delete`
- **Users**: `users:read`, `users:create`, `users:update`, `users:delete`
- **Organizations**: `organizations:read`, `organizations:create`, `organizations:update`, `organizations:delete`
- **Apartments**: `apartments:read`, `apartments:create`, `apartments:update`, `apartments:delete`
- **Admin**: `admin:access`, `super_admin:access`

## Examples in Practice

### Protecting UI Elements

```typescript
// Protect buttons based on permissions
<div className="space-y-2">
  <PermissionGuardOr
    permissions={["buildings:create"]}
    fallback={
      <Button disabled title="No permission to create buildings">
        <Shield className="h-4 w-4 mr-2" />
        Access Restricted
      </Button>
    }
  >
    <Button onClick={handleCreateBuilding}>
      <Plus className="h-4 w-4 mr-2" />
      Add Building
    </Button>
  </PermissionGuardOr>
</div>
```

### Protecting Entire Sections

```typescript
// Protect entire page sections
<PermissionGuardOr
  permissions={["buildings:read", "buildings:create", "buildings:update"]}
  fallback={
    <Card>
      <CardContent className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3>Access Restricted</h3>
        <p>You don't have permission to view buildings.</p>
      </CardContent>
    </Card>
  }
>
  <BuildingsList />
</PermissionGuardOr>
```

### Complex Permission Logic

```typescript
// Complex business logic with multiple permission checks
<PermissionGuard
  orPermissions={[
    "buildings:read", 
    "apartments:read", 
    "water_readings:read"
  ]} // User needs property access
  andPermissions={[
    "organizations:read", 
    "users:read"
  ]} // AND management access
  fallback={
    <Alert>
      <AlertDescription>
        You need property access (buildings, apartments, or water readings) 
        AND management access (organizations and users) to view this dashboard.
      </AlertDescription>
    </Alert>
  }
>
  <ComprehensiveDashboard />
</PermissionGuard>
```

## Error Handling

The component handles various error scenarios gracefully:

1. **Invalid Permission Format**: Logs warning and continues with valid permissions
2. **Network Errors**: Shows loading state until resolved
3. **Authentication Failures**: Shows fallback or redirects as configured
4. **Missing Permissions**: Shows fallback content

```typescript
// The component will warn about invalid formats but continue working
<PermissionGuard
  orPermissions={["invalid-format", "buildings:read"]} // Will warn but still work
  fallback={<div>Access denied</div>}
>
  <Content />
</PermissionGuard>
```

## Testing

The component is fully tested with 19 test cases covering:

- Basic OR and AND permission logic
- Combined permission scenarios
- Authentication states (loading, authenticated, unauthenticated)
- Redirection functionality
- Convenience components
- Hook functionality
- Error handling

Run tests with:

```bash
yarn test tests/components/auth/permission-guard.test.tsx
```

## Integration with Existing Auth System

The component integrates seamlessly with the existing authentication system:

- Uses `useCurrentUser` hook for user data and permissions
- Leverages existing permission format (`resource:action`)
- Works with JWT-based permission storage
- Supports multi-tenant organization filtering

## Performance Considerations

- **Memoization**: Permission checks are memoized to prevent unnecessary re-renders
- **Lazy Evaluation**: Only checks permissions when user is authenticated
- **Efficient Updates**: Uses React's built-in optimization for permission state changes
- **Minimal Bundle Impact**: Tree-shakable exports and efficient dependency management

## Browser Support

Compatible with all modern browsers that support:
- React 18+
- ES2020+ features
- Next.js 15+

## Migration Guide

If you have existing permission checks, migrate them as follows:

### Before (Manual Checks)
```typescript
const { user, hasPermission } = useCurrentUser();

if (!user || !hasPermission("buildings", "read")) {
  return <div>Access denied</div>;
}

return <BuildingsList />;
```

### After (PermissionGuard)
```typescript
<PermissionGuardOr
  permissions={["buildings:read"]}
  fallback={<div>Access denied</div>}
>
  <BuildingsList />
</PermissionGuardOr>
```

## Contributing

When adding new permission-related features:

1. Follow the existing permission format (`resource:action`)
2. Add comprehensive tests for new functionality
3. Update this documentation with examples
4. Ensure TypeScript types are properly exported
5. Test with various permission combinations

## Troubleshooting

### Common Issues

1. **Component not rendering**: Check if user is authenticated and has valid session
2. **Permissions not working**: Verify permission format is `resource:action`
3. **Infinite redirects**: Ensure redirect URL doesn't require the same permissions
4. **Loading state stuck**: Check if authentication system is properly configured

### Debug Mode

Enable debug logging by checking browser console for permission-related warnings and errors.

## License

This component is part of the TBSA project and follows the same license terms. 