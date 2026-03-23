import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email y password son requeridos" }, { status: 400 });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return NextResponse.json({ error: "Usuario ya existe" }, { status: 400 });
  }

  const hashedPassword = await import('bcrypt').then(mod => mod.hash(password, 10));
  const user = await prisma.user.create({ data: { name, email, hashedPassword } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
