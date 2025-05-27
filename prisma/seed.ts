import { PrismaClient } from "@prisma/client";
import { UserRole } from "@prisma/client/wasm";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "Test",
      phone: "+40123456789",
      role: UserRole.ADMINISTRATOR,
      administrator: {
        create: {},
      },
    },
    include: {
      administrator: true,
    },
  });

  console.log("✅ Created admin user");

  // Create owner users
  const ownerPassword = await hashPassword("owner123");
  const owner1 = await prisma.user.create({
    data: {
      email: "owner1@test.com",
      password: ownerPassword,
      firstName: "Ion",
      lastName: "Popescu",
      phone: "+40123456790",
      role: UserRole.OWNER,
      owner: {
        create: {},
      },
    },
    include: {
      owner: true,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "owner2@test.com",
      password: ownerPassword,
      firstName: "Maria",
      lastName: "Ionescu",
      phone: "+40123456791",
      role: UserRole.OWNER,
      owner: {
        create: {},
      },
    },
    include: {
      owner: true,
    },
  });

  console.log("✅ Created owner users");

  // Create buildings
  const building1 = await prisma.building.create({
    data: {
      name: "Bloc A1",
      address: "Strada Florilor 12",
      city: "București",
      postalCode: "012345",
      administratorId: admin.administrator!.id,
      readingDeadline: 25,
    },
  });

  const building2 = await prisma.building.create({
    data: {
      name: "Bloc B2",
      address: "Strada Trandafirilor 34",
      city: "București",
      postalCode: "012346",
      administratorId: admin.administrator!.id,
      readingDeadline: 28,
    },
  });

  console.log("✅ Created buildings");

  // Create apartments
  const apartment1 = await prisma.apartment.create({
    data: {
      number: "1",
      floor: 0,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  const apartment2 = await prisma.apartment.create({
    data: {
      number: "2",
      floor: 0,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  const apartment3 = await prisma.apartment.create({
    data: {
      number: "1",
      floor: 1,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });
  // Additional apartments for building 1
  await prisma.apartment.create({
    data: {
      number: "3",
      floor: 1,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "4",
      floor: 1,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "5",
      floor: 2,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "6",
      floor: 2,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "7",
      floor: 3,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "8",
      floor: 3,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "9",
      floor: 4,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "10",
      floor: 4,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "11",
      floor: 5,
      rooms: 2,
      buildingId: building1.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "12",
      floor: 5,
      rooms: 3,
      buildingId: building1.id,
      ownerId: owner2.owner!.id,
    },
  });

  // Additional apartments for building 2
  await prisma.apartment.create({
    data: {
      number: "2",
      floor: 1,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "3",
      floor: 1,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "4",
      floor: 2,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "5",
      floor: 2,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "6",
      floor: 2,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "7",
      floor: 3,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "8",
      floor: 3,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "9",
      floor: 3,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "10",
      floor: 4,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "11",
      floor: 4,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "12",
      floor: 4,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "13",
      floor: 5,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "14",
      floor: 5,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "15",
      floor: 5,
      rooms: 2,
      buildingId: building2.id,
      ownerId: owner1.owner!.id,
    },
  });

  await prisma.apartment.create({
    data: {
      number: "16",
      floor: 6,
      rooms: 3,
      buildingId: building2.id,
      ownerId: owner2.owner!.id,
    },
  });

  console.log("✅ Created apartments");

  // Create some water readings
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  await prisma.waterReading.create({
    data: {
      apartmentId: apartment1.id,
      day: 15,
      month: currentMonth === 1 ? 12 : currentMonth - 1,
      year: currentMonth === 1 ? currentYear - 1 : currentYear,
      reading: 1250.5,
      submittedBy: owner1.id,
      isValidated: true,
      validatedBy: admin.administrator!.id,
      validatedAt: new Date(),
    },
  });

  await prisma.waterReading.create({
    data: {
      apartmentId: apartment1.id,
      day: 20,
      month: currentMonth,
      year: currentYear,
      reading: 1275.3,
      consumption: 24.8,
      submittedBy: owner1.id,
    },
  });

  await prisma.waterReading.create({
    data: {
      apartmentId: apartment2.id,
      day: 18,
      month: currentMonth,
      year: currentYear,
      reading: 980.2,
      submittedBy: owner2.id,
    },
  });

  console.log("✅ Created water readings");
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
