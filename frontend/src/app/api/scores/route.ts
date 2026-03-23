import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const scores = await prisma.score.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      question: { select: { id: true, question: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const { userId, questionId, points } = await req.json();
  if (!userId || !questionId || typeof points !== "number") {
    return NextResponse.json({ error: "userId, questionId y points requeridos" }, { status: 400 });
  }

  const created = await prisma.score.create({
    data: { userId, questionId, points },
  });

  return NextResponse.json(created, { status: 201 });
}
