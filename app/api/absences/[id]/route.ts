import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT — modifier une absence
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const absenceId = parseInt(id);

    const absence = await prisma.absence.update({
      where: { id: absenceId },
      data: {
        employee_id: body.employee_id,
        type_id: body.type_id,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        reason: body.reason || null,
        is_half_day: body.is_half_day || false,
      },
    });

    return NextResponse.json(absence);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

// DELETE — supprimer une absence
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const absenceId = parseInt(id);

    await prisma.absence.delete({
      where: { id: absenceId },
    });

    return NextResponse.json({ message: "Absence supprimée" });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}