"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Absence {
  id: number;
  employee: { first_name: string; last_name: string };
  type: { name: string; color: string };
  start_date: string;
  end_date: string;
  is_half_day: boolean;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  leave_balance: number;
}

const COLORS = ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

export default function StatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  async function fetchData() {
    try {
      const [absRes, empRes] = await Promise.all([
        fetch("/api/absences"),
        fetch("/api/employees"),
      ]);
      setAbsences(await absRes.json());
      setEmployees(await empRes.json());
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  // Données pour le graphique par type d'absence
  const absencesByType = absences.reduce((acc: any[], abs) => {
    const existing = acc.find((item) => item.name === abs.type.name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: abs.type.name, count: 1, color: abs.type.color });
    }
    return acc;
  }, []);

  // Données pour le graphique par mois
  const absencesByMonth = absences.reduce((acc: any[], abs) => {
    const month = new Date(abs.start_date).toLocaleString("fr-FR", { month: "short", year: "numeric" });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Top employés avec le plus d'absences
  const topEmployees = absences.reduce((acc: any[], abs) => {
    const name = `${abs.employee.first_name} ${abs.employee.last_name}`;
    const existing = acc.find((item) => item.name === name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name, count: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

  // Statistiques générales
  const totalAbsences = absences.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.leave_balance > 0).length;

  if (status === "loading" || loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Statistiques</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">← Retour au Dashboard</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Absences</h3>
            <p className="text-3xl font-bold text-blue-600">{totalAbsences}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Employés</h3>
            <p className="text-3xl font-bold text-green-600">{totalEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Solde Congés OK</h3>
            <p className="text-3xl font-bold text-purple-600">{activeEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Taux Absentéisme</h3>
            <p className="text-3xl font-bold text-orange-600">
              {totalEmployees > 0 ? ((totalAbsences / totalEmployees) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique par type */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Absences par Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={absencesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {absencesByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique par mois */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Absences par Mois</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={absencesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top employés */}
          <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Top 5 Employés - Plus d'Absences</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEmployees} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
