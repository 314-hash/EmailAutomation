import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/lib/emails.functions";
import { TrendingUp, Inbox, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const get = useServerFn(getAnalytics);
  const q = useQuery({
    queryKey: ["analytics"],
    queryFn: () => get() as Promise<{ total: number; processed: number; replied: number; urgent: number; avgResponseMin: number | null }>,
  });

  const stats = q.data ?? { total: 0, processed: 0, replied: 0, urgent: 0, avgResponseMin: null };
  const productivityGain = stats.replied ? Math.round(stats.replied * 6.4) : 0; // ~6.4 min saved per AI reply

  const cards = [
    { label: "Emails processed", value: stats.processed, sub: `of ${stats.total} total`, Icon: Inbox },
    { label: "Urgent handled", value: stats.urgent, sub: "high-priority", Icon: AlertTriangle, accent: "text-destructive" },
    { label: "Replies sent", value: stats.replied, sub: "via AI suggestions", Icon: CheckCircle2, accent: "text-success" },
    { label: "Avg response time", value: stats.avgResponseMin != null ? `${stats.avgResponseMin}m` : "—", sub: "from received to replied", Icon: Clock },
    { label: "Time saved", value: `${productivityGain}m`, sub: "≈ 6.4m per AI reply", Icon: TrendingUp, accent: "text-primary" },
  ];

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold">Analytics</h1>
        <p className="text-xs text-muted-foreground">Productivity and response performance across your inbox.</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ label, value, sub, Icon, accent }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="label-eyebrow">{label}</div>
                <Icon className={`h-4 w-4 ${accent ?? "text-muted-foreground"}`} />
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}