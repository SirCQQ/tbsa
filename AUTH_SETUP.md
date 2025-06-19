# Authentication System Setup Guide

This guide walks you through setting up the complete authentication system with NextAuth, Google OAuth, and credentials-based authentication.

## 🚀 Features

- **Google OAuth Authentication** - One-click sign-in with Google
- **Credentials Authentication** - Traditional email/password login
- **Multi-tenant Support** - Organization-based access control
- **Role-based Permissions** - Granular permission system
- **JWT Sessions** - Secure token-based sessions
- **Middleware Protection** - Automatic route protection
- **Permission Guards** - UI-level permission controls

## 📦 Dependencies

All required packages have been installed:

```bash
yarn add next-auth @next-auth/prisma-adapter bcryptjs
yarn add -D @types/bcryptjs
```

## 🔧 Environment Variables

Add these variables to your `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
DIRECT_URL="postgresql://username:password@localhost:5432/dbname"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set up the consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your `.env.local`

## 🗄️ Database Setup

The Prisma schema is already configured. Run the following commands:

```bash
# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

## 🔗 Integration

### 1. Add Session Provider to Root Layout

Update your `src/app/layout.tsx`:

```tsx
import { AuthSessionProvider } from "@/components/providers/session-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
```

### 2. Using Authentication in Components

#### Client Components

```tsx
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { usePermissions } from "@/components/auth/permission-guard"

export function ProfileComponent() {
  const { data: session, status } = useSession()
  const { hasPermission, user } = usePermissions()

  if (status === "loading") return <p>Loading...</p>
  
  if (!session) {
    return (
      <button onClick={() => signIn()}>
        Sign In
      </button>
    )
  }

  return (
    <div>
      <p>Welcome, {session.user.firstName}!</p>
      
      {hasPermission("users:create") && (
        <button>Create User</button>
      )}
      
      <button onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  )
}
```

#### Server Components

```tsx
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ServerPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  const canManageUsers = await hasPermission("users:create")

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      
      {canManageUsers && (
        <div>Admin controls here</div>
      )}
    </div>
  )
}
```

### 3. API Route Protection

```tsx
// src/app/api/users/route.ts
import { requirePermission } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Require specific permission
    const user = await requirePermission("users:read")
    
    const users = await prisma.user.findMany({
      where: {
        organizations: {
          some: {
            organizationId: user.currentOrganizationId
          }
        }
      }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
}
```

### 4. Permission Guards in UI

```tsx
import { PermissionGuard } from "@/components/auth/permission-guard"

export function UserManagement() {
  return (
    <div>
      <h1>User Management</h1>
      
      {/* Single permission */}
      <PermissionGuard permission="users:read">
        <UserList />
      </PermissionGuard>
      
      {/* Multiple permissions (ANY) */}
      <PermissionGuard 
        permissions={["users:create", "users:update"]}
        requireAll={false}
      >
        <CreateUserButton />
      </PermissionGuard>
      
      {/* Multiple permissions (ALL) */}
      <PermissionGuard 
        permissions={["users:create", "users:delete"]}
        requireAll={true}
        fallback={<AccessDeniedMessage />}
      >
        <AdminControls />
      </PermissionGuard>
    </div>
  )
}
```

## 🎯 Available Functions

### Server-side Functions

```tsx
import { 
  getCurrentUser, 
  requireAuth, 
  requirePermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  switchOrganization 
} from "@/lib/auth"

// Get current user (returns null if not authenticated)
const user = await getCurrentUser()

// Require authentication (throws error if not authenticated)
const user = await requireAuth()

// Require specific permission
const user = await requirePermission("users:create")

// Check single permission
const canRead = await hasPermission("users:read")

// Check multiple permissions (ANY)
const canManage = await hasAnyPermission(["users:create", "users:update"])

// Check multiple permissions (ALL)
const isAdmin = await hasAllPermissions(["users:create", "users:delete"])

// Switch user's current organization
await switchOrganization("org-id")
```

### Client-side Hook

```tsx
import { usePermissions } from "@/components/auth/permission-guard"

const {
  user,
  isAuthenticated,
  permissions,
  organizations,
  currentOrganizationId,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} = usePermissions()
```

## 🛡️ Permission System

### Permission Format

Permissions follow the format: `resource:action`

**Resources:**
- `users`, `organizations`, `buildings`, `apartments`
- `water_readings`, `water_meters`, `water_bills`
- `roles`, `permissions`, `invite_codes`

**Actions:**
- `read`, `create`, `update`, `delete`

**Examples:**
- `users:read` - Can view users
- `buildings:create` - Can create buildings
- `water_readings:update` - Can update water readings

### Default Roles

#### SUPER_ADMIN
- Has all permissions automatically

#### ADMINISTRATOR
- `buildings:*`, `users:read,create,update`
- `water_readings:*`, `roles:read`

#### OWNER
- `apartments:read`, `users:read,update`
- `water_readings:read,create,update`

#### TENANT
- `apartments:read`, `water_readings:read,create`

## 🚦 Middleware Configuration

The middleware automatically protects routes and handles redirects:

- **Public routes**: No authentication required
- **Auth pages**: Redirects authenticated users to dashboard
- **Protected routes**: Redirects unauthenticated users to sign-in
- **Organization routes**: Checks organization access

Routes starting with `/org/[slug]` are automatically protected and check if the user has access to that organization.

## 🧪 Testing Authentication

### Manual Testing

1. Start your development server: `yarn dev`
2. Visit `/auth/signin`
3. Try both Google OAuth and credentials login
4. Check that permissions work correctly
5. Test organization switching (if applicable)

### User Creation for Testing

```tsx
import { AuthService } from "@/services/auth.service"

// Create test user
const result = await AuthService.registerUser({
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  password: "password123",
  organizationId: "optional-org-id"
})
```

## 🔧 Customization

### Adding New Permissions

1. Update the `ResourcesEnum` and `ActionsEnum` in your Prisma schema
2. Create the permission in your database
3. Assign the permission to appropriate roles
4. Use the permission in your components and API routes

### Custom Authentication Providers

To add more providers (GitHub, Facebook, etc.):

1. Install the provider package
2. Add it to `src/lib/auth.ts`
3. Configure environment variables
4. Update the sign-in page

### Custom Session Data

To add more data to the session:

1. Update `src/types/auth.types.ts`
2. Modify the JWT and session callbacks in `src/lib/auth.ts`
3. Update the `AuthService.getUserWithPermissions` method

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid token" errors**: Check your `NEXTAUTH_SECRET`
2. **Google OAuth not working**: Verify redirect URIs in Google Console
3. **Permission checks failing**: Ensure user has been assigned proper roles
4. **Database connection issues**: Check your `DATABASE_URL`

### Debug Mode

Set `debug: true` in NextAuth options and check server logs for detailed information.

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

This authentication system provides a solid foundation for your multi-tenant application with comprehensive security and flexibility. 