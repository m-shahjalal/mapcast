import { NewsService } from "@/server/services/news.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    const news = await NewsService.getMapData(filters as any);

    return NextResponse.json(news, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}
