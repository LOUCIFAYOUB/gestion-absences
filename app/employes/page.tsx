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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return;
    
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
      hire_date: new Date().toISOString().split("T")[0], // Simplifié
    });
    setShowForm(true);
  }

  if (status === "loading" || loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">👥 Gestion des Employés</h1>
          <a href="/dashboard" className="text-blue-600 hover:underline">← Retour au Dashboard</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ first_name: "", last_name: "", email: "", position: "", hire_date: "" });
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Annuler" : "+ Ajouter un employé"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier l'employé" : "Nouvel employé"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                placeholder="Poste"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="border rounded p-2"
                required
              />
              <input
                placeholder="Date d'embauche"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="border rounded p-2"
                required
              />
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Poste</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Solde congés</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun employé enregistré.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-t">
                    <td className="px-6 py-4">{emp.first_name} {emp.last_name}</td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">{emp.position}</td>
                    <td className="px-6 py-4">{emp.leave_balance} jours</td>
                    <td className="px-6 py-4">
                      {emp.is_active ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Actif</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Supprimer
                      </button>
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