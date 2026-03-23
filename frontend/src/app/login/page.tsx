"use client";

import { useEffect, useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/quiz");
      router.refresh();
    }
  }, [router, status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/quiz",
    });

    if (res?.error) {
      setIsLoading(false);
      setError(res.error);
      return;
    }

    if (res?.ok) {
      await getSession();
      setIsLoading(false);
      router.replace(res.url ?? "/quiz");
      router.refresh();
      return;
    }

    setIsLoading(false);
    setError("No se pudo iniciar sesión. Inténtalo nuevamente.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-slate-950">Iniciar sesión</h1>
        {error ? (
          <div className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-slate-900">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-medium text-slate-950"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-slate-900">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-medium text-slate-950"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-slate-400"
          >
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-3 text-sm font-medium text-slate-800">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="font-semibold text-indigo-700 hover:text-indigo-900">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
