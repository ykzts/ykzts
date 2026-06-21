import { verifyDraftPreviewToken } from "@ykzts/utils/draft-preview";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { enableDraftPreviewForSlug } from "@/lib/draft-preview";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const draftSecret = process.env.DRAFT_SECRET;

  if (!draftSecret) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const decodedToken = decodeURIComponent(token);
  const verified = verifyDraftPreviewToken(decodedToken, draftSecret);

  if (!verified) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  return await enableDraftPreviewForSlug(verified.slug, request.url);
}
