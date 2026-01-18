import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAlertEmail } from "@/lib/email";

// sleep helper function
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// export async function POST(request) {}
export async function GET() {
  try {
    // Use service role to bypass RLS (row level security)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLL_KEY
    );

    // getting  all the prodcuts from the products table
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) throw usersError;

    const userData = users.users;

    // local object to store the cron job status
    let results = {
      total: userData.length,
      alertSent: 0,
    };

    // Iterating every user and sending email
    for (const [ind, user] of userData.entries()) {
      const currentUserEmail = user?.email;
      try {
        if (currentUserEmail) {
          const emailResult = await sendAlertEmail(user.email);
          if (emailResult.success) {
            results.alertSent++;
          }
        }
      } catch (error) {
        console.log(`Failed for user ${user.email}: ${error.message}`);
      }
      console.log("delay start");
      if (ind < userData.length - 1) {
        await sleep(5000);
      }
      console.log("delay end");
    }

    // sending the cron job results as response
    return NextResponse.json({
      success: true,
      message: "users fetched successfully",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
