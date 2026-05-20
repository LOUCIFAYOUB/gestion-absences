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
  const [stats, setStats] = useState<Stats>({
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="text-slate-400 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { 
      href: "/employes", 
      title: "Employes",
      desc: "Gestion complete",
      icon: "M",
      gradient: "from-[#a8c82f] to-[#8fb526]",
      shadow: "shadow-[#a8c82f]/20"
    },
    { 
      href: "/absences", 
      title: "Absences",
      desc: "Suivi et enregistrement",
      icon: "A",
      gradient: "from-[#9ba4a9] to-[#7a8287]",
      shadow: "shadow-[#9ba4a9]/20"
    },
    { 
      href: "/calendrier", 
      title: "Calendrier",
      desc: "Vue mensuelle",
      icon: "C",
      gradient: "from-[#a8c82f] to-[#c4e052]",
      shadow: "shadow-[#a8c82f]/20"
    },
    { 
      href: "/stats", 
      title: "Statistiques",
      desc: "Analyses et rapports",
      icon: "S",
      gradient: "from-[#9ba4a9] to-[#b8c0c4]",
      shadow: "shadow-[#9ba4a9]/20"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white relative overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a8c82f]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9ba4a9]/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 glass-card border-b border-[#a8c82f]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a8c82f] to-[#8fb526] flex items-center justify-center shadow-lg shadow-[#a8c82f]/20">
              <span className="text-lg font-bold text-slate-900">DG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Digital Garden</h1>
              <p className="text-xs text-slate-400">Gestion des Absences</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 text-sm">
              <span className="text-[#a8c82f] font-semibold">{session.user?.name}</span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition text-sm"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Titre de section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Tableau de bord</h2>
          <p className="text-slate-400">Vue d'ensemble de votre activite</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#a8c82f]/10 rounded-full blur-2xl group-hover:bg-[#a8c82f]/20 transition" />
            <div className="relative z-10">
              <div className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Employes</div>
              <div className="text-3xl font-bold text-white">{stats.totalEmployees}</div>
              <div className="text-[#a8c82f] text-sm mt-1">Total enregistres</div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#9ba4a9]/10 rounded-full blur-2xl group-hover:bg-[#9ba4a9]/20 transition" />
            <div className="relative z-10">
              <div className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Absences</div>
              <div className="text-3xl font-bold text-white">{stats.totalAbsences}</div>
              <div className="text-[#9ba4a9] text-sm mt-1">Total enregistrees</div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#a8c82f]/10 rounded-full blur-2xl group-hover:bg-[#a8c82f]/20 transition" />
            <div className="relative z-10">
              <div className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Actifs</div>
              <div className="text-3xl font-bold text-[#a8c82f]">{stats.activeEmployees}</div>
              <div className="text-slate-400 text-sm mt-1">Employes presents</div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#9ba4a9]/10 rounded-full blur-2xl group-hover:bg-[#9ba4a9]/20 transition" />
            <div className="relative z-10">
              <div className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">En Cours</div>
              <div className="text-3xl font-bold text-[#9ba4a9]">{stats.pendingAbsences}</div>
              <div className="text-slate-400 text-sm mt-1">Absences actives</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Design moderne */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-90`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{item.icon}</span>
                  </div>
                  <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}