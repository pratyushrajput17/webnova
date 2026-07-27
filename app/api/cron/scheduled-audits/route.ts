import { NextRequest, NextResponse } from "next/server";
import { processDueSchedules } from "@/lib/scheduled-audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[CRON] CRON_SECRET environment variable is not set.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[CRON] Unauthorized cron request attempted.");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  console.log("[CRON] Starting scheduled audits processing...");

  try {
    const result = await processDueSchedules();

    console.log(
      `[CRON] Completed. Processed: ${result.processed}, Succeeded: ${result.succeeded}, Failed: ${result.failed}, LimitReached: ${result.limitReached}`
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Unhandled error during processing:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal processing error.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
