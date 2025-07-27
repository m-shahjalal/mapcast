import { RSSBatchProcessor } from "@/lib/rss-processor";
import { NextRequest, NextResponse } from "next/server";

async function processBatchRequest(
  req: NextRequest,
  params: { batch: string }
) {
  const batchIndex = parseInt(params.batch);

  if (isNaN(batchIndex)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid batch: ${params.batch}`,
      },
      { status: 400 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const triggeredBy =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ? "cron" : "api";

  const result = await RSSBatchProcessor.processBatch(batchIndex, triggeredBy);
  return NextResponse.json(result);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { batch: string } }
) {
  return processBatchRequest(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { batch: string } }
) {
  return processBatchRequest(req, params);
}
