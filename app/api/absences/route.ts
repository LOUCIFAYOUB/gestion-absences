import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const absences = await prisma.absence.findMany({
      include: { employee: true, type: true },
      orderBy: { start_date: "desc" },
    });
    return NextResponse.json(absences);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const absence = await prisma.absence.create({
      data: {
        employee_id: body.employee_id,
        type_id: body.type_id,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        reason: body.reason || null,
        is_half_day: body.is_half_day || false,
      },
    });
    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}