import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUrlMetadata } from "@/lib/metadata";
import { isValidUrl } from "@/lib/utils";

// Fetch Open Graph metadata for a pasted URL (used by the quick-add flow).
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url).searchParams.get("url")?.trim();
  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const metadata = await fetchUrlMetadata(url);
  return NextResponse.json(metadata, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
