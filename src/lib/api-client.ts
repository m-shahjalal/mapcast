import { NewsSelect, NewsSourceType as Source } from "@/server/schemas";
import { ApiResponse as Response } from "@/types/api-response";
import axios from "axios";

const fetcher = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://your-domain.com/"
      : "http://localhost:3000/",
  headers: {
    "Content-Type": "application/json",
  },
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
    let errorResponse: Response = {
      success: false,
      message: "Network error",
      error: {
        code: "NETWORK_ERROR",
        message: "Please check your internet connection",
      },
      statusCode: 503,
    };

    if (error.response) {
      errorResponse = {
        success: false,
        message: "No response from server",
        error: { code: "NO_RESPONSE", message: "Server is unreachable" },
        statusCode: 504,
      };
    }

    return Promise.resolve(errorResponse);
  }
);

type Res<T> = Promise<Response<T>>;

export const api = {
  rss: {
    list: (): Promise<Response<Source[]>> => fetcher.get(`/api/rss`),
    create: (d: any): Promise<Response<Source>> => fetcher.post(`/api/rss`, d),
  },
  news: {
    list: (): Res<NewsSelect[]> => fetcher.get("/api/news"),
  },
};
