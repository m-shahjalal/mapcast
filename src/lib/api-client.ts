import { NewsSourceType } from "@/server/schemas";
import { ApiResponse } from "@/types/api-response";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetch(url);
    return await response.json();
  },
  post: async <T>(url: string, data: T): Promise<ApiResponse<T>> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json().catch((error) => {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    });
  },
};

export const api = {
  _: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  },
  rss: {
    list: () => fetcher.get<NewsSourceType[]>(`${api._.baseUrl}/rss`),
    create: (data: any) => fetcher.post(`${api._.baseUrl}/rss`, data),
  },
};
