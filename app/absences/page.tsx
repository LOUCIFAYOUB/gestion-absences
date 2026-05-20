"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface AbsenceType {
  id: number;
  name: string;
  color: string;
}

interface Absence {
  id: number;
  employee: Employee;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  reason: string | null;
  is_half_day: boolean;
}

export default function AbsencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<AbsenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    is_half_day: false,
  });

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
      const [absRes, empRes, typeRes] = await Promise.all([
        fetch("/api/absences"),
        fetch("/api/employees"),
        fetch("/api/absence-types"),
      ]);
      setAbsences(await absRes.json());
      setEmployees(await empRes.json());
      setTypes(await typeRes.json());
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingId ? `/api/absences/${editingId}` : "/api/absences";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employee_id: parseInt(formData.employee_id),
          type_id: parseInt(formData.type_id),
        }),
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ employee_id: "", type_id: "", start_date: "", end_date: "", reason: "", is_half_day: false });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Etes-vous sur de vouloir supprimer cette absence ?")) return;
    
    try {
      const res = await fetch(`/api/absences/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  function handleEdit(abs: Absence) {
    setEditingId(abs.id);
    setFormData({
      employee_id: String(abs.employee.id),
      type_id: String(abs.type.id),
      start_date: abs.start_date.split("T")[0],
      end_date: abs.end_date.split("T")[0],
      reason: abs.reason || "",
      is_half_day: abs.is_half_day,
    });
    setShowForm(true);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  function getDuration(start: string, end: string, half: boolean) {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return half ? 0.5 : diff;
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>Gestion des Absences</h2>
            <p style={{ color: '#9ba4a9', fontSize: '0.9rem' }}>Enregistrement et suivi</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ employee_id: "", type_id: "", start_date: "", end_date: "", reason: "", is_half_day: false });
              setShowForm(!showForm);
            }}
            className="btn-dg"
          >
            {showForm ? "Annuler" : "+ Enregistrer une absence"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#a8c82f', marginBottom: '16px' }}>
              {editingId ? "Modifier l'absence" : "Nouvelle absence"}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <select value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} className="input-dg" required>
                <option value="">Choisir un employe</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
              <select value={formData.type_id} onChange={(e) => setFormData({ ...formData, type_id: e.target.value })} className="input-dg" required>
                <option value="">Type d'absence</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input-dg" required />
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="input-dg" required />
              <input placeholder="Motif (optionnel)" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input-dg" />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ba4a9' }}>
                <input type="checkbox" checked={formData.is_half_day} onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })} style={{ accentColor: '#a8c82f' }} />
                Demi-journee
              </label>
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
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Employe</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Du</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Au</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Duree</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Motif</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9ba4a9' }}>
                    Aucune absence enregistree
                  </td>
                </tr>
              ) : (
                absences.map((abs) => (
                  <tr key={abs.id} style={{ borderTop: '1px solid rgba(168, 200, 47, 0.1)' }}>
                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{abs.employee.first_name} {abs.employee.last_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: abs.type.color, color: '#0f172a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {abs.type.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#9ba4a9' }}>{formatDate(abs.start_date)}</td>
                    <td style={{ padding: '12px 16px', color: '#9ba4a9' }}>{formatDate(abs.end_date)}</td>
                    <td style={{ padding: '12px 16px', color: '#a8c82f', fontWeight: 'bold' }}>{getDuration(abs.start_date, abs.end_date, abs.is_half_day)} j</td>
                    <td style={{ padding: '12px 16px', color: '#9ba4a9' }}>{abs.reason || "-"}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleEdit(abs)} style={{ color: '#a8c82f', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px', fontSize: '0.85rem' }}>Modifier</button>
                      <button onClick={() => handleDelete(abs.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Supprimer</button>
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