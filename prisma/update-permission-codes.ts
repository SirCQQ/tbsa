import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePermissionCodes() {
  console.log("🔄 Starting permission code update to uppercase...");

  try {
    // Get all existing permissions
    const permissions = await prisma.permission.findMany();
    console.log(`📊 Found ${permissions.length} permissions to update`);

    let updatedCount = 0;

    // Update each permission code to uppercase
    for (const permission of permissions) {
      const uppercaseCode = permission.code.toUpperCase();

      // Only update if the code is different (i.e., not already uppercase)
      if (permission.code !== uppercaseCode) {
        await prisma.permission.update({
          where: { id: permission.id },
          data: { code: uppercaseCode },
        });

        console.log(`✅ Updated: ${permission.code} → ${uppercaseCode}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${permission.code} (already uppercase)`);
      }
    }

    console.log(
      `🎉 Update completed! Updated ${updatedCount} out of ${permissions.length} permissions`
    );

    // Verify the update
    console.log("\n🔍 Verifying updates...");
    const updatedPermissions = await prisma.permission.findMany({
      select: { code: true },
    });

    const lowercasePermissions = updatedPermissions.filter(
      (p) => p.code !== p.code.toUpperCase()
    );

    if (lowercasePermissions.length === 0) {
      console.log("✅ All permission codes are now uppercase!");
    } else {
      console.log(
        `⚠️  Warning: ${lowercasePermissions.length} permissions still have lowercase codes:`
      );
      lowercasePermissions.forEach((p) => console.log(`   - ${p.code}`));
    }
  } catch (error) {
    console.error("❌ Error updating permission codes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updatePermissionCodes().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
