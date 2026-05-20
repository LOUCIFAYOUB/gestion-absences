"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Stats {
  totalEmployees: number;
  totalAbsences: number;
  activeEmployees: number;
  pendingAbsences: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<<Stats>({
    totalEmployees: 0,
    totalAbsences: 0,
    activeEmployees: 0,
    pendingAbsences: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  async function fetchStats() {
    try {
      const [empRes, absRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/absences"),
      ]);
      const employees = await empRes.json();
      const absences = await absRes.json();

      setStats({
        totalEmployees: employees.length,
        totalAbsences: absences.length,
        activeEmployees: employees.filter((e: any) => e.is_active).length,
        pendingAbsences: absences.filter((a: any) => new Date(a.end_date) >= new Date()).length,
      });
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-[#9ba4a9] text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { href: "/employes", label: "Gestion des Employes", desc: "Ajouter, modifier, supprimer", color: "bg-[#a8c82f] hover:bg-[#8fb526]" },
    { href: "/absences", label: "Gestion des Absences", desc: "Enregistrer, modifier, supprimer", color: "bg-[#9ba4a9] hover:bg-[#7d868b]" },
    { href: "/calendrier", label: "Calendrier", desc: "Vue mensuelle et hebdomadaire", color: "bg-[#a8c82f] hover:bg-[#8fb526]" },
    { href: "/stats", label: "Statistiques", desc: "Graphiques et analyses", color: "bg-[#9ba4a9] hover:bg-[#7d868b]" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#16213e] border-b border-[#2a2a4a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#a8c82f]">Gestion des Absences</h1>
            <p className="text-[#9ba4a9] text-sm mt-1">Tableau de bord principal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#9ba4a9]">
              Connecte en tant que <strong className="text-[#e8e8e8]">{session.user?.name}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-[#e74c3c] hover:bg-[#c0392b] text-white px-4 py-2 rounded-lg transition"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <h2 className="text-lg font-semibold text-[#a8c82f] mb-4 uppercase tracking-wide">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <div className="text-[#9ba4a9] text-sm uppercase tracking-wide">Total Employes</div>
            <div className="text-3xl font-bold text-[#e8e8e8] mt-2">{stats.totalEmployees}</div>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <div className="text-[#9ba4a9] text-sm uppercase tracking-wide">Total Absences</div>
            <div className="text-3xl font-bold text-[#e8e8e8] mt-2">{stats.totalAbsences}</div>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <div className="text-[#9ba4a9] text-sm uppercase tracking-wide">Employes Actifs</div>
            <div className="text-3xl font-bold text-[#a8c82f] mt-2">{stats.activeEmployees}</div>
          </div>
          <div className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl">
            <div className="text-[#9ba4a9] text-sm uppercase tracking-wide">Absences en Cours</div>
            <div className="text-3xl font-bold text-[#a8c82f] mt-2">{stats.pendingAbsences}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <h2 className="text-lg font-semibold text-[#a8c82f] mb-4 uppercase tracking-wide">Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`${item.color} text-[#1a1a2e] p-6 rounded-xl transition transform hover:scale-105 block`}
            >
              <div className="text-lg font-bold mb-1">{item.label}</div>
              <div className="text-sm opacity-80">{item.desc}</div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}