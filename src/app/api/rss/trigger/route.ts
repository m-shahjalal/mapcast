import { RSSBatchProcessor } from "@/lib/rss-processor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const totalBatches = await RSSBatchProcessor.getTotalBatches();
  return NextResponse.json({
    totalBatches,
    batchSize: 15,
    examples: {
      "Single batch": "GET /api/rss/0",
      "Run all": "POST /api/rss/trigger",
    },
  });
}

export async function POST(req: NextRequest) {
  const result = await RSSBatchProcessor.processAllBatches();
  return NextResponse.json(result);
}
