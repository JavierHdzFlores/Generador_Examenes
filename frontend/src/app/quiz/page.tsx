"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Question = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
  explanation?: string;
};

export default function QuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      loadQuestions();
    }
  }, [status, router]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/questions");
      const list = await r.json();
      setQuestions(list || []);
    } finally {
      setLoading(false);
    }
  };

  const generateFromGemini = async () => {
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/questions/generate");
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData?.error || "Error al generar pregunta");
      }
      await loadQuestions();
    } catch (error) {
      console.error(error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedAnswer || !session?.user?.id) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct;
    const points = isCorrect ? 1 : 0;

    setScore(score + points);
    setTotalAnswered(totalAnswered + 1);

    // Guardar puntaje en DB
    await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        questionId: currentQuestion.id,
        points,
      }),
    });

    setAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setAnswered(false);
    } else {
      // Quiz terminado
      alert(`Quiz terminado!\nPuntaje: ${score}/${totalAnswered}`);
      router.push("/dashboard");
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!session) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center rounded-xl bg-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950">Quiz de Examen</h1>
            <p className="text-sm font-medium text-slate-800">Sesión: {session.user.email}</p>
          </div>
          <button onClick={() => signOut()} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Cerrar sesión
          </button>
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={generateFromGemini}
            disabled={isGenerating}
            className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:bg-slate-400"
          >
            {isGenerating ? "Generando..." : "Generar pregunta"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
          >
            Ver historial
          </button>
        </div>

        {/* Quiz */}
        {questions.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="mb-4 text-lg font-semibold text-slate-900">No hay preguntas disponibles.</p>
            <p className="text-sm font-medium text-slate-700">Genera preguntas con Gemini para comenzar.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 shadow">
            {/* Progreso */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm font-semibold text-slate-900">
                <span>Pregunta {currentIndex + 1} de {questions.length}</span>
                <span>Puntaje: {score}/{totalAnswered}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Pregunta */}
            {currentQuestion && (
              <div>
                <h2 className="mb-6 text-xl font-extrabold text-slate-950">{currentQuestion.question}</h2>

                {/* Opciones */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "A", value: currentQuestion.optionA },
                    { label: "B", value: currentQuestion.optionB },
                    { label: "C", value: currentQuestion.optionC },
                    { label: "D", value: currentQuestion.optionD },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => !answered && setSelectedAnswer(opt.value)}
                      disabled={answered}
                      className={`w-full rounded-lg border-2 p-4 text-left font-semibold text-slate-950 transition ${
                        answered
                          ? opt.value === currentQuestion.correct
                            ? "border-green-500 bg-green-50"
                            : opt.value === selectedAnswer
                            ? "border-red-500 bg-red-50"
                            : "border-slate-200 bg-slate-50"
                          : selectedAnswer === opt.value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-400"
                      }`}
                    >
                      <span className="font-extrabold text-slate-950">{opt.label}.</span> {opt.value}
                    </button>
                  ))}
                </div>

                {/* Explicación (si respondió) */}
                {answered && (
                  <div className={`mb-6 rounded-lg p-4 ${selectedAnswer === currentQuestion.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <p className="font-bold mb-2">
                      {selectedAnswer === currentQuestion.correct ? "✅ Correcto" : "❌ Incorrecto"}
                    </p>
                    {currentQuestion.explanation && (
                      <p className="text-sm font-medium text-slate-900">{currentQuestion.explanation}</p>
                    )}
                    <p className="mt-2 text-sm font-bold text-slate-950">Respuesta correcta: {currentQuestion.correct}</p>
                  </div>
                )}

                {/* Botones de acción */}
                {!answered ? (
                  <button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:bg-slate-400"
                  >
                    Responder
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full rounded-lg bg-slate-600 px-4 py-3 font-bold text-white hover:bg-slate-700"
                  >
                    {currentIndex === questions.length - 1 ? "Terminar Quiz" : "Siguiente"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
