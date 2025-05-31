import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStatsService } from "@/services/dashboard-stats.service";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Nu ești autentificat" },
        { status: 401 }
      );
    }

    // Get owner stats
    const result = await DashboardStatsService.getOwnerStats({
      userId: user.id,
      ownerId: user.ownerId || undefined,
    });

    if (!result.success) {
      const status = result.code === "FORBIDDEN" ? 403 : 500;
      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Owner stats API error:", error);
    return NextResponse.json(
      { error: "Eroare internă a serverului" },
      { status: 500 }
    );
  }
}
