import { runRSSJob } from "@/server/jobs/run-rss";

runRSSJob().catch(console.error);
