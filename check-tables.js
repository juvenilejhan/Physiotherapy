import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;

  console.log("=== Database Tables ===");
  tables.forEach((t) => console.log("  ✓", t.table_name));
  console.log("\nTotal:", tables.length, "tables");

  await prisma.$disconnect();
}

main().catch(console.error);
