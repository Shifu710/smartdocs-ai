import { ListSkeleton, TableSkeleton } from "@/components/loading-states";

export default function MembersLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 md:px-6">
      <ListSkeleton rows={3} />
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}
