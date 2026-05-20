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
            <h1 className="text-2xl font-bold text-[#a8c82f]">Gestion des Employes</h1>
            <p className="text-[#9ba4a9] text-sm mt-1">Liste et gestion des employes</p>
          </div>
          <div className="flex gap-4">
            <a href="/dashboard" className="text-[#a8c82f] hover:text-[#8fb526] transition">
              Retour au Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ first_name: "", last_name: "", email: "", position: "", hire_date: "" });
              setShowForm(!showForm);
            }}
            className="bg-[#a8c82f] hover:bg-[#8fb526] text-[#1a1a2e] font-semibold px-4 py-2 rounded-lg transition"
          >
            {showForm ? "Annuler" : "+ Ajouter un employe"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#16213e] border border-[#2a2a4a] p-6 rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-[#a8c82f] mb-4">
              {editingId ? "Modifier l'employe" : "Nouvel employe"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Prenom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              />
              <input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              />
              <input
                placeholder="Poste"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              />
              <input
                placeholder="Date d'embauche"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f]"
                required
              />
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
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Poste</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Solde conges</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#a8c82f]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#9ba4a9]">
                    Aucun employe enregistre. Cliquez sur "Ajouter un employe" pour commencer.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-[#2a2a4a]">
                    <td className="px-6 py-4 text-[#e8e8e8]">{emp.first_name} {emp.last_name}</td>
                    <td className="px-6 py-4 text-[#9ba4a9]">{emp.email}</td>
                    <td className="px-6 py-4 text-[#9ba4a9]">{emp.position}</td>
                    <td className="px-6 py-4 text-[#a8c82f] font-semibold">{emp.leave_balance} jours</td>
                    <td className="px-6 py-4">
                      {emp.is_active ? (
                        <span className="bg-[#a8c82f]/20 text-[#a8c82f] px-2 py-1 rounded text-sm">Actif</span>
                      ) : (
                        <span className="bg-[#e74c3c]/20 text-[#e74c3c] px-2 py-1 rounded text-sm">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-[#a8c82f] hover:text-[#8fb526] mr-3 transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-[#e74c3c] hover:text-[#c0392b] transition"
                      >
                        Supprimer
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