import { MetricGridSkeleton, TableSkeleton } from "@/components/loading-states";

export default function UsageLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 md:px-6">
      <MetricGridSkeleton />
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
