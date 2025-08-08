import {
  PrismaClient,
  ResourcesEnum,
  ActionsEnum,
  SubscriptionBillingIntervalEnum,
  SubscriptionTypeEnum,
  Prisma,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function seedCoreSystem() {
  console.log("🌱 Seeding core system data...");

  // 1. Create Permissions (must be first)
  console.log("🔐 Creating permissions...");
  await seedPermissions();

  // 2. Create Roles
  console.log("👥 Creating roles...");
  await seedRoles();

  // // 3. Create Subscription Plans
  // console.log("💰 Creating subscription plans...");
  // await seedSubscriptionPlans();

  // 4. Create super admin
  await seedSuperAdminUser();

  console.log("✅ Core system seeding completed!");
}

async function seedPermissions() {
  // Define which actions are valid for each resource
  const resourceActionMap: Record<ResourcesEnum, ActionsEnum[]> = {
    // Core resources
    [ResourcesEnum.USERS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.ORGANIZATIONS]: [ActionsEnum.READ, ActionsEnum.UPDATE],
    [ResourcesEnum.BUILDINGS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.APARTMENTS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.WATER_READINGS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.WATER_METERS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.WATER_BILLS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.READING_NOTIFICATIONS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.INVITE_CODES]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],

    // Admin-only resources
    [ResourcesEnum.ROLES]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
    [ResourcesEnum.PERMISSIONS]: [
      ActionsEnum.READ,
      ActionsEnum.CREATE,
      ActionsEnum.UPDATE,
      ActionsEnum.DELETE,
    ],
  };

  const permissions = [];
  for (const [resource, actions] of Object.entries(resourceActionMap)) {
    for (const action of actions) {
      permissions.push({
        name: `${resource.toLowerCase().replace(/_/g, " ")} ${action.toLowerCase()}`,
        code: `${resource}:${action}`.toUpperCase(),
        resource: resource as ResourcesEnum,
        action: action as ActionsEnum,
        description: `Allow ${action.toLowerCase()} access to ${resource.toLowerCase().replace(/_/g, " ")}`,
      });
    }
  }

  // Create permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    });
  }

  console.log(`   ✅ Created ${permissions.length} permissions`);
}

async function seedRoles() {
  const roles = [
    {
      name: "Super Administrator",
      code: "SUPER_ADMIN",
      description: "Global system administrator with full access",
      isSystem: true,
    },
    {
      name: "Administrator",
      code: "ADMINISTRATOR",
      description: "Organization administrator",
      isSystem: true,
    },
    {
      name: "Owner",
      code: "OWNER",
      description: "Property owner",
      isSystem: true,
    },
    {
      name: "Tenant",
      code: "TENANT",
      description: "Property tenant/renter",
      isSystem: true,
    },
    {
      name: "Resident",
      code: "RESIDENT",
      description: "Generic resident (family member, etc.)",
      isSystem: true,
    },
  ];

  // Create roles
  const createdRoles = [];
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
    createdRoles.push(createdRole);
  }

  // Assign permissions to roles
  await assignPermissionsToRoles(createdRoles);

  console.log(`   ✅ Created ${roles.length} roles with permissions`);
}

async function assignPermissionsToRoles(roles: any[]) {
  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.code, p.id]));

  // Define role permission mappings
  const rolePermissions = {
    SUPER_ADMIN: allPermissions.map((p) => p.code), // All permissions

    ADMINISTRATOR: [
      // Base functionality
      "USERS:READ",
      "USERS:CREATE",
      "USERS:UPDATE",
      "USERS:DELETE",
      "ORGANIZATIONS:READ",
      "ORGANIZATIONS:UPDATE",
      "BUILDINGS:READ",
      "BUILDINGS:CREATE",
      "BUILDINGS:UPDATE",
      "BUILDINGS:DELETE",
      "APARTMENTS:READ",
      "APARTMENTS:CREATE",
      "APARTMENTS:UPDATE",
      "APARTMENTS:DELETE",
      "WATER_READINGS:READ",
      "WATER_READINGS:CREATE",
      "WATER_READINGS:UPDATE",
      "WATER_READINGS:DELETE",
      "BASIC_REPORTS:READ",
      // Premium features (if enabled)
      "BUILDING_BOARD:READ",
      "BUILDING_BOARD:CREATE",
      "BUILDING_BOARD:UPDATE",
      "BUILDING_BOARD:DELETE",
      "BILLING:READ",
      "BILLING:CREATE",
      "BILLING:UPDATE",
      "BILLING:DELETE",
      "NOTIFICATIONS:READ",
      "NOTIFICATIONS:CREATE",
      "NOTIFICATIONS:UPDATE",
      "NOTIFICATIONS:DELETE",
      "ADVANCED_REPORTS:READ",
      "SETTINGS:READ",
      "SETTINGS:UPDATE",
    ],

    OWNER: [
      // Limited user access
      "USERS:READ",
      "USERS:UPDATE", // Can view and update own profile
      "APARTMENTS:READ", // Can view their apartments
      "WATER_READINGS:READ",
      "WATER_READINGS:CREATE",
      "WATER_READINGS:UPDATE",
      "BASIC_REPORTS:READ",
      // Premium features (if enabled)
      "BUILDING_BOARD:READ",
      "BUILDING_BOARD:CREATE",
      "BILLING:READ",
      "NOTIFICATIONS:READ",
    ],

    TENANT: [
      "USERS:READ",
      "USERS:UPDATE", // Can view and update own profile
      "APARTMENTS:READ", // Can view their apartment
      "WATER_READINGS:READ",
      "WATER_READINGS:CREATE",
      "BASIC_REPORTS:READ",
      // Premium features (if enabled)
      "BUILDING_BOARD:READ",
      "NOTIFICATIONS:READ",
    ],

    RESIDENT: [
      "USERS:READ",
      "USERS:UPDATE", // Can view and update own profile
      "APARTMENTS:READ", // Can view apartment they live in
      "WATER_READINGS:READ",
      "BASIC_REPORTS:READ",
      // Premium features (if enabled)
      "BUILDING_BOARD:READ",
      "NOTIFICATIONS:READ",
    ],
  };

  // Assign permissions to each role
  for (const role of roles) {
    const permissionCodes =
      rolePermissions[role.code as keyof typeof rolePermissions] || [];

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionMap.get(permissionCode);
      if (permissionId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
      }
    }
  }
}

// async function seedSubscriptionPlans() {
//   const plans: Prisma.SubscriptionPlanCreateInput[] = [
//     {
//       name: "Bronze",
//       description: "Essential features for small buildings",
//       basePrice: 599.99,
//       billingInterval: SubscriptionBillingIntervalEnum.Monthly,
//       maxBuildings: 1,
//       maxApartments: 50,
//       maxUsers: 1,
//       subscriptionType: SubscriptionTypeEnum.Bronze,
//       popular: false,
//       cta: "Get Started",
//     },
//     {
//       name: "Silver",
//       description: "Perfect for medium-sized properties",
//       basePrice: 1000,
//       billingInterval: SubscriptionBillingIntervalEnum.Monthly,
//       maxBuildings: 3,
//       maxApartments: 150,
//       maxUsers: 3,
//       subscriptionType: SubscriptionTypeEnum.Silver,
//       popular: true,
//       cta: "Most Popular",
//     },
//     {
//       name: "Gold",
//       description: "Advanced features for large properties",
//       basePrice: 2500,
//       billingInterval: SubscriptionBillingIntervalEnum.Monthly,
//       maxBuildings: 10,
//       maxApartments: 500,
//       maxUsers: 10,
//       subscriptionType: SubscriptionTypeEnum.Gold,
//       popular: false,
//       cta: "Go Premium",
//     },
//     {
//       name: "Enterprise",
//       description: "Custom solution for enterprise clients",
//       basePrice: 0,
//       billingInterval: SubscriptionBillingIntervalEnum.Monthly,
//       maxBuildings: null, // Unlimited
//       maxApartments: null, // Unlimited
//       maxUsers: null, // Unlimited
//       subscriptionType: SubscriptionTypeEnum.Enterprise,
//       popular: false,
//       cta: "Contact Us",
//     },
//   ];

//   const createdPlans = await Promise.all(
//     plans.map((plan) =>
//       prisma.subscriptionPlan.upsert({
//         where: { name: plan.name },
//         update: { ...plan },
//         create: { ...plan },
//       })
//     )
//   );

//   console.log(`   ✅ Created ${createdPlans.length} subscription plans`);

//   //Create a super admin user with email gatucristian@gmail.com and password Parola123!
// }

async function seedSuperAdminUser() {
  console.log("👤 Creating super admin user...");

  const superAdminEmail = "gatucristian+admintbsa@gmail.com";
  const superAdminPassword = "Parola123!";

  // Hash the password
  const hashedPassword = await hash(superAdminPassword, 12);

  // Get SUPER_ADMIN role
  const superAdminRole = await prisma.role.findUnique({
    where: { code: "SUPER_ADMIN" },
  });

  if (!superAdminRole) {
    throw new Error(
      "SUPER_ADMIN role not found. Please run permissions seeding first."
    );
  }

  // Create super admin user
  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      firstName: "Cristian",
      lastName: "Gatu",
      isActive: true,
      isVerified: true,
    },
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      firstName: "Cristian",
      lastName: "Gatu",
      isActive: true,
      isVerified: true,
    },
  });

  // Assign SUPER_ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`   ✅ Created super admin user: ${superAdminEmail}`);
}
