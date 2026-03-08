import { NextRequest, NextResponse } from "next/server";
import { getReportingData } from "@/lib/reporting";
import { MetricName } from "@/types/reporting";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgIdParam = searchParams.get("orgId");
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const metricsParam = searchParams.get("metrics");
    const metrics = metricsParam ? metricsParam.split(",").map(m => m.trim()) : [];

    if (!orgIdParam || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required query parameters: orgId, startDate, endDate" },
        { status: 400 }
      );
    }

    const orgId = parseInt(orgIdParam, 10);
    if (isNaN(orgId)) {
      return NextResponse.json({ error: "orgId must be a number" }, { status: 400 });
    }

    const data = await getReportingData(orgId, startDate, endDate, metrics as MetricName[]);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("/api/reporting GET error", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
