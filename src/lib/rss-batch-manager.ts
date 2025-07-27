import { NewsSourceService } from "@/services/rss.service";

// types/rss-job.ts
export interface BatchJobConfig {
  batchId: string;
  step: number;
  totalSteps: number;
  batchSize: number;
  sources: any[];
  triggeredBy: "api" | "cron";
  timestamp: number;
}

export interface BatchResult {
  batchId: string;
  step: number;
  success: boolean;
  processed: number;
  saved: number;
  executionTime: number;
  error?: string;
}

export class BatchManager {
  private static readonly BATCH_SIZE = 20; // Configurable batch size

  static async createBatches(
    triggeredBy: "api" | "cron" = "cron"
  ): Promise<BatchJobConfig[]> {
    const sources = await NewsSourceService.getSourcesForFetching();
    const totalSteps = Math.ceil(sources.length / this.BATCH_SIZE);
    const batchId = `rss-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const batches: BatchJobConfig[] = [];

    for (let step = 0; step < totalSteps; step++) {
      const start = step * this.BATCH_SIZE;
      const end = Math.min(start + this.BATCH_SIZE, sources.length);

      batches.push({
        batchId,
        step,
        totalSteps,
        batchSize: this.BATCH_SIZE,
        sources: sources.slice(start, end),
        triggeredBy,
        timestamp: Date.now(),
      });
    }

    return batches;
  }

  static async getJobStatus(batchId: string) {
    // You can implement this with Redis/Database to track progress
    // For now, returning mock status
    return {
      batchId,
      status: "running",
      completedSteps: 0,
      totalSteps: 0,
      startTime: Date.now(),
    };
  }
}
