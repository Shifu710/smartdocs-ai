import { ListSkeleton, PagePanelSkeleton } from "@/components/loading-states";

export default function ChatLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[280px_1fr] md:px-6">
      <ListSkeleton rows={4} />
      <PagePanelSkeleton />
    </div>
  );
}
