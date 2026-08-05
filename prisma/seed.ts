import { seedDatabase } from "../src/lib/seedData";
import { prisma } from "../src/lib/db";

// CLI seed (npm run seed / prisma db seed). Delegates to the shared,
// idempotent seedDatabase() so the CLI and the /api/setup endpoint stay
// in sync.
async function main() {
  console.log("Seeding Certo Drive...");
  const result = await seedDatabase();
  console.log("Seed complete.");
  console.log(`  Admin:  ${result.admin} / ${result.password}`);
  console.log("  Driver: driver.seoul@certodrive.com / password123");
  console.log(`  Admin id: ${result.adminId}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
