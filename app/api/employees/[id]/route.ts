import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT — modifier un employé
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const employeeId = parseInt(id);

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        position: body.position,
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

// DELETE — supprimer un employé
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return NextResponse.json({ message: "Employé supprimé" });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}