import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mlApiClient } from "@/lib/ml/client";
import { MLInsightRequest } from "@/types/insight";
import { Transaction } from "@/types/transaction";

/**
 * POST /api/insights/generate
 * Generate AI insights for the current user
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", threeMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (transError) {
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "Not enough transaction data" },
        { status: 400 }
      );
    }

    // Fetch current month budgets
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: budgets } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", currentMonth);

    const budgetMap = budgets?.reduce<Record<string, number>>(
      (acc: Record<string, number>, b: { category: string; amount: number }) => {
        acc[b.category] = b.amount;
        return acc;
      },
      {}
    ) || {};

    // Prepare request for ML service
    const mlRequest: MLInsightRequest = {
      user_id: user.id,
      transactions: transactions.map((t: Transaction) => ({
        date: t.date,
        amount: t.amount,
        category: t.category,
        description: t.description,
      })),
      current_month_budget: budgetMap,
    };

    // Call ML service
    const mlResponse = await mlApiClient.generateInsights(mlRequest);

    // Save insights to database
    const insightsToInsert = mlResponse.insights.map((insight) => ({
      user_id: user.id,
      type: insight.type,
      severity: insight.severity,
      title: insight.title,
      description: insight.description,
      suggested_action: insight.suggested_action,
      potential_savings: insight.potential_savings,
      category: insight.category,
      metadata: {
        spending_persona: mlResponse.spending_persona,
        trend_analysis: mlResponse.trend_analysis,
      },
      expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 7 days
    }));

    // Delete old insights for this user
    await supabase
      .from("ai_insights")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Insert new insights
    const { error: insertError } = await supabase
      .from("ai_insights")
      .insert(insightsToInsert);

    if (insertError) {
      console.error("Failed to save insights:", insertError);
      // Don't fail the request if we can't save to DB
    }

    return NextResponse.json(mlResponse);
  } catch (error) {
    console.error("Generate insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

