import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  await prisma.manager.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password_hash: hash,
      email: "admin@entreprise.com",
    },
  });

  await prisma.absenceType.createMany({
    data: [
      { name: "Congé annuel", color: "#3B82F6", deduct_balance: true },
      { name: "Maladie", color: "#EF4444", deduct_balance: false },
      { name: "Congé sans solde", color: "#F59E0B", deduct_balance: false },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Base de données initialisée !");
}

main().finally(() => prisma.$disconnect());