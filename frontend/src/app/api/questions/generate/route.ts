import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { prisma } from "@/lib/prisma";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
const MODEL = "gemini-2.5-flash";

const temas = [
  "Diferencia entre elementos 'block' e 'inline' en HTML",
  "Uso de etiquetas semánticas de HTML (como <nav>, <article>, <aside>)",
  "Atributos comunes de HTML (src, href, alt, id, class)",
  "Estructura básica de un formulario HTML (<form>, <input>, <label>)",
  "Concepto del Box Model en CSS (margin, padding, border, content)",
  "Diferencia entre selectores CSS (ID, clase, etiqueta)",
  "Concepto de especificidad en CSS",
  "Uso de Flexbox para alinear elementos",
  "Uso de Media Queries para diseño responsive",
  "Manipulación del DOM (getElementById, querySelector, createElement)",
  "Cómo añadir un event listener en JavaScript (addEventListener)",
  "Diferencia entre let, const y var",
  "Operadores de comparación (== vs ===)",
  "Concepto de 'arrow functions' (funciones de flecha)"
];

const promptTemplate = (tema: string) => `En el contexto de JavaScript, CSS y HTML, genera una pregunta de opción múltiple sobre el siguiente tema: ${tema}. Proporciona cuatro opciones de respuesta y señala cuál es la correcta. Devuelve SOLO el JSON con este formato EXACTO, sin texto adicional:\n{\n  "question": "...",\n  "options": ["...","...","...","..."],\n  "correct_answer": "...",\n  "explanation": "..."\n}`;

export async function GET() {
  console.log("🔍 Iniciando generación de pregunta...");
  console.log("🔑 API_KEY existe:", !!API_KEY);
  
  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY no configurada");
    return NextResponse.json({ error: "GEMINI_API_KEY no configurada en .env.local" }, { status: 500 });
  }

  const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
  console.log("📚 Tema seleccionado:", temaAleatorio);
  
  const body = {
    contents: [{ parts: [{ text: promptTemplate(temaAleatorio) }] }],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json"
    }
  };

  try {
    console.log("🌐 Llamando a Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    console.log("📡 Respuesta Gemini status:", response.status);
    
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Error Gemini:", text);
      return NextResponse.json({ error: `Gemini error ${response.status}`, detail: text }, { status: response.status });
    }

    const data: any = await response.json();
    console.log("✅ Respuesta JSON recibida");
    
    const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("📝 Text result:", textResult?.substring(0, 100));

    if (!textResult || typeof textResult !== "string") {
      console.error("❌ No hay texto en respuesta:", data);
      return NextResponse.json({ error: "Respuesta inesperada de Gemini" }, { status: 500 });
    }

    const firstBrace = textResult.indexOf("{");
    const lastBrace = textResult.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("❌ No se encontró JSON en:", textResult);
      return NextResponse.json({ error: "No se encontró JSON en la respuesta" }, { status: 500 });
    }

    const jsonText = textResult.substring(firstBrace, lastBrace + 1);
    const questionData = JSON.parse(jsonText);
    console.log("✅ JSON parseado correctamente");

    if (
      !questionData.question ||
      !Array.isArray(questionData.options) ||
      questionData.options.length !== 4 ||
      !questionData.correct_answer
    ) {
      console.error("❌ Estructura JSON inválida:", questionData);
      return NextResponse.json({ error: "Estructura JSON inválida" }, { status: 500 });
    }

    const [optionA, optionB, optionC, optionD] = questionData.options;

    const created = await prisma.question.create({
      data: {
        question: questionData.question,
        optionA,
        optionB,
        optionC,
        optionD,
        correct: questionData.correct_answer,
        explanation: questionData.explanation ?? "",
      },
    });

    console.log("💾 Pregunta guardada en DB:", created.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("🚨 Error en generación:", error);
    return NextResponse.json({ error: "Error servidor", detail: (error as Error).message }, { status: 500 });
  }
}
