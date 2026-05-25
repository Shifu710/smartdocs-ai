import { PagePanelSkeleton } from "@/components/loading-states";

export default function SettingsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 md:px-6">
      <PagePanelSkeleton />
    </div>
  );
}
