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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Connexion Manager
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'utilisateur
          </label>
          <input
            name="username"
            type="text"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}