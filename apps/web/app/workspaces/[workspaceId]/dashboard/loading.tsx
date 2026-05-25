import { MetricGridSkeleton, PagePanelSkeleton } from "@/components/loading-states";

export default function DashboardLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-6">
      <div className="h-6 w-56 animate-pulse rounded-md bg-muted" />
      <MetricGridSkeleton />
      <PagePanelSkeleton />
    </div>
  );
}
