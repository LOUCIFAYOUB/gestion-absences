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
            <h1 className="text-2xl font-bold text-[#a8c82f]">Gestion des Absences</h1>
            <p className="text-[#9ba4a9] text-sm mt-1">Enregistrement et suivi</p>
          </div>
          <a href="/dashboard" className="text-[#a8c82f] hover:text-[#8fb526] transition">
            Retour au Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ employee_id: "", type_id: "", start_date: "", end_date: "", reason: "", is_half_day: false });
              setShowForm(!showForm);
            }}
            className="bg-[#a8c82f] hover:bg-[#8fb526] text-[#1a1a2e] font-semibold px-4 py-2 rounded-lg transition"
          >
            {showForm ? "Annuler" : "+ Enregistrer une absence"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-[#a8c82f] mb-4">
              {editingId ? "Modifier l'absence" : "Nouvelle absence"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              >
                <option value="">Choisir un employe</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
              <select
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              >
                <option value="">Type absence</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]" required />
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]" required />
              <input placeholder="Motif (optionnel)" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]" />
              <label className="flex items-center gap-2 text-[#9ba4a9]">
                <input type="checkbox" checked={formData.is_half_day} onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })} className="accent-[#a8c82f]" />
                Demi-journee
              </label>
            </div>
            <button type="submit" className="mt-4 bg-[#a8c82f] hover:bg-[#8fb526] text-[#1a1a2e] font-semibold px-4 py-2 rounded-lg transition">
              {editingId ? "Mettre a jour" : "Enregistrer"}
            </button>
          </form>
        )}

        <div className="bg-[#16213e] border border-[#2a2a4a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1a2e]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Employe</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Du</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Au</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Duree</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Motif</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {absences.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-[#9ba4a9]">Aucune absence enregistree.</td></tr>
              ) : (
                absences.map((abs) => (
                  <tr key={abs.id} className="border-t border-[#2a2a4a]">
                    <td className="px-6 py-4 text-[#e8e8e8]">{abs.employee.first_name} {abs.employee.last_name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-sm text-[#1a1a2e] font-semibold" style={{ backgroundColor: abs.type.color }}>{abs.type.name}</span></td>
                    <td className="px-6 py-4 text-[#9ba4a9]">{formatDate(abs.start_date)}</td>
                    <td className="px-6 py-4 text-[#9ba4a9]">{formatDate(abs.end_date)}</td>
                    <td className="px-6 py-4 text-[#a8c82f] font-semibold">{getDuration(abs.start_date, abs.end_date, abs.is_half_day)} j</td>
                    <td className="px-6 py-4 text-[#9ba4a9]">{abs.reason || "-"}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(abs)} className="text-[#a8c82f] hover:text-[#8fb526] mr-3 transition">Modifier</button>
                      <button onClick={() => handleDelete(abs.id)} className="text-[#e74c3c] hover:text-[#c0392b] transition">Supprimer</button>
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