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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        <div className="text-slate-400 text-lg">Chargement...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white relative overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a8c82f]/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <header className="relative z-10 glass-card border-b border-[#a8c82f]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a8c82f] to-[#8fb526] flex items-center justify-center shadow-lg shadow-[#a8c82f]/20">
              <span className="text-lg font-bold text-slate-900">DG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Digital Garden</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="link-dg text-sm">Retour au Dashboard</a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestion des Employes</h2>
            <p className="text-slate-400 text-sm mt-1">Liste et gestion complete</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ first_name: "", last_name: "", email: "", position: "", hire_date: "" });
              setShowForm(!showForm);
            }}
            className="btn-dg px-6 py-3 rounded-lg"
          >
            {showForm ? "Annuler" : "+ Ajouter un employe"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#a8c82f] mb-4">
              {editingId ? "Modifier l'employe" : "Nouvel employe"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Prenom" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-dg rounded-lg p-3" required />
              <input placeholder="Nom" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-dg rounded-lg p-3" required />
              <input placeholder="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-dg rounded-lg p-3" required />
              <input placeholder="Poste" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="input-dg rounded-lg p-3" required />
              <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="input-dg rounded-lg p-3" required />
            </div>
            <button type="submit" className="btn-dg mt-4 px-6 py-2 rounded-lg">
              {editingId ? "Mettre a jour" : "Enregistrer"}
            </button>
          </form>
        )}

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Poste</th>
                <th className="px-6 py-3 text-left">Solde Conges</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Aucun employe enregistre
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-[#a8c82f]/10 hover:bg-[#a8c82f]/5 transition">
                    <td className="px-6 py-4 text-white font-medium">{emp.first_name} {emp.last_name}</td>
                    <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                    <td className="px-6 py-4 text-slate-400">{emp.position}</td>
                    <td className="px-6 py-4 text-[#a8c82f] font-bold">{emp.leave_balance} j</td>
                    <td className="px-6 py-4">
                      {emp.is_active ? (
                        <span className="badge-green px-3 py-1 rounded-full text-xs">Actif</span>
                      ) : (
                        <span className="badge-red px-3 py-1 rounded-full text-xs">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(emp)} className="text-[#a8c82f] hover:text-[#c4e052] mr-4 transition text-sm">Modifier</button>
                      <button onClick={() => handleDelete(emp.id)} className="text-red-400 hover:text-red-300 transition text-sm">Supprimer</button>
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