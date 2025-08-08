import { PrismaClient, BuildingType, ApartmentRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { base, ro, en, Faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Configure faker for Romanian locale
const faker = new Faker({ locale: [ro, en, base] });

export async function seedDemoData() {
  console.log("🏢 Starting demo data seeding...");

  // Create one org with each type of subscription plan
  const subscriptionPlans = await prisma.subscriptionPlan.findMany();
  console.log(
    `📋 Found ${subscriptionPlans.length} subscription plans to seed`
  );

  for (const [index, plan] of subscriptionPlans.entries()) {
    console.log(
      `\n🔄 Creating organization ${index + 1}/${subscriptionPlans.length} with plan: ${plan.name}`
    );
    await organizationWithSubscriptionPlan(plan.id);
  }

  console.log("\n✅ Demo data seeding completed!");
}

async function organizationWithSubscriptionPlan(subscriptionPlanId: string) {
  console.log("  👥 Finding administrator role...");
  const administratorRole = await prisma.role.findFirst({
    where: {
      code: "ADMINISTRATOR",
    },
  });

  if (!administratorRole) {
    throw new Error("Administrator role not found");
  }
  console.log("  ✅ Administrator role found");

  console.log("\n\n\n\n", administratorRole, "\n\n\n\n\n");
  //Create a user with faker email and password Parola123!
  console.log("  👤 Creating administrator user...");
  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: await hash("Parola123!", 10),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: administratorRole.id,
    },
  });

  console.log(
    `  ✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`
  );

  console.log("  🏢 Creating organization...");
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      code: faker.string.alphanumeric().toLocaleUpperCase(),
      subscriptionPlanId,
    },
  });
  console.log(`  ✅ Created organization: ${org.name} (${org.code})`);

  //assign user to organization
  console.log("  🔗 Linking user to organization...");
  await prisma.userOrganization.create({
    data: {
      userId: user.id,
      organizationId: org.id,
    },
  });
  console.log("  ✅ User linked to organization");

  // ✅ Create actual subscription instance (billing cycle) - FIXED
  console.log("  💳 Creating subscription instance...");

  // Get the plan to calculate total amount
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscriptionPlanId },
  });

  if (!plan) throw new Error("Subscription plan not found");

  const subscription = await prisma.subscription.create({
    data: {
      organizationId: org.id,
      planId: subscriptionPlanId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      subscriptionDate: new Date(),
      isPaid: true,
      isActive: true,
      totalAmount: plan.basePrice, // Use the plan's base price
      paidAt: new Date(),
    },
  });
  console.log("  ✅ Subscription instance created");

  console.log("  🏘️ Creating building with apartments...");
  await createBuildingWithApartments(org.id, BuildingType.RESIDENTIAL);
}

async function createBuildingWithApartments(
  orgId: string,
  buildingType: BuildingType
) {
  const floors = faker.number.int({ min: 1, max: 10 });
  console.log(`    🏗️ Creating building with ${floors} floors...`);

  const building = await prisma.building.create({
    data: {
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      code: faker.string.alphanumeric().toLocaleUpperCase(),
      type: buildingType,
      floors,
      organizationId: orgId,
    },
  });
  console.log(
    `    ✅ Created building: ${building.name} at ${building.address}`
  );

  const apartmentCount = faker.number.int({ min: 3, max: 15 });
  console.log(`    🚪 Creating ${apartmentCount} apartments...`);

  // ✅ Create apartments with sequential numbers
  for (let i = 0; i < apartmentCount; i++) {
    const occupantCount = faker.number.int({ min: 0, max: 4 });

    // ✅ Generate unique apartment number (sequential or floor-based)
    const apartmentNumber = generateUniqueApartmentNumber(i, floors);

    console.log(
      `      📍 Creating apartment ${i + 1}/${apartmentCount} (Number: ${apartmentNumber})`
    );

    const residentRole = await prisma.role.findFirst({
      where: {
        code: "RESIDENT",
      },
    });

    if (!residentRole) {
      throw new Error("Resident role not found");
    }

    //create a user with faker email and password Parola123!
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await hash("Parola123!", 10),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    });

    //asign user to resident role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: residentRole.id,
      },
    });

    const apartment = await prisma.apartment.create({
      data: {
        floor: faker.number.int({ min: 1, max: floors }),
        number: apartmentNumber,
        occupantCount,
        isOccupied: occupantCount > 0,
        surface: faker.number.int({ min: 30, max: 120 }),
        description: faker.lorem.sentence(),
        buildingId: building.id,
      },
    });

    //asign user to apartment
    await prisma.apartmentResident.create({
      data: {
        apartmentId: apartment.id,
        userId: user.id,
        role: ApartmentRole.FAMILY,
      },
    });
    console.log(
      `      ✅ Created apartment ${apartmentNumber} (${occupantCount} occupants)`
    );
    await createApartmentWaterMeter(apartment.id, apartmentNumber, user.id);
  }

  console.log(
    `    ✅ All ${apartmentCount} apartments created for building ${building.name}`
  );
}

// ✅ Helper function for unique apartment numbers
function generateUniqueApartmentNumber(
  index: number,
  maxFloors: number
): string {
  // Option 1: Simple sequential (1, 2, 3, 4, ...)
  return (index + 1).toString();

  // Option 2: Floor-based (101, 102, 201, 202, ...)
  // const floor = Math.floor(index / 4) + 1; // 4 apartments per floor
  // const unit = (index % 4) + 1;
  // return `${floor}${unit.toString().padStart(2, '0')}`;
}

async function createApartmentWaterMeter(
  apartmentId: string,
  apartmentNumber: string,
  userId: string
) {
  const serialNumber = faker.string.alphanumeric(8).toLocaleUpperCase();
  const location = faker.helpers.arrayElement([
    "Kitchen",
    "Bathroom",
    "Living Room",
    "Bedroom",
  ]);

  console.log(
    `        🌊 Creating water meter for apartment ${apartmentNumber}...`
  );

  const waterMeter = await prisma.waterMeter.create({
    data: {
      apartmentId,
      serialNumber,
      isActive: true,
      location,
    },
  });

  console.log(`        ✅ Created water meter: ${serialNumber} in ${location}`);

  const readingCount = faker.number.int({ min: 2, max: 8 });
  console.log(`        📊 Creating ${readingCount} water readings...`);

  // Create readings sequentially
  for (let i = 0; i < readingCount; i++) {
    await prisma.waterReading.create({
      data: {
        waterMeterId: waterMeter.id,
        readingDate: faker.date.recent({ days: 30 }),
        value: faker.number.int({ min: 10, max: 500 }),
        submittedById: userId,
      },
    });
  }

  console.log(
    `        ✅ Created ${readingCount} readings for water meter ${serialNumber}`
  );
}
