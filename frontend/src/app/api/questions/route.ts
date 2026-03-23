import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const { question, optionA, optionB, optionC, optionD, correct } =
    await req.json();

  if (!question || !optionA || !optionB || !optionC || !optionD || !correct) {
    return NextResponse.json({ message: "Campos incompletos" }, { status: 400 });
  }

  const newQuestion = await prisma.question.create({
    data: { question, optionA, optionB, optionC, optionD, correct },
  });

  return NextResponse.json(newQuestion, { status: 201 });
}
