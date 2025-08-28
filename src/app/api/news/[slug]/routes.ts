import { NewsService } from "@/server/services/news.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const news = await NewsService.findBySlug(slug);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: "News not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(news, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // Cache for 30 minutes, stale-while-revalidate for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching news by slug:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}
