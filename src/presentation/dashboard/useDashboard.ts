import { useDashboard as useDashboardController } from "@/lib/hooks/useDashboardController";

export function useDashboard() {
  console.log("Debug flow: presentation/useDashboard fired");
  return useDashboardController();
}
