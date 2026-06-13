import { handleRevalidate } from "@ykzts/supabase/revalidate";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await handleRevalidate(request);
}
