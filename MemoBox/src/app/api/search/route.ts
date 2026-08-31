import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lightweight search endpoint powering the command palette (Ctrl/Cmd + K).
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [] });

  let query = supabase
    .from("items")
    .select("id, title, domain, favicon, type, url")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(8);

  query = query.textSearch("search_tsv", q, { type: "websearch", config: "simple" });

  const { data } = await query;
  return NextResponse.json({ items: data ?? [] });
}
