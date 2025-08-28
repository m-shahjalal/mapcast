
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000";

export async function getMapCastData() {
  const response = await fetch(`${baseUrl}/api/news`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch map data");
  }

  return response.json();
}

export async function getNewsBySlug(slug: string) {
  const response = await fetch(`${baseUrl}/api/news/${slug}`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  return response.json();
}
