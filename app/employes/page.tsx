"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  leave_balance: number;
  is_active: boolean;
}

export default function EmployesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    hire_date: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchEmployees();
    }
  }, [status, router]);

  async function fetchEmployees() {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingId ? `/api/employees/${editingId}` : "/api/employees";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ first_name: "", last_name: "", email: "", position: "", hire_date: "" });
        fetchEmployees();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Etes-vous sur de vouloir supprimer cet employe ?")) return;
    
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEmployees();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  function handleEdit(emp: Employee) {
    setEditingId(emp.id);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      position: emp.position,
      hire_date: new Date().toISOString().split("T")[0],
    });
    setShowForm(true);
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Gestion des Employes</h2>
            <p style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>Liste et gestion complete</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ first_name: "", last_name: "", email: "", position: "", hire_date: "" });
              setShowForm(!showForm);
            }}
            className="btn-dg"
          >
            {showForm ? "Annuler" : "+ Ajouter un employe"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a8c82f', marginBottom: '16px' }}>
              {editingId ? "Modifier l'employe" : "Nouvel employe"}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <input placeholder="Prenom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-dg" required />
              <input placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-dg" required />
              <input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-dg" required />
              <input placeholder="Poste" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="input-dg" required />
              <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="input-dg" required />
            </div>
            <button type="submit" className="btn-dg" style={{ marginTop: '16px' }}>
              {editingId ? "Mettre a jour" : "Enregistrer"}
            </button>
          </form>
        )}

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="table-header">
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nom</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Poste</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Solde Conges</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#9ba4a9' }}>
                    Aucun employe enregistre
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} style={{ borderTop: '1px solid rgba(168, 200, 47, 0.1)' }}>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: '500' }}>{emp.first_name} {emp.last_name}</td>
                    <td style={{ padding: '12px 16px', color: '#9ba4a9' }}>{emp.email}</td>
                    <td style={{ padding: '12px 16px', color: '#9ba4a9' }}>{emp.position}</td>
                    <td style={{ padding: '12px 16px', color: '#a8c82f', fontWeight: 'bold' }}>{emp.leave_balance} j</td>
                    <td style={{ padding: '12px 16px' }}>
                      {emp.is_active ? (
                        <span className="badge-green">Actif</span>
                      ) : (
                        <span className="badge-red">Inactif</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleEdit(emp)} style={{ color: '#a8c82f', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', fontSize: '0.85rem' }}>Modifier</button>
                      <button onClick={() => handleDelete(emp.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}