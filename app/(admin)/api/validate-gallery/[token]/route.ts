"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createHash } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = (await req.json()) as { code?: string };
    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json({ error: "Code manquant" }, { status: 400 });
    }

    const gallery = await prisma.gallery.findUnique({
      where: { token },
      select: {
        id: true,
        guests: {
          select: {
            secretPasswords: {
              where: { used: false, expiresAt: { gt: new Date() } },
              select: { id: true, code: true },
            },
          },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "Galerie introuvable" },
        { status: 404 },
      );
    }

    const hashedInput = createHash("sha256")
      .update(code.toUpperCase())
      .digest("hex");

    let matchedPasswordId: string | null = null;
    for (const guest of gallery.guests) {
      for (const sp of guest.secretPasswords) {
        if (sp.code === hashedInput) {
          matchedPasswordId = sp.id;
          break;
        }
      }
      if (matchedPasswordId) break;
    }

    if (!matchedPasswordId) {
      return NextResponse.json(
        { error: "Code incorrect ou expiré" },
        { status: 401 },
      );
    }

    await prisma.secretPassword.update({
      where: { id: matchedPasswordId },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
