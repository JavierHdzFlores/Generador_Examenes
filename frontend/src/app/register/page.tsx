"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al registrar");
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>
        {error ? (
          <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Tu nombre"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="tu@correo.com"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-slate-400"
          >
            {isLoading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-800">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
