"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ScoreItem = {
  id: number;
  points: number;
  createdAt: string;
  question: { id: number; question: string };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [scores, setScores] = useState<ScoreItem[]>([]);

  useEffect(() => {
    fetch("/api/scores")
      .then((res) => res.json())
      .then((data) => setScores(data));
  }, []);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-slate-950">Debes iniciar sesión para ver el dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="mb-4 text-2xl font-extrabold text-slate-950">Dashboard</h1>
        <p className="mb-5 text-base font-semibold text-slate-900">Bienvenido, {session.user.name || session.user.email}</p>

        <section className="mb-6">
          <h2 className="mb-3 text-xl font-bold text-slate-950">Historial de puntajes</h2>
          <table className="w-full border-collapse text-left text-slate-950">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-3 py-2 font-bold text-slate-950">ID</th>
                <th className="px-3 py-2 font-bold text-slate-950">Pregunta</th>
                <th className="px-3 py-2 font-bold text-slate-950">Puntos</th>
                <th className="px-3 py-2 font-bold text-slate-950">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 font-medium text-slate-950">{s.id}</td>
                  <td className="px-3 py-2 font-medium text-slate-950">{s.question.question}</td>
                  <td className="px-3 py-2 font-semibold text-slate-950">{s.points}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center font-medium text-slate-800">
                    No hay puntajes registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
