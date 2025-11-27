import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("date, amount, category")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .gte("date", threeMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (txError) {
      throw txError;
    }

    // Call ML service
    const response = await fetch(`${ML_SERVICE_URL}/coaching/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        transactions: transactions || [],
      }),
    });

    if (!response.ok) {
      throw new Error("ML service error");
    }

    const result = await response.json();

    // Log the coaching message (optional - for tracking)
    try {
      await supabase.from("coaching_logs").insert({
        user_id: user.id,
        message_type: "coaching",
        message_data: result.message,
      });
    } catch (logError) {
      // Don't fail if logging fails
      console.warn("Failed to log coaching message:", logError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Coaching message error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching message" },
      { status: 500 }
    );
  }
}

