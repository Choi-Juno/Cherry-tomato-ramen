import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const body = await request.json();
    const { message_id } = body;

    if (!message_id) {
      return NextResponse.json(
        { error: "Message ID required" },
        { status: 400 }
      );
    }

    // Update the coaching log to mark challenge as accepted
    const { error: updateError } = await supabase
      .from("coaching_logs")
      .update({ challenge_accepted: true })
      .eq("user_id", user.id)
      .eq("message_data->>id", message_id);

    if (updateError) {
      console.warn("Failed to update challenge status:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept challenge error:", error);
    return NextResponse.json(
      { error: "Failed to accept challenge" },
      { status: 500 }
    );
  }
}

