import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — recupere toutes les absences
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

// POST — cree une nouvelle absence + deduit le solde
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Calcul de la duree
    const start = new Date(body.start_date);
    const end = new Date(body.end_date);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const duration = body.is_half_day ? 0.5 : diffDays;

    // Verifie le solde si le type d'absence deduit le solde
    const absenceType = await prisma.absenceType.findUnique({
      where: { id: body.type_id },
    });

    if (absenceType?.deduct_balance) {
      const employee = await prisma.employee.findUnique({
        where: { id: body.employee_id },
      });

      if (!employee || employee.leave_balance < duration) {
        return NextResponse.json(
          { error: "Solde de conges insuffisant" },
          { status: 400 }
        );
      }

      // Deduit le solde
      await prisma.employee.update({
        where: { id: body.employee_id },
        data: { leave_balance: { decrement: duration } },
      });
    }

    const absence = await prisma.absence.create({
      data: {
        employee_id: body.employee_id,
        type_id: body.type_id,
        start_date: start,
        end_date: end,
        reason: body.reason || null,
        is_half_day: body.is_half_day || false,
      },
    });

    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur creation" }, { status: 500 });
  }
}