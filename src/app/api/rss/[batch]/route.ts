// app/api/rss/[batch]/route.ts
import { RSSBatchProcessor } from "@/lib/rss-processor";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ batch: string }> };

async function processBatchRequest(_req: NextRequest, context: RouteContext) {
  const { batch } = await context.params;
  const batchIndex = parseInt(batch);

  if (isNaN(batchIndex)) {
    return NextResponse.json(
      { success: false, error: `Invalid batch: ${batch}` },
      { status: 400 }
    );
  }

  const result = await RSSBatchProcessor.processBatch(batchIndex);
  return NextResponse.json(result);
}

export async function GET(req: NextRequest, context: RouteContext) {
  return processBatchRequest(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return processBatchRequest(req, context);
}
