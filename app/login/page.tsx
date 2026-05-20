"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      username: data.get("username"),
      password: data.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Identifiants incorrects");
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#a8c82f] mb-2">Gestion des Absences</h1>
          <p className="text-[#9ba4a9]">Digital Garden</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-[#16213e] border border-[#2a2a4a] p-8 rounded-xl">
          <h2 className="text-xl font-semibold text-[#e8e8e8] mb-6 text-center">Connexion Manager</h2>
          
          {error && (
            <p className="text-[#e74c3c] mb-4 text-sm text-center bg-[#e74c3c]/10 p-2 rounded">
              {error}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#9ba4a9] mb-2">
              Nom d'utilisateur
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f] focus:ring-1 focus:ring-[#a8c82f]"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#9ba4a9] mb-2">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-lg p-3 text-[#e8e8e8] focus:outline-none focus:border-[#a8c82f] focus:ring-1 focus:ring-[#a8c82f]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#a8c82f] hover:bg-[#8fb526] text-[#1a1a2e] font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}