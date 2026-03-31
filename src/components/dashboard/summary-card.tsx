import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-6">
        <div className="absolute right-4 top-4 rounded-full bg-primary/10 p-2 text-primary">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
        <div className="mt-2 text-sm text-muted-foreground">{helper}</div>
      </CardContent>
    </Card>
  );
}
