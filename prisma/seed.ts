import {
  PrismaClient,
  PermissionResource,
  PermissionAction,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Helper function to generate random number between min and max (inclusive)
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random consumption between 5 and 50 m³
function randomConsumption(): number {
  return Math.round((Math.random() * 45 + 5) * 10) / 10; // 5.0 to 50.0 with 1 decimal
}

// Helper function to get random month/year for the last 12 months
function getRandomMonthYear(): { month: number; year: number } {
  const now = new Date();
  const monthsBack = randomBetween(0, 11);
  const date = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

async function createRolesAndPermissions() {
  console.log("🔐 Creating roles and permissions...");

  // Create permissions first
  const permissions = [
    // Buildings
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.read,
      
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.update,
      
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.delete,
    },
    {
      resource: PermissionResource.buildings,
      action: PermissionAction.delete,
      
    },

    // Apartments
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.read,
      
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.update,
      
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.delete,
    },
    {
      resource: PermissionResource.apartments,
      action: PermissionAction.delete,
    },

    // Users
    {
      resource: PermissionResource.users,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.users,
      action: PermissionAction.read,
      
    },
    {
      resource: PermissionResource.users,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.users,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.users,
      action: PermissionAction.update,
      
    },
    {
      resource: PermissionResource.users,
      action: PermissionAction.delete,
    },

    // Water readings
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.read,
      
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.create,
      
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.update,
      
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.delete,
    },
    {
      resource: PermissionResource.water_readings,
      action: PermissionAction.delete,
    },

    // Invite codes
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.delete,
    },
    {
      resource: PermissionResource.invite_codes,
      action: PermissionAction.delete,
    },

    // Roles
    {
      resource: PermissionResource.roles,
      action: PermissionAction.read,
    },
    {
      resource: PermissionResource.roles,
      action: PermissionAction.create,
    },
    {
      resource: PermissionResource.roles,
      action: PermissionAction.update,
    },
    {
      resource: PermissionResource.roles,
      action: PermissionAction.delete,
    },

    // Admin grant (ability to grant admin role)
    {
      resource: PermissionResource.admin_grant,
      action: PermissionAction.create,
    },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: perm,
    });
    createdPermissions.push(permission);
  }

  // Create system roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: "SUPER_ADMIN",
      description: "Super administrator with full access to everything",
      isSystem: true,
    },
  });

  const administratorRole = await prisma.role.create({
    data: {
      name: "ADMINISTRATOR",
      description: "Building administrator with management permissions",
      isSystem: true,
    },
  });

  const ownerRole = await prisma.role.create({
    data: {
      name: "OWNER",
      description: "Apartment owner with limited permissions",
      isSystem: true,
    },
  });

  const basicUserRole = await prisma.role.create({
    data: {
      name: "BASIC_USER",
      description: "Basic user with minimal permissions",
      isSystem: true,
    },
  });

  // Assign permissions to SUPER_ADMIN (all permissions)
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign permissions to ADMINISTRATOR
  const adminPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === "buildings" &&
        ["read", "create", "update", "delete"].includes(p.action) &&
      (p.resource === "apartments" &&
        ["read", "create", "update", "delete"].includes(p.action) &&
      (p.resource === "users" &&
        ["read", "create", "update"].includes(p.action) &&
      (p.resource === "water_readings" &&
        ["read", "create", "update", "delete"].includes(p.action) &&
      (p.resource === "invite_codes" &&
        ["read", "create", "update", "delete"].includes(p.action) &&
      (p.resource === "admin_grant" && p.action === "create")
  );

  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: administratorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign permissions to OWNER
  const ownerPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === "apartments" &&
        p.action === "read" &&
      (p.resource === "users" &&
        ["read", "update"].includes(p.action) &&
      (p.resource === "water_readings" &&
        ["read", "create", "update"].includes(p.action) &&
      (p.resource === "invite_codes" &&
        p.action === "read" &&
  );

  for (const permission of ownerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: ownerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Assign permissions to BASIC_USER
  const basicPermissions = createdPermissions.filter(
    (p) =>
      p.resource === "users" &&
      ["read", "update"].includes(p.action) &&
  );

  for (const permission of basicPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: basicUserRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✅ Created roles and permissions");

  return {
    superAdminRole,
    administratorRole,
    ownerRole,
    basicUserRole,
  };
}

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.waterReading.deleteMany();
  await prisma.inviteCode.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.building.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.administrator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // Create roles and permissions
  const { superAdminRole, administratorRole, ownerRole, basicUserRole } =
    await createRolesAndPermissions();

  // Create SUPER_ADMIN user
  console.log("👑 Creating SUPER_ADMIN...");
  const superAdminPassword = await hashPassword("superadmin123");

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@test.com",
      password: superAdminPassword,
      firstName: "Super",
      lastName: "Admin",
      phone: "+40123456700",
      roleId: superAdminRole.id,
    },
    include: {
      role: true,
    },
  });

  console.log("✅ Created SUPER_ADMIN");

  // Create 2 administrators
  console.log("👨‍💼 Creating administrators...");
  const adminPassword = await hashPassword("admin123");

  const admin1 = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: adminPassword,
      firstName: "Alexandru",
      lastName: "Popescu",
      phone: "+40123456789",
      roleId: administratorRole.id,
      administrator: {
        create: {},
      },
    },
    include: {
      administrator: true,
      role: true,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "admin2@test.com",
      password: adminPassword,
      firstName: "Maria",
      lastName: "Ionescu",
      phone: "+40123456790",
      roleId: administratorRole.id,
      administrator: {
        create: {},
      },
    },
    include: {
      administrator: true,
      role: true,
    },
  });

  console.log("✅ Created 2 administrators");

  // Building configurations
  const buildingConfigs = [
    // Admin 1 buildings
    {
      admin: admin1,
      name: "Bloc Primăverii A1",
      address: "Strada Primăverii 12",
      city: "București",
      postalCode: "012345",
      floors: 10,
      apartmentsPerFloor: 4,
      hasElevator: true,
      hasParking: true,
      hasGarden: false,
    },
    {
      admin: admin1,
      name: "Bloc Florilor B2",
      address: "Strada Florilor 34",
      city: "București",
      postalCode: "012346",
      floors: 4,
      apartmentsPerFloor: 14,
      hasElevator: false,
      hasParking: true,
      hasGarden: true,
    },
    {
      admin: admin1,
      name: "Bloc Trandafirilor C3",
      address: "Strada Trandafirilor 56",
      city: "București",
      postalCode: "012347",
      floors: 10,
      apartmentsPerFloor: 4,
      hasElevator: true,
      hasParking: false,
      hasGarden: true,
    },
    // Admin 2 buildings
    {
      admin: admin2,
      name: "Bloc Unirii D1",
      address: "Bulevardul Unirii 78",
      city: "Cluj-Napoca",
      postalCode: "400123",
      floors: 4,
      apartmentsPerFloor: 14,
      hasElevator: false,
      hasParking: true,
      hasGarden: false,
    },
    {
      admin: admin2,
      name: "Bloc Libertății E2",
      address: "Strada Libertății 90",
      city: "Cluj-Napoca",
      postalCode: "400124",
      floors: 10,
      apartmentsPerFloor: 4,
      hasElevator: true,
      hasParking: true,
      hasGarden: true,
    },
  ];

  console.log("🏢 Creating buildings and apartments...");

  const allApartments = [];

  for (const config of buildingConfigs) {
    const building = await prisma.building.create({
      data: {
        name: config.name,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        administratorId: config.admin.administrator!.id,
        readingDeadline: randomBetween(20, 30),
        hasElevator: config.hasElevator,
        hasParking: config.hasParking,
        hasGarden: config.hasGarden,
      },
    });

    console.log(`📍 Created building: ${config.name}`);

    // Create apartments
    for (let floor = 0; floor <= config.floors; floor++) {
      // Use the configured apartmentsPerFloor for all floors consistently
      const apartmentsOnFloor = config.apartmentsPerFloor;

      for (let aptNum = 1; aptNum <= apartmentsOnFloor; aptNum++) {
        const apartmentNumber =
          floor === 0
            ? `${aptNum}`
            : `${floor}${aptNum.toString().padStart(2, "0")}`;

        const apartment = await prisma.apartment.create({
          data: {
            number: apartmentNumber,
            floor: floor,
            rooms: randomBetween(2, 4),
            buildingId: building.id,
          },
        });

        allApartments.push(apartment);
      }
    }

    console.log(
      `    🏠 Created ${
        (config.floors + 1) * config.apartmentsPerFloor
      } apartments`
    );
  }

  console.log(
    `✅ Created ${buildingConfigs.length} buildings with ${allApartments.length} total apartments`
  );

  // Create owners
  console.log("👥 Creating owners...");
  const ownerPassword = await hashPassword("owner123");
  const owners = [];

  // Calculate how many owners we need
  const totalApartments = allApartments.length;
  const ownersWithOneApartment = Math.floor(totalApartments * 0.9); // 90% own 1 apartment
  const remainingApartments = totalApartments - ownersWithOneApartment;

  // Create owners with 1 apartment (90%)
  for (let i = 0; i < ownersWithOneApartment; i++) {
    const owner = await prisma.user.create({
      data: {
        email: `owner${i + 1}@test.com`,
        password: ownerPassword,
        firstName: `Proprietar${i + 1}`,
        lastName: `Nume${i + 1}`,
        phone: `+4012345${(6800 + i).toString()}`,
        roleId: ownerRole.id,
        owner: {
          create: {},
        },
      },
      include: {
        owner: true,
        role: true,
      },
    });
    owners.push(owner);
  }

  // Create owners with 2-5 apartments (remaining 10%)
  let apartmentIndex = ownersWithOneApartment;
  let ownerIndex = ownersWithOneApartment;

  while (apartmentIndex < totalApartments) {
    const apartmentsForThisOwner = Math.min(
      randomBetween(2, 5),
      totalApartments - apartmentIndex
    );

    const owner = await prisma.user.create({
      data: {
        email: `owner${ownerIndex + 1}@test.com`,
        password: ownerPassword,
        firstName: `Proprietar${ownerIndex + 1}`,
        lastName: `Nume${ownerIndex + 1}`,
        phone: `+4012345${(6800 + ownerIndex).toString()}`,
        roleId: ownerRole.id,
        owner: {
          create: {},
        },
      },
      include: {
        owner: true,
        role: true,
      },
    });
    owners.push(owner);

    apartmentIndex += apartmentsForThisOwner;
    ownerIndex++;
  }

  console.log(`✅ Created ${owners.length} owners`);

  // Assign 1 apartment to first 90% of owners
  for (
    let i = 0;
    i < ownersWithOneApartment && apartmentIndex < totalApartments;
    i++
  ) {
    await prisma.apartment.update({
      where: { id: allApartments[apartmentIndex].id },
      data: { ownerId: owners[i].owner!.id },
    });
    apartmentIndex++;
  }

  // Assign multiple apartments to remaining owners
  for (
    let i = ownersWithOneApartment;
    i < owners.length && apartmentIndex < totalApartments;
    i++
  ) {
    const apartmentsForThisOwner = Math.min(
      randomBetween(2, 5),
      totalApartments - apartmentIndex
    );

    for (let j = 0; j < apartmentsForThisOwner; j++) {
      await prisma.apartment.update({
        where: { id: allApartments[apartmentIndex].id },
        data: { ownerId: owners[i].owner!.id },
      });
      apartmentIndex++;
    }
  }

  console.log(
    `✅ Assigned ${apartmentIndex} apartments to owners, ${
      totalApartments - apartmentIndex
    } left for invite codes`
  );

  // Create water readings for apartments with owners
  console.log("💧 Creating water readings...");
  const apartmentsWithOwners = allApartments.slice(0, apartmentIndex);
  let totalReadings = 0;

  for (const apartment of apartmentsWithOwners) {
    // Create 3-8 readings per apartment over the last 12 months
    const readingsCount = randomBetween(3, 8);

    for (let i = 0; i < readingsCount; i++) {
      const { month, year } = getRandomMonthYear();
      const reading = randomConsumption();

      try {
        await prisma.waterReading.create({
          data: {
            apartmentId: apartment.id,
            day: randomBetween(1, 25),
            month,
            year,
            reading,
            submittedBy: "system", // System generated for seed
            isValidated: randomBetween(1, 10) > 2, // 80% validated
            validatedAt: randomBetween(1, 10) > 2 ? new Date() : null,
            validatedBy: randomBetween(1, 10) > 2 ? "system" : null,
          },
        });
        totalReadings++;
      } catch (error) {
        // Skip if duplicate (same apartment, month, year)
        continue;
      }
    }
  }

  console.log(`✅ Created ${totalReadings} water readings`);

  // Create invite codes for some empty apartments
  console.log("🎫 Creating invite codes...");
  const emptyApartments = allApartments.slice(apartmentIndex);
  const inviteCodesCount = Math.min(5, emptyApartments.length); // Create max 5 invite codes

  for (let i = 0; i < inviteCodesCount; i++) {
    const apartment = emptyApartments[i];
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Find the administrator for this apartment's building
    const building = await prisma.building.findUnique({
      where: { id: apartment.buildingId },
      include: { administrator: true },
    });

    if (building) {
      await prisma.inviteCode.create({
        data: {
          code,
          apartmentId: apartment.id,
          createdBy: building.administrator.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }
  }

  console.log(`✅ Created ${inviteCodesCount} invite codes`);

  // Summary
  console.log("\n🎉 Seed completed successfully!");
  console.log("📊 Summary:");
  console.log(`   • Roles: 4 system roles with granular permissions`);
  console.log(
    `   • Permissions: ${await prisma.permission.count()} total permissions`
  );
  console.log(`   • SUPER_ADMIN: 1`);
  console.log(`   • Administrators: 2`);
  console.log(`   • Buildings: ${buildingConfigs.length}`);
  console.log(`   • Apartments: ${allApartments.length} total`);
  console.log(`   • Owners: ${owners.length}`);
  console.log(`   • Assigned apartments: ${apartmentIndex}`);
  console.log(`   • Empty apartments: ${totalApartments - apartmentIndex}`);
  console.log(`   • Water readings: ${totalReadings}`);
  console.log(`   • Invite codes: ${inviteCodesCount}`);
  console.log("\n🔑 Test credentials:");
  console.log("   Super Admin: superadmin@test.com / superadmin123");
  console.log("   Admin: admin@test.com / admin123");
  console.log("   Admin 2: admin2@test.com / admin123");
  console.log("   Owner: owner1@test.com / owner123");
  console.log("   (More owners: owner2@test.com, owner3@test.com, etc.)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
