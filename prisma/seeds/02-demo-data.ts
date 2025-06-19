import { PrismaClient, ApartmentRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { base, ro, en, Faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configure faker for Romanian locale
const faker = new Faker({ locale: [ro, en, base] });

export async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  // Get existing roles and subscription plans
  const adminRole = await prisma.role.findUnique({
    where: { code: "ADMINISTRATOR" },
  });
  const ownerRole = await prisma.role.findUnique({ where: { code: "OWNER" } });
  const tenantRole = await prisma.role.findUnique({
    where: { code: "TENANT" },
  });
  const managerRole = await prisma.role.findUnique({
    where: { code: "MANAGER" },
  });

  const starterPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Starter" },
  });
  const professionalPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Professional" },
  });
  const enterprisePlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Enterprise" },
  });

  if (!adminRole || !ownerRole || !tenantRole || !managerRole) {
    throw new Error(
      "System roles not found. Please run core system seed first."
    );
  }

  // 1. Create Demo Organizations
  console.log("🏢 Creating demo organizations...");

  const organizations = [
    {
      name: "Asociația Proprietarilor Bloc A1",
      code: "ap-bloc-a1",
      description:
        "Asociația proprietarilor pentru blocul A1 din complexul rezidențial Aviației",
      subscriptionPlanId: professionalPlan?.id || null,
    },
    {
      name: "Asociația Proprietarilor Arcul de Triumf",
      code: "ap-arcul-triumf",
      description:
        "Asociația proprietarilor pentru clădirile din zona Arcul de Triumf",
      subscriptionPlanId: enterprisePlan?.id || null,
    },
    {
      name: "Asociația Proprietarilor Cartier Floreasca",
      code: "ap-floreasca",
      description:
        "Asociația proprietarilor pentru complexul rezidențial Floreasca Gardens",
      subscriptionPlanId: starterPlan?.id || null,
    },
    {
      name: "Asociația Proprietarilor Primăverii Towers",
      code: "ap-primaverii",
      description:
        "Asociația proprietarilor pentru ansamblul Primăverii Towers",
      subscriptionPlanId: professionalPlan?.id || null,
    },
  ];

  const createdOrganizations = await Promise.all(
    organizations.map((org) =>
      prisma.organization.upsert({
        where: { code: org.code },
        update: org,
        create: org,
      })
    )
  );

  console.log(`✅ Created ${createdOrganizations.length} organizations`);

  // 2. Create Demo Users for each organization
  console.log("👥 Creating demo users...");

  const romanianFirstNames = [
    "Alexandru",
    "Maria",
    "Ion",
    "Elena",
    "Gheorghe",
    "Ana",
    "Vasile",
    "Ioana",
    "Nicolae",
    "Carmen",
    "Radu",
    "Cristina",
    "Adrian",
    "Monica",
    "Florin",
    "Diana",
  ];
  const romanianLastNames = [
    "Popescu",
    "Ionescu",
    "Popa",
    "Radu",
    "Stoica",
    "Stan",
    "Dumitrescu",
    "Gheorghe",
    "Nicolae",
    "Marin",
    "Cristea",
    "Preda",
    "Moldovan",
    "Ciobanu",
    "Barbu",
    "Rusu",
  ];

  for (const organization of createdOrganizations) {
    // Create organization admin
    const adminFirstName =
      romanianFirstNames[Math.floor(Math.random() * romanianFirstNames.length)];
    const adminLastName =
      romanianLastNames[Math.floor(Math.random() * romanianLastNames.length)];
    const adminEmail = `admin.${organization.code}@tbsa.demo`;
    const adminPassword = await hash("Demo2024!", 12);

    const orgAdmin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        firstName: adminFirstName,
        lastName: adminLastName,
        password: adminPassword,
        isActive: true,
        isVerified: true,
      },
    });

    // Link admin to organization
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: orgAdmin.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: orgAdmin.id,
        organizationId: organization.id,
      },
    });

    // Assign admin role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: orgAdmin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: orgAdmin.id,
        roleId: adminRole.id,
      },
    });

    console.log(
      `👤 Created admin for ${organization.name}: ${adminEmail} / Demo2024!`
    );

    // Create additional users (owners, tenants, managers)
    const additionalUsers = [];
    for (let i = 0; i < 15; i++) {
      const firstName =
        romanianFirstNames[
          Math.floor(Math.random() * romanianFirstNames.length)
        ];
      const lastName =
        romanianLastNames[Math.floor(Math.random() * romanianLastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${organization.code}@tbsa.demo`;
      const password = await hash("Demo2024!", 12);

      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          firstName,
          lastName,
          password,
          isActive: true,
          isVerified: Math.random() > 0.2, // 80% verified
        },
      });

      // Link to organization
      await prisma.userOrganization.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: organization.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          organizationId: organization.id,
        },
      });

      // Assign random role (more owners, fewer managers)
      const roleRandom = Math.random();
      let assignedRole;
      if (roleRandom < 0.6) {
        assignedRole = ownerRole;
      } else if (roleRandom < 0.9) {
        assignedRole = tenantRole;
      } else {
        assignedRole = managerRole;
      }

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: assignedRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: assignedRole.id,
        },
      });

      additionalUsers.push(user);
    }

    console.log(
      `✅ Created ${additionalUsers.length} additional users for ${organization.name}`
    );
  }

  // 3. Create Demo Buildings
  console.log("🏗️ Creating demo buildings...");

  const buildingNames = [
    "Bloc A",
    "Bloc B",
    "Bloc C",
    "Bloc D",
    "Tower 1",
    "Tower 2",
    "Turnul Nord",
    "Turnul Sud",
    "Corpul A",
    "Corpul B",
    "Vila 1",
    "Vila 2",
  ];

  const addresses = [
    "Str. Aviației nr. 12, Sector 1, București",
    "Bd. Charles de Gaulle nr. 45, Sector 1, București",
    "Str. Floreasca nr. 78, Sector 1, București",
    "Bd. Primăverii nr. 23, Sector 1, București",
    "Str. Dorobanti nr. 156, Sector 1, București",
    "Calea Victoriei nr. 89, Sector 1, București",
    "Str. Kiseleff nr. 34, Sector 1, București",
    "Bd. Mareșal Averescu nr. 67, Sector 1, București",
  ];

  for (const organization of createdOrganizations) {
    const numBuildings = Math.floor(Math.random() * 3) + 1; // 1-3 buildings per organization

    for (let i = 0; i < numBuildings; i++) {
      const buildingName =
        buildingNames[Math.floor(Math.random() * buildingNames.length)];
      const address = addresses[Math.floor(Math.random() * addresses.length)];
      const floors = Math.floor(Math.random() * 8) + 3; // 3-10 floors

      const building = await prisma.building.create({
        data: {
          name: `${buildingName} - ${organization.name}`,
          address,
          type: "RESIDENTIAL",
          floors,
          organizationId: organization.id,
          description: `Clădire rezidențială cu ${floors} etaje, ${Math.floor(Math.random() * 50) + 20} apartamente`,
        },
      });

      console.log(`🏢 Created building: ${building.name}`);

      // 4. Create Apartments for each building
      const apartmentsPerFloor = Math.floor(Math.random() * 6) + 4; // 4-9 apartments per floor

      for (let floor = 0; floor <= floors; floor++) {
        const floorsApartments =
          floor === 0 ? Math.min(apartmentsPerFloor, 4) : apartmentsPerFloor; // Ground floor might have fewer

        for (let apt = 1; apt <= floorsApartments; apt++) {
          const apartmentNumber =
            floor === 0
              ? `P${apt}`
              : `${floor}${apt.toString().padStart(2, "0")}`;
          const surface = Math.floor(Math.random() * 60) + 40; // 40-100 sqm

          const apartment = await prisma.apartment.create({
            data: {
              number: apartmentNumber,
              floor,
              buildingId: building.id,
              isOccupied: Math.random() > 0.1, // 90% occupied
              surface,
              description: `Apartament cu ${Math.floor(Math.random() * 3) + 2} camere, ${surface}mp`,
            },
          });

          // 5. Create Water Meters for each apartment
          const numMeters = Math.floor(Math.random() * 2) + 1; // 1-2 meters per apartment

          for (let meterIndex = 0; meterIndex < numMeters; meterIndex++) {
            const meterType = meterIndex === 0 ? "Bucătărie" : "Baie";
            const serialNumber = `WM${Date.now()}${Math.floor(Math.random() * 1000)}`;

            await prisma.waterMeter.create({
              data: {
                serialNumber,
                location: meterType,
                apartmentId: apartment.id,
                isActive: Math.random() > 0.05, // 95% active
              },
            });
          }
        }
      }

      console.log(
        `🏠 Created ${apartmentsPerFloor * (floors + 1)} apartments for ${building.name}`
      );
    }
  }

  // 6. Create Apartment Residents relationships
  console.log("👥 Creating apartment-resident relationships...");

  const apartments = await prisma.apartment.findMany({
    include: {
      building: {
        include: {
          organization: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const apartment of apartments) {
    if (apartment.isOccupied) {
      const organizationUsers = apartment.building.organization.users;
      const availableUsers = organizationUsers.filter(
        (ou) =>
          ou.user.email !==
          `admin.${apartment.building.organization.code}@tbsa.demo`
      );

      if (availableUsers.length > 0) {
        // Assign 1-2 residents per apartment
        const numResidents = Math.floor(Math.random() * 2) + 1;
        const selectedUsers = faker.helpers.arrayElements(
          availableUsers,
          Math.min(numResidents, availableUsers.length)
        );

        for (let i = 0; i < selectedUsers.length; i++) {
          const user = selectedUsers[i];
          let role: ApartmentRole;

          if (i === 0) {
            role = ApartmentRole.OWNER;
          } else {
            const roleRandom = Math.random();
            if (roleRandom < 0.5) {
              role = ApartmentRole.CO_OWNER;
            } else if (roleRandom < 0.8) {
              role = ApartmentRole.FAMILY;
            } else {
              role = ApartmentRole.TENANT;
            }
          }
          const firstApartementResident =
            await prisma.apartmentResident.findFirst({
              where: {
                apartmentId: apartment.id,
                userId: user.user.id,
              },
            });

          if (!firstApartementResident) {
            await prisma.apartmentResident.create({
              data: {
                apartmentId: apartment.id,
                userId: user.user.id,
                role,
                isActive: true,
                startDate: faker.date.between({
                  from: new Date("2022-01-01"),
                  to: new Date(),
                }),
              },
            });
          }
        }
      }
    }
  }

  console.log("✅ Created apartment-resident relationships");

  // 7. Create some sample water readings
  console.log("💧 Creating sample water readings...");

  const waterMeters = await prisma.waterMeter.findMany({
    include: {
      apartment: {
        include: {
          apartmentResidents: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  for (const meter of waterMeters.slice(0, 50)) {
    // Limit to first 50 meters for demo
    const numReadings = Math.floor(Math.random() * 6) + 3; // 3-8 readings per meter

    for (let i = 0; i < numReadings; i++) {
      const readingDate = faker.date.between({
        from: new Date("2023-01-01"),
        to: new Date(),
      });

      const reading = i * Math.floor(Math.random() * 100) + 50; // Progressive readings

      // Random submitter from apartment residents
      const residents = meter.apartment.apartmentResidents;
      const submitter =
        residents.length > 0
          ? residents[Math.floor(Math.random() * residents.length)]
          : null;

      if (submitter) {
        await prisma.waterReading.create({
          data: {
            waterMeterId: meter.id,
            value: reading,
            readingDate,
            submittedById: submitter.user.id,
            isApproved: Math.random() > 0.2, // 80% approved
            notes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
          },
        });
      }
    }
  }

  console.log("✅ Created sample water readings");

  console.log("🎉 Demo data seeding completed!");
  console.log("\n📋 Summary:");
  console.log(`Organizations: ${createdOrganizations.length}`);

  for (const org of createdOrganizations) {
    console.log(`\n🏢 ${org.name}:`);
    console.log(`  📧 Admin: admin.${org.code}@tbsa.demo / Demo2024!`);

    const buildings = await prisma.building.count({
      where: { organizationId: org.id },
    });
    const apartments = await prisma.apartment.count({
      where: {
        building: { organizationId: org.id },
      },
    });
    const users = await prisma.userOrganization.count({
      where: { organizationId: org.id },
    });

    console.log(`  🏗️  Buildings: ${buildings}`);
    console.log(`  🏠 Apartments: ${apartments}`);
    console.log(`  👥 Users: ${users}`);
  }
}
