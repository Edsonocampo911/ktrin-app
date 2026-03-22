import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll(c) { c.forEach(({name,value,options}) => cookieStore.set(name,value,options)); } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    const body = await request.json();
    const { qr_token } = body;
    if (!qr_token) return NextResponse.json({ success: false, error: "MISSING_TOKEN" }, { status: 400 });
    const { data, error } = await supabase.rpc("validate_qr_secure", { p_qr_token: qr_token, p_validator_id: user.id });
    if (error) return NextResponse.json({ success: false, error: "VALIDATION_ERROR", message: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "INTERNAL_ERROR", message: error.message }, { status: 500 });
  }
}