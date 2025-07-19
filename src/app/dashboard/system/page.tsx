import { AlertsManager } from "./alerts-manager";
import { SystemMetrics } from "./system-metrics";

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <SystemMetrics />
      <AlertsManager />
    </div>
  );
}
