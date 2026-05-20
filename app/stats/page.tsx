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

const COLORS = ["#a8c82f", "#9ba4a9", "#e74c3c", "#3498db", "#f39c12", "#9b59b6"];

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

  const absencesByType = absences.reduce((acc: any[], abs) => {
    const existing = acc.find((item) => item.name === abs.type.name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: abs.type.name, count: 1, color: abs.type.color });
    }
    return acc;
  }, []);

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

  const totalAbsences = absences.length;
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.leave_balance > 0).length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-[#9ba4a9] text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-[#2a2a4a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#a8c82f]">Statistiques</h1>
            <p className="text-[#9ba4a9] text-sm mt-1">Analyses et graphiques</p>
          </div>
          <a href="/dashboard" className="text-[#a8c82f] hover:text-[#8fb526] transition">
            Retour au Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h3 className="text-[#9ba4a9] text-sm uppercase tracking-wide">Total Absences</h3>
            <p className="text-3xl font-bold text-[#e8e8e8] mt-2">{totalAbsences}</p>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h3 className="text-[#9ba4a9] text-sm uppercase tracking-wide">Total Employes</h3>
            <p className="text-3xl font-bold text-[#e8e8e8] mt-2">{totalEmployees}</p>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h3 className="text-[#9ba4a9] text-sm uppercase tracking-wide">Solde Conges OK</h3>
            <p className="text-3xl font-bold text-[#a8c82f] mt-2">{activeEmployees}</p>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h3 className="text-[#9ba4a9] text-sm uppercase tracking-wide">Taux Absenteisme</h3>
            <p className="text-3xl font-bold text-[#a8c82f] mt-2">
              {totalEmployees > 0 ? ((totalAbsences / totalEmployees) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique par type */}
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-[#a8c82f] mb-4">Absences par Type</h2>
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
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-[#a8c82f] mb-4">Absences par Mois</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={absencesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="month" stroke="#9ba4a9" />
                <YAxis stroke="#9ba4a9" />
                <Tooltip />
                <Bar dataKey="count" fill="#a8c82f" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top employes */}
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl lg:col-span-2">
            <h2 className="text-lg font-semibold text-[#a8c82f] mb-4">Top 5 Employes - Plus d'Absences</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEmployees} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis type="number" stroke="#9ba4a9" />
                <YAxis dataKey="name" type="category" width={150} stroke="#9ba4a9" />
                <Tooltip />
                <Bar dataKey="count" fill="#e74c3c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}