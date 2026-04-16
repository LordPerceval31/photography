import { NextRequest, NextResponse } from "next/server";
import { validateGalleryCode } from "@/app/(admin)/actions/validateGalleryCode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Code manquant" }, { status: 400 });
  }

  const result = await validateGalleryCode(token, code);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
