import { Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function CreditBadge({ credits }: { credits: number }) {
  return (
    <Badge tone={credits > 100 ? "success" : "warning"} className="gap-1">
      <Coins className="h-3.5 w-3.5" aria-hidden="true" />
      {credits.toLocaleString()} credits
    </Badge>
  );
}
