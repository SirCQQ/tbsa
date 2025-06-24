import { PrismaClient, ResourcesEnum, ActionsEnum } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function seedCoreSystem() {
  console.log("🌱 Seeding core system data...");

  // 1. Create Modules
  console.log("📦 Creating modules...");
  const modules = [
    {
      name: "User Management",
      code: "USER_MANAGEMENT",
      description: "Manage users, roles, and permissions",
    },
    {
      name: "Building Management",
      code: "BUILDING_MANAGEMENT",
      description: "Manage buildings and apartments",
    },
    {
      name: "Water Reading",
      code: "WATER_READING",
      description: "Water meter readings and management",
    },
    {
      name: "Billing",
      code: "BILLING",
      description: "Billing and payment management",
    },
    {
      name: "Notifications",
      code: "NOTIFICATIONS",
      description: "Email and SMS notifications",
    },
    {
      name: "Reports",
      code: "REPORTS",
      description: "Analytics and reporting",
    },
    {
      name: "API Access",
      code: "API_ACCESS",
      description: "API access and integrations",
    },
    {
      name: "Priority Support",
      code: "PRIORITY_SUPPORT",
      description: "Priority customer support",
    },
  ];

  const createdModules = await Promise.all(
    modules.map((module) =>
      prisma.module.upsert({
        where: { code: module.code },
        update: module,
        create: module,
      })
    )
  );

  console.log(`✅ Created ${createdModules.length} modules`);

  // 2. Create Subscription Plans
  console.log("💳 Creating subscription plans...");
  const subscriptionPlans = [
    {
      name: "Starter",
      price: 499,
      billingPeriod: "monthly",
      maxBuildings: 1,
      maxApartments: 50,
      features: {
        waterReadings: true,
        automaticBilling: true,
        basicReports: true,
        emailSupport: true,
        maxUsers: 5,
        apiAccess: false,
        prioritySupport: false,
        customReports: false,
        smsNotifications: false,
        dedicatedManager: false,
      },
    },
    {
      name: "Professional",
      price: 1299,
      billingPeriod: "monthly",
      maxBuildings: 3,
      maxApartments: 200,
      features: {
        waterReadings: true,
        automaticBilling: true,
        basicReports: true,
        advancedReports: true,
        emailSupport: true,
        phoneSupport: true,
        maxUsers: 15,
        automaticNotifications: true,
        apiAccess: false,
        prioritySupport: false,
        customReports: false,
        smsNotifications: true,
        dedicatedManager: true,
      },
    },
    {
      name: "Enterprise",
      price: 1999,
      billingPeriod: "monthly",
      maxBuildings: null, // Unlimited
      maxApartments: 500,
      features: {
        waterReadings: true,
        automaticBilling: true,
        basicReports: true,
        advancedReports: true,
        customReports: true,
        emailSupport: true,
        phoneSupport: true,
        prioritySupport: true,
        maxUsers: null, // Unlimited
        automaticNotifications: true,
        customApi: true,
        apiAccess: true,
        teamTraining: true,
        customImplementation: true,
        smsNotifications: true,
        dedicatedManager: true,
      },
    },
  ];

  const createdPlans = [];
  for (const plan of subscriptionPlans) {
    // Check if plan exists first
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name },
    });

    if (existingPlan) {
      const updatedPlan = await prisma.subscriptionPlan.update({
        where: { id: existingPlan.id },
        data: {
          price: plan.price,
          billingPeriod: plan.billingPeriod,
          maxBuildings: plan.maxBuildings,
          maxApartments: plan.maxApartments,
          features: plan.features,
        },
      });
      createdPlans.push(updatedPlan);
    } else {
      const newPlan = await prisma.subscriptionPlan.create({
        data: plan,
      });
      createdPlans.push(newPlan);
    }
  }

  console.log(`✅ Created ${createdPlans.length} subscription plans`);

  // 3. Create Plan-Module relationships
  console.log("🔗 Creating plan-module relationships...");
  const planModuleRelations = [
    // Starter Plan
    { planName: "Starter", moduleCode: "USER_MANAGEMENT", isIncluded: true },
    {
      planName: "Starter",
      moduleCode: "BUILDING_MANAGEMENT",
      isIncluded: true,
    },
    { planName: "Starter", moduleCode: "WATER_READING", isIncluded: true },
    { planName: "Starter", moduleCode: "BILLING", isIncluded: true },
    { planName: "Starter", moduleCode: "NOTIFICATIONS", isIncluded: false },
    { planName: "Starter", moduleCode: "REPORTS", isIncluded: true },
    { planName: "Starter", moduleCode: "API_ACCESS", isIncluded: false },
    { planName: "Starter", moduleCode: "PRIORITY_SUPPORT", isIncluded: false },

    // Professional Plan
    {
      planName: "Professional",
      moduleCode: "USER_MANAGEMENT",
      isIncluded: true,
    },
    {
      planName: "Professional",
      moduleCode: "BUILDING_MANAGEMENT",
      isIncluded: true,
    },
    { planName: "Professional", moduleCode: "WATER_READING", isIncluded: true },
    { planName: "Professional", moduleCode: "BILLING", isIncluded: true },
    { planName: "Professional", moduleCode: "NOTIFICATIONS", isIncluded: true },
    { planName: "Professional", moduleCode: "REPORTS", isIncluded: true },
    { planName: "Professional", moduleCode: "API_ACCESS", isIncluded: false },
    {
      planName: "Professional",
      moduleCode: "PRIORITY_SUPPORT",
      isIncluded: false,
    },

    // Enterprise Plan
    { planName: "Enterprise", moduleCode: "USER_MANAGEMENT", isIncluded: true },
    {
      planName: "Enterprise",
      moduleCode: "BUILDING_MANAGEMENT",
      isIncluded: true,
    },
    { planName: "Enterprise", moduleCode: "WATER_READING", isIncluded: true },
    { planName: "Enterprise", moduleCode: "BILLING", isIncluded: true },
    { planName: "Enterprise", moduleCode: "NOTIFICATIONS", isIncluded: true },
    { planName: "Enterprise", moduleCode: "REPORTS", isIncluded: true },
    { planName: "Enterprise", moduleCode: "API_ACCESS", isIncluded: true },
    {
      planName: "Enterprise",
      moduleCode: "PRIORITY_SUPPORT",
      isIncluded: true,
    },
  ];

  for (const relation of planModuleRelations) {
    const plan = createdPlans.find((p) => p.name === relation.planName);
    const module = createdModules.find((m) => m.code === relation.moduleCode);

    if (plan && module) {
      await prisma.planModule.upsert({
        where: {
          subscriptionPlanId_moduleId: {
            subscriptionPlanId: plan.id,
            moduleId: module.id,
          },
        },
        update: {
          isIncluded: relation.isIncluded,
        },
        create: {
          subscriptionPlanId: plan.id,
          moduleId: module.id,
          isIncluded: relation.isIncluded,
        },
      });
    }
  }

  console.log("✅ Created plan-module relationships");

  // 4. Create System Roles
  console.log("👥 Creating system roles...");
  const systemRoles = [
    {
      name: "Super Administrator",
      code: "SUPER_ADMIN",
      description: "Global system administrator with full access",
      isSystem: true,
    },
    {
      name: "Administrator",
      code: "ADMINISTRATOR",
      description: "Organization administrator with full organization access",
      isSystem: true,
    },
    {
      name: "Owner",
      code: "OWNER",
      description: "Property owner with building management access",
      isSystem: true,
    },
    {
      name: "Tenant",
      code: "TENANT",
      description: "Property tenant with limited access",
      isSystem: true,
    },
    {
      name: "Manager",
      code: "MANAGER",
      description: "Building manager with administrative access",
      isSystem: true,
    },
  ];

  const createdRoles = await Promise.all(
    systemRoles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: role,
        create: role,
      })
    )
  );

  console.log(`✅ Created ${createdRoles.length} system roles`);

  // 5. Create System Permissions
  console.log("🔐 Creating system permissions...");
  const permissions = [
    // User permissions
    {
      resource: ResourcesEnum.USERS,
      action: ActionsEnum.READ,
      name: "View Users",
      description: "View user list and details",
    },
    {
      resource: ResourcesEnum.USERS,
      action: ActionsEnum.CREATE,
      name: "Create Users",
      description: "Create new users",
    },
    {
      resource: ResourcesEnum.USERS,
      action: ActionsEnum.UPDATE,
      name: "Update Users",
      description: "Update user information",
    },
    {
      resource: ResourcesEnum.USERS,
      action: ActionsEnum.DELETE,
      name: "Delete Users",
      description: "Delete users",
    },

    // Organization permissions
    {
      resource: ResourcesEnum.ORGANIZATIONS,
      action: ActionsEnum.READ,
      name: "View Organizations",
      description: "View organization details",
    },
    {
      resource: ResourcesEnum.ORGANIZATIONS,
      action: ActionsEnum.UPDATE,
      name: "Update Organizations",
      description: "Update organization information",
    },

    // Building permissions
    {
      resource: ResourcesEnum.BUILDINGS,
      action: ActionsEnum.READ,
      name: "View Buildings",
      description: "View building list and details",
    },
    {
      resource: ResourcesEnum.BUILDINGS,
      action: ActionsEnum.CREATE,
      name: "Create Buildings",
      description: "Create new buildings",
    },
    {
      resource: ResourcesEnum.BUILDINGS,
      action: ActionsEnum.UPDATE,
      name: "Update Buildings",
      description: "Update building information",
    },
    {
      resource: ResourcesEnum.BUILDINGS,
      action: ActionsEnum.DELETE,
      name: "Delete Buildings",
      description: "Delete buildings",
    },

    // Apartment permissions
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.READ,
      name: "View Apartments",
      description: "View apartment list and details",
    },
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.CREATE,
      name: "Create Apartments",
      description: "Create new apartments",
    },
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.UPDATE,
      name: "Update Apartments",
      description: "Update apartment information",
    },
    {
      resource: ResourcesEnum.APARTMENTS,
      action: ActionsEnum.DELETE,
      name: "Delete Apartments",
      description: "Delete apartments",
    },

    // Water reading permissions
    {
      resource: ResourcesEnum.WATER_READINGS,
      action: ActionsEnum.READ,
      name: "View Water Readings",
      description: "View water meter readings",
    },
    {
      resource: ResourcesEnum.WATER_READINGS,
      action: ActionsEnum.CREATE,
      name: "Submit Water Readings",
      description: "Submit new water readings",
    },
    {
      resource: ResourcesEnum.WATER_READINGS,
      action: ActionsEnum.UPDATE,
      name: "Update Water Readings",
      description: "Update water readings",
    },
    {
      resource: ResourcesEnum.WATER_READINGS,
      action: ActionsEnum.DELETE,
      name: "Delete Water Readings",
      description: "Delete water readings",
    },

    // Water meter permissions
    {
      resource: ResourcesEnum.WATER_METERS,
      action: ActionsEnum.READ,
      name: "View Water Meters",
      description: "View water meter list and details",
    },
    {
      resource: ResourcesEnum.WATER_METERS,
      action: ActionsEnum.CREATE,
      name: "Create Water Meters",
      description: "Create new water meters",
    },
    {
      resource: ResourcesEnum.WATER_METERS,
      action: ActionsEnum.UPDATE,
      name: "Update Water Meters",
      description: "Update water meter information",
    },
    {
      resource: ResourcesEnum.WATER_METERS,
      action: ActionsEnum.DELETE,
      name: "Delete Water Meters",
      description: "Delete water meters",
    },

    // Invite code permissions
    {
      resource: ResourcesEnum.INVITE_CODES,
      action: ActionsEnum.READ,
      name: "View Invite Codes",
      description: "View invite codes",
    },
    {
      resource: ResourcesEnum.INVITE_CODES,
      action: ActionsEnum.CREATE,
      name: "Create Invite Codes",
      description: "Create new invite codes",
    },
    {
      resource: ResourcesEnum.INVITE_CODES,
      action: ActionsEnum.UPDATE,
      name: "Update Invite Codes",
      description: "Update invite codes",
    },
    {
      resource: ResourcesEnum.INVITE_CODES,
      action: ActionsEnum.DELETE,
      name: "Delete Invite Codes",
      description: "Delete invite codes",
    },

    // Role and permission management
    {
      resource: ResourcesEnum.ROLES,
      action: ActionsEnum.READ,
      name: "View Roles",
      description: "View system roles",
    },
    {
      resource: ResourcesEnum.PERMISSIONS,
      action: ActionsEnum.READ,
      name: "View Permissions",
      description: "View system permissions",
    },

    // Administrator permissions
    {
      resource: ResourcesEnum.ADMINISTRATOR,
      action: ActionsEnum.READ,
      name: "Administrator Read",
      description: "Administrator read access",
    },
    {
      resource: ResourcesEnum.ADMINISTRATOR,
      action: ActionsEnum.CREATE,
      name: "Administrator Create",
      description: "Administrator create access",
    },
    {
      resource: ResourcesEnum.ADMINISTRATOR,
      action: ActionsEnum.UPDATE,
      name: "Administrator Update",
      description: "Administrator update access",
    },
    {
      resource: ResourcesEnum.ADMINISTRATOR,
      action: ActionsEnum.DELETE,
      name: "Administrator Delete",
      description: "Administrator delete access",
    },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((permission) =>
      prisma.permission.upsert({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
        update: {
          name: permission.name,
          description: permission.description,
          code: `${permission.resource}:${permission.action}`.toUpperCase(),
        },
        create: {
          ...permission,
          code: `${permission.resource}:${permission.action}`.toUpperCase(),
        },
      })
    )
  );

  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // 6. Create Role-Permission relationships
  console.log("🔗 Creating role-permission relationships...");

  // Super Admin gets all permissions
  const superAdminRole = createdRoles.find((r) => r.code === "SUPER_ADMIN");
  if (superAdminRole) {
    for (const permission of createdPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Administrator gets most permissions (excluding super admin ones)
  const adminRole = createdRoles.find((r) => r.code === "ADMINISTRATOR");
  const adminPermissions = createdPermissions.filter(
    (p) =>
      !p.code.includes("ADMIN_GRANT") &&
      !p.code.includes("SUBSCRIPTION_PLANS") &&
      !p.code.includes("MODULES")
  );

  if (adminRole) {
    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Owner gets building/apartment/water reading permissions
  const ownerRole = createdRoles.find((r) => r.code === "OWNER");
  const ownerPermissions = createdPermissions.filter(
    (p) =>
      p.code.includes("BUILDINGS:") ||
      p.code.includes("APARTMENTS:") ||
      p.code.includes("WATER_READINGS:") ||
      p.code.includes("WATER_METERS:")
  );

  if (ownerRole) {
    for (const permission of ownerPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Tenant gets limited permissions
  const tenantRole = createdRoles.find((r) => r.code === "TENANT");
  const tenantPermissions = createdPermissions.filter(
    (p) => p.code.includes(":READ") || p.code === "WATER_READINGS:CREATE"
  );

  if (tenantRole) {
    for (const permission of tenantPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: tenantRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: tenantRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ Created role-permission relationships");

  // 7. Create Global Admin User
  console.log("👤 Creating global admin user...");
  const adminEmail = "admin@tbsa.ro";
  const adminPassword = await hash("AdminTBSA2024!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: "System",
      lastName: "Administrator",
      password: adminPassword,
      isActive: true,
      isVerified: true,
    },
  });

  // Assign Super Admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole!.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole!.id,
    },
  });

  console.log("✅ Created global admin user");
  console.log(`📧 Admin email: ${adminEmail}`);
  console.log(`🔑 Admin password: AdminTBSA2024!`);

  console.log("🎉 Core system seeding completed!");
}
