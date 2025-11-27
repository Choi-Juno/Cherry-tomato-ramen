import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile with birth_year
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("birth_year")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.birth_year) {
      return NextResponse.json(
        {
          error: "Birth year not set",
          message:
            "설정에서 출생연도를 입력하면 또래 비교 기능을 이용할 수 있어요.",
        },
        { status: 400 }
      );
    }

    // Fetch current month transactions
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("date, amount, category, time_slot")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .gte("date", `${currentMonth}-01`)
      .order("date", { ascending: false });

    if (txError) {
      throw txError;
    }

    // Call ML service
    const response = await fetch(`${ML_SERVICE_URL}/coaching/peer-comparison`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        birth_year: profile.birth_year,
        transactions: transactions || [],
        period: currentMonth,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ML Service Error (${response.status}):`, errorText);
      throw new Error(`ML service error: ${response.status}`);
    }

    const result = await response.json();

    // Log the comparison (optional)
    try {
      await supabase.from("coaching_logs").insert({
        user_id: user.id,
        message_type: "peer_comparison",
        message_data: result.comparison,
      });
    } catch (logError) {
      console.warn("Failed to log peer comparison:", logError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Peer comparison error:", error);
    return NextResponse.json(
      { error: "Failed to generate peer comparison" },
      { status: 500 }
    );
  }
}

