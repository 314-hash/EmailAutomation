import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listEmails, seedDemoEmails, processPending } from "@/lib/emails.functions";
import { Loader2, Sparkles, Mail, Filter, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/")({
  component: InboxPage,
});

type UrgencyFilter = "all" | "high" | "medium" | "low" | "pending";

function UrgencyBadge({ u }: { u: string | null }) {
  if (!u) return <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">unprocessed</span>;
  const cls =
    u === "high"
      ? "bg-destructive/15 text-destructive"
      : u === "medium"
      ? "bg-warning/15 text-warning"
      : "bg-muted text-muted-foreground";
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${cls}`}>{u}</span>;
}

function timeAgo(iso: string) {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

function InboxPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<UrgencyFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("You must be logged in to upload files.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        const { error } = await supabase.from("emails").insert({
          user_id: user.id,
          from_addr: "uploaded-file@local",
          from_name: `Uploaded File (${file.name})`,
          subject: `Document: ${file.name.replace(/\.[^/.]+$/, "")}`,
          body: text,
          status: "pending",
        });

        if (error) {
          toast.error(`Upload failed: ${error.message}`);
        } else {
          toast.success(`Successfully uploaded "${file.name}" as pending triage!`);
          if (fileInputRef.current) fileInputRef.current.value = "";
          qc.invalidateQueries({ queryKey: ["emails"] });
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      toast.error(`Error reading file: ${err.message}`);
    }
  };

  const list = useServerFn(listEmails);
  const seed = useServerFn(seedDemoEmails);
  const process = useServerFn(processPending);

  const emailsQ = useQuery({ queryKey: ["emails"], queryFn: () => list() });

  // First-run seed
  useEffect(() => {
    if (emailsQ.data && emailsQ.data.length === 0) {
      seed().then(() => qc.invalidateQueries({ queryKey: ["emails"] }));
    }
  }, [emailsQ.data, seed, qc]);

  const processMut = useMutation({
    mutationFn: () => process(),
    onSuccess: (r: { processed: number }) => {
      toast.success(`Processed ${r.processed} emails`);
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const emails = (emailsQ.data ?? []) as Array<{
    id: string;
    from_addr: string;
    from_name: string | null;
    subject: string;
    body: string;
    received_at: string;
    summary: string | null;
    intent: string | null;
    urgency: string | null;
    status: string;
  }>;
  const filtered = useMemo(() => {
    return emails.filter((e) => {
      if (filter === "all") return true;
      if (filter === "pending") return e.status === "pending";
      return e.urgency === filter;
    });
  }, [emails, filter]);

  const pendingCount = emails.filter((e) => e.status === "pending").length;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Inbox</h1>
          <p className="text-xs text-muted-foreground">{emails.length} emails · {pendingCount} unprocessed</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.csv,.eml,.json,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </button>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5 text-xs">
            <Filter className="ml-1.5 h-3 w-3 text-muted-foreground" />
            {(["all", "high", "medium", "low", "pending"] as UrgencyFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-1 capitalize ${filter === f ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => processMut.mutate()}
            disabled={processMut.isPending || pendingCount === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {processMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Process with AI {pendingCount > 0 && `(${pendingCount})`}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {emailsQ.isLoading && (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading inbox…
          </div>
        )}
        {!emailsQ.isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
            <Mail className="mb-3 h-8 w-8 opacity-50" />
            No emails match this filter.
          </div>
        )}
        <ul className="divide-y divide-border">
          {filtered.map((e) => (
            <li
              key={e.id}
              onClick={() => navigate({ to: "/app/email/$id", params: { id: e.id } })}
              className="cursor-pointer px-6 py-3.5 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium uppercase">
                  {(e.from_name ?? e.from_addr).slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{e.from_name ?? e.from_addr}</span>
                    <UrgencyBadge u={e.urgency} />
                    {e.intent && (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">{e.intent}</span>
                    )}
                    {e.status === "replied" && (
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-success">replied</span>
                    )}
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{timeAgo(e.received_at)}</span>
                  </div>
                  <div className="mt-0.5 truncate text-sm font-medium">{e.subject}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {e.summary ?? e.body.slice(0, 200)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}