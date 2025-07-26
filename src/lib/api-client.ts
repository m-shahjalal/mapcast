import { NewsSelect, NewsSourceType as Source } from "@/database/schemas";
import { ApiResponse as Response } from "@/types/api-response";
import axios from "axios";

export const fetcher = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api`,
  headers: { "Content-Type": "application/json" },
  validateStatus: (status) => status >= 200 && status < 500,
});

fetcher.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.resolve({
      success: false,
      message: "Request creation failed",
      error: { code: "REQUEST_FAILED", message: error.message },
      statusCode: 400,
    });
  }
);

fetcher.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === "object" &&
      response.data !== null &&
      typeof response.data.success === "boolean"
    ) {
      return response.data;
    }

    return {
      success: true,
      data: response.data,
      statusCode: response.status,
      message: "OK",
    };
  },
  (error) => {
    const errorResponse: Response = error.response
      ? {
          success: false,
          message: "No response from server",
          error: { code: "NO_RESPONSE", message: "Server is unreachable" },
          statusCode: 504,
        }
      : {
          success: false,
          message: "Network error",
          error: {
            code: "NETWORK_ERROR",
            message: "Please check your internet connection",
          },
          statusCode: 503,
        };

    return Promise.resolve(errorResponse);
  }
);

type Res<T> = Promise<Response<T>>;

const api = {
  rss: {
    list: (queries = ""): Res<Source[]> => fetcher.get(`/rss?${queries}`),
    create: (d: any): Res<Source> => fetcher.post(`/rss`, d),
  },
  news: {
    map: (q = ""): Res<NewsSelect[]> => fetcher.get(`/news/map?${q}`),
    list: (q = ""): Res<NewsSelect[]> => fetcher.get(`/news?${q}`),
  },
};

export default api;
