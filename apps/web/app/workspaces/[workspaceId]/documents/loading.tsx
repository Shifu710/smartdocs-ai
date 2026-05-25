import { ListSkeleton } from "@/components/loading-states";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 md:px-6">
      <Skeleton className="h-7 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <ListSkeleton rows={4} />
        </CardContent>
      </Card>
    </div>
  );
}
