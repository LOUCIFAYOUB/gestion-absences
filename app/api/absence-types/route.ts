import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const types = await prisma.absenceType.findMany({
      where: { is_active: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
