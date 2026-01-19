import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// export async function POST(request) {}
export async function GET() {
  try {
    // Use service role to bypass RLS (row level security)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLL_KEY,
    );

    // getting  all the prodcuts from the products table
    const { data, error: dbError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (dbError) throw usersError;

    // sending the cron job results as response
    return NextResponse.json({
      success: true,
      message: "cron jon to keep db awake, successfully executed",
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
