"use server";
import { ApiPagination } from "@/types/api-response";
import { MongoClient } from "mongodb";

const serializeLog = (log: any) => ({
  id: log._id.toString(),
  timestamp: log.timestamp.toISOString(),
  level: log.level,
  message: log.message,
  metadata: log.metadata,
});

export type CrawlLog = ReturnType<typeof serializeLog>;

export const getLogs = async (
  query: Record<string, any>
): Promise<{ data: CrawlLog[]; pagination: ApiPagination }> => {
  const page = Number(query?.page ?? "1");
  const limit = Number(query?.limit ?? "10");
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    const logStream = client.db("logger").collection("news-location-logger");

    const [logs, total] = await Promise.all([
      logStream
        .find()
        .sort({ timestamp: -1 }) // Changed from 1 to -1 for descending order
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      logStream.countDocuments(),
    ]);

    const pagination: ApiPagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    };

    return { data: logs.map(serializeLog), pagination };
  } finally {
    await client.close();
  }
};

export const deleteAllLogs = async () => {
  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const logStream = client.db("logger").collection("news-location-logger");
    const result = await logStream.deleteMany();
    return result;
  } catch (error) {
    return "something went wrong!";
  }
};
