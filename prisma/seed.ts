import { PrismaClient } from "@prisma/client";
import { seedCoreSystem } from "./seeds/01-core-system";
// import { seedDemoData } from "./seeds/02-demo-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...");
  console.log("=".repeat(50));

  try {
    // Seed core system data first
    await seedCoreSystem();

    console.log("\n" + "=".repeat(50));

    // Then seed demo data
    // await seedDemoData();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Database seeding completed successfully!");
    console.log("\n🔐 Login Credentials:");
    console.log("Global Admin: admin@tbsa.ro / AdminTBSA2024!");
    console.log("Organization Admins: admin.[org-code]@tbsa.demo / Demo2024!");
    console.log(
      "Regular Users: [firstname].[lastname].[org-code]@tbsa.demo / Demo2024!"
    );
    console.log("\n🏢 Demo Organizations:");
    console.log("- ap-bloc-a1 (Professional Plan)");
    console.log("- ap-arcul-triumf (Enterprise Plan)");
    console.log("- ap-floreasca (Starter Plan)");
    console.log("- ap-primaverii (Professional Plan)");
  } catch (error) {
    console.error("❌ Database seeding failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Seed script failed:");
  console.error(e);
  process.exit(1);
});
