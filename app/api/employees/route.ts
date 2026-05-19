import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — récupère tous les employés
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des employés" },
      { status: 500 }
    );
  }
}

// POST — crée un nouvel employé
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const employee = await prisma.employee.create({
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        position: body.position,
        hire_date: new Date(body.hire_date),
        leave_balance: 18,
        is_active: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'employé" },
      { status: 500 }
    );
  }
}