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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div style={{ color: '#9ba4a9' }}>Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(168, 200, 47, 0.2)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #a8c82f 0%, #8fb526 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>DG</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a8c82f', margin: 0 }}>Digital Garden</h1>
            </div>
          </div>
          <a href="/dashboard" style={{ color: '#a8c82f', textDecoration: 'none', fontSize: '0.9rem' }}>Retour au Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Statistiques</h2>
          <p style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>Analyses et graphiques</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Absences</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2e8f0' }}>{totalAbsences}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Employes</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2e8f0' }}>{totalEmployees}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Solde Conges OK</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a8c82f' }}>{activeEmployees}</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Taux Absenteisme</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a8c82f' }}>
              {totalEmployees > 0 ? ((totalAbsences / totalEmployees) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a8c82f', marginBottom: '16px' }}>Absences par Type</h3>
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

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a8c82f', marginBottom: '16px' }}>Absences par Mois</h3>
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

          <div className="glass-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a8c82f', marginBottom: '16px' }}>Top 5 Employes - Plus d'Absences</h3>
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