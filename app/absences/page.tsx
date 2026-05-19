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
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) return;
    
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
    return <div className="p-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📅 Gestion des Absences</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">← Retour au Dashboard</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ employee_id: "", type_id: "", start_date: "", end_date: "", reason: "", is_half_day: false });
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Annuler" : "+ Enregistrer une absence"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier l'absence" : "Nouvelle absence"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="border rounded p-2"
                required
              >
                <option value="">Choisir un employé</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                ))}
              </select>
              <select
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                className="border rounded p-2"
                required
              >
                <option value="">Type d'absence</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="border rounded p-2" required />
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="border rounded p-2" required />
              <input placeholder="Motif (optionnel)" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="border rounded p-2" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_half_day} onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })} />
                Demi-journée
              </label>
            </div>
            <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingId ? "Mettre à jour" : "Enregistrer"}
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Employé</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Du</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Au</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Durée</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Motif</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {absences.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucune absence enregistrée.</td></tr>
              ) : (
                absences.map((abs) => (
                  <tr key={abs.id} className="border-t">
                    <td className="px-6 py-4">{abs.employee.first_name} {abs.employee.last_name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-sm text-white" style={{ backgroundColor: abs.type.color }}>{abs.type.name}</span></td>
                    <td className="px-6 py-4">{formatDate(abs.start_date)}</td>
                    <td className="px-6 py-4">{formatDate(abs.end_date)}</td>
                    <td className="px-6 py-4">{getDuration(abs.start_date, abs.end_date, abs.is_half_day)} j</td>
                    <td className="px-6 py-4">{abs.reason || "-"}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(abs)} className="text-blue-600 hover:text-blue-800 mr-3">✏️ Modifier</button>
                      <button onClick={() => handleDelete(abs.id)} className="text-red-600 hover:text-red-800">🗑️ Supprimer</button>
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