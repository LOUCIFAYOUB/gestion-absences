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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div style={{ color: '#9ba4a9' }}>Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { href: "/employes", title: "Employes", desc: "Gestion complete", color: "#a8c82f" },
    { href: "/absences", title: "Absences", desc: "Suivi et enregistrement", color: "#9ba4a9" },
    { href: "/calendrier", title: "Calendrier", desc: "Vue mensuelle", color: "#a8c82f" },
    { href: "/stats", title: "Statistiques", desc: "Analyses et rapports", color: "#9ba4a9" },
  ];

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
              <p style={{ fontSize: '0.75rem', color: '#9ba4a9', margin: 0 }}>Gestion des Absences</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>
              <strong style={{ color: '#e2e8f0' }}>{session.user?.name}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Tableau de bord</h2>
          <p style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>Vue d'ensemble de votre activite</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Employes</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2e8f0' }}>{stats.totalEmployees}</div>
            <div style={{ color: '#a8c82f', fontSize: '0.8rem', marginTop: '4px' }}>Total enregistres</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Absences</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2e8f0' }}>{stats.totalAbsences}</div>
            <div style={{ color: '#9ba4a9', fontSize: '0.8rem', marginTop: '4px' }}>Total enregistrees</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Actifs</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a8c82f' }}>{stats.activeEmployees}</div>
            <div style={{ color: '#9ba4a9', fontSize: '0.8rem', marginTop: '4px' }}>Employes presents</div>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ color: '#9ba4a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>En Cours</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9ba4a9' }}>{stats.pendingAbsences}</div>
            <div style={{ color: '#9ba4a9', fontSize: '0.8rem', marginTop: '4px' }}>Absences actives</div>
          </div>
        </div>

        {/* Navigation */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '20px' }}>Navigation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ 
                background: `linear-gradient(135deg, ${item.color}dd 0%, ${item.color}99 100%)`,
                padding: '24px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#0f172a',
                transition: 'transform 0.3s, box-shadow 0.3s',
                display: 'block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${item.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}