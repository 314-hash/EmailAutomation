import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmail, processEmail, markReplied, archiveEmail } from "@/lib/emails.functions";
import { ArrowLeft, Loader2, Sparkles, Send, Archive, CheckCircle2, Check, Trash2, RefreshCw, SlidersHorizontal, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/app/email/$id")({
  component: EmailDetail,
});

type EmailRow = {
  id: string;
  from_addr: string;
  from_name: string | null;
  subject: string;
  body: string;
  received_at: string;
  summary: string | null;
  intent: string | null;
  urgency: string | null;
  key_details: Record<string, string> | null;
  suggested_reply: string | null;
  next_action: string | null;
  status: string;
};

function EmailDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getEmail);
  const proc = useServerFn(processEmail);
  const send = useServerFn(markReplied);
  const archive = useServerFn(archiveEmail);

  const [tone, setTone] = useState<"formal" | "direct" | "friendly">("formal");
  const [reply, setReply] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<"draft" | "kept" | "discarded">("draft");
  const [showAdjust, setShowAdjust] = useState(false);

  const q = useQuery({
    queryKey: ["email", id],
    queryFn: () => get({ data: { id } }) as Promise<EmailRow | null>,
  });

  useEffect(() => {
    if (q.data?.suggested_reply) setReply(q.data.suggested_reply);
  }, [q.data?.suggested_reply]);

  const processMut = useMutation({
    mutationFn: (opts?: { prompt?: string }) => proc({ data: { id, tone, prompt: opts?.prompt } }),
    onSuccess: (_r, vars) => {
      toast.success(vars?.prompt ? "Draft regenerated" : "Analyzed");
      setLastPrompt(vars?.prompt ?? null);
      setDraftState("draft");
      qc.invalidateQueries({ queryKey: ["email", id] });
      qc.invalidateQueries({ queryKey: ["emails"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendMut = useMutation({
    mutationFn: () => send({ data: { id, reply } }),
    onSuccess: () => {
      toast.success("Reply sent", { description: `Delivered to ${e?.from_addr ?? "recipient"}` });
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["email", id] });
      qc.invalidateQueries({ queryKey: ["emails"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archiveMut = useMutation({
    mutationFn: () => archive({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emails"] });
      navigate({ to: "/app" });
    },
  });

  if (q.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  const e = q.data;
  if (!e) {
    return <div className="p-8 text-sm text-muted-foreground">Email not found.</div>;
  }

  const isReplied = e.status === "replied";

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Inbox
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => archiveMut.mutate()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
          >
            <Archive className="h-3.5 w-3.5" /> Archive
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* Email body */}
        <section className="col-span-7 overflow-y-auto border-r border-border px-8 py-6">
          <h1 className="text-xl font-semibold tracking-tight">{e.subject}</h1>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{e.from_name ?? e.from_addr}</span>
            <span>{e.from_addr}</span>
            <span className="font-mono">{new Date(e.received_at).toLocaleString()}</span>
          </div>
          <pre className="mt-8 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{e.body}</pre>
        </section>

        {/* AI panel */}
        <aside className="col-span-5 overflow-y-auto bg-card/40 px-6 py-6">
          {!e.summary ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Not analyzed yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Run AI analysis to extract details and draft a reply.</p>
              <button
                onClick={() => processMut.mutate()}
                disabled={processMut.isPending}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {processMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Analyze with AI
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="label-eyebrow">AI Analysis</div>
                <button
                  onClick={() => processMut.mutate()}
                  disabled={processMut.isPending}
                  className="text-xs text-muted-foreground hover:text-foreground"
                  title="Re-analyze"
                >
                  {processMut.isPending ? "…" : "Re-run"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.urgency && (
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      e.urgency === "high"
                        ? "bg-destructive/15 text-destructive"
                        : e.urgency === "medium"
                        ? "bg-warning/15 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.urgency} urgency
                  </span>
                )}
                {e.intent && <span className="rounded bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">{e.intent}</span>}
              </div>
              <p className="mt-4 text-sm leading-relaxed">{e.summary}</p>

              {e.key_details && Object.keys(e.key_details).length > 0 && (
                <div className="mt-6">
                  <div className="label-eyebrow mb-2">Key details</div>
                  <dl className="space-y-1.5 rounded-md border border-border bg-card p-3 text-xs">
                    {Object.entries(e.key_details).map(([k, v]) => (
                      <div key={k} className="grid grid-cols-3 gap-2">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="col-span-2 font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {e.next_action && (
                <div className="mt-6">
                  <div className="label-eyebrow mb-2">Next action</div>
                  <div className="rounded-md border border-border bg-card p-3 text-xs">{e.next_action}</div>
                </div>
              )}

              <div className="mt-6">
                <div className="label-eyebrow mb-2">Drafted reply</div>

                {draftState === "discarded" ? (
                  <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
                    <Trash2 className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">Draft discarded</p>
                    <p className="mt-1 text-xs text-muted-foreground">Generate a new one with your own instruction.</p>
                    <button
                      onClick={() => { setDraftState("draft"); setUserPrompt(""); }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
                    >
                      <Wand2 className="h-3.5 w-3.5" /> Start over
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                    {/* Prompt header pill */}
                    {lastPrompt && (
                      <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Wand2 className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium text-foreground">{lastPrompt}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">AI-generated</span>
                      </div>
                    )}

                    {/* Draft body */}
                    {processMut.isPending ? (
                      <div className="flex h-48 items-center justify-center px-4 text-xs text-muted-foreground">
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Drafting reply…
                      </div>
                    ) : draftState === "kept" ? (
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-foreground/90">
                        {reply}
                      </pre>
                    ) : (
                      <textarea
                        value={reply}
                        onChange={(ev) => setReply(ev.target.value)}
                        className="block h-56 w-full resize-none bg-transparent px-4 py-4 text-sm leading-relaxed outline-none"
                      />
                    )}

                    {/* Adjust panel (tone) */}
                    {showAdjust && (
                      <div className="border-t border-border bg-muted/30 px-4 py-3">
                        <div className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">Tone</div>
                        <div className="flex items-center gap-1 rounded border border-border bg-card p-0.5 text-[11px]">
                          {(["formal", "direct", "friendly"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setTone(t);
                                processMut.mutate({ prompt: userPrompt.trim() || lastPrompt || undefined });
                              }}
                              className={`flex-1 rounded px-2 py-1 capitalize ${tone === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* "Anything you'd like to change?" input */}
                    {draftState === "draft" && !processMut.isPending && (
                      <div className="border-t border-border px-4 py-3">
                        <form
                          onSubmit={(ev) => {
                            ev.preventDefault();
                            const p = userPrompt.trim();
                            if (!p) return;
                            processMut.mutate({ prompt: p });
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            value={userPrompt}
                            onChange={(ev) => setUserPrompt(ev.target.value)}
                            placeholder="Anything you'd like to change?"
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                          />
                          {userPrompt.trim() && (
                            <button
                              type="submit"
                              className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90"
                            >
                              Apply
                            </button>
                          )}
                        </form>
                      </div>
                    )}

                    {/* Keep / Discard / Regenerate / Adjust */}
                    <div className="flex items-center gap-1 border-t border-border bg-muted/20 px-2 py-2">
                      {draftState === "kept" || isReplied ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2.5 py-1.5 text-[11px] font-medium text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> {isReplied ? "Sent" : "Kept"}
                          </span>
                          {!isReplied && (
                            <button
                              onClick={() => setDraftState("draft")}
                              className="ml-auto rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                              Edit again
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setDraftState("kept"); toast.success("Draft kept"); }}
                            disabled={processMut.isPending || !reply.trim()}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Keep
                          </button>
                          <button
                            onClick={() => setDraftState("discarded")}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Discard
                          </button>
                          <button
                            onClick={() => processMut.mutate({ prompt: lastPrompt ?? userPrompt.trim() || undefined })}
                            disabled={processMut.isPending}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${processMut.isPending ? "animate-spin" : ""}`} /> Regenerate
                          </button>
                          <button
                            onClick={() => setShowAdjust((s) => !s)}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] hover:bg-accent hover:text-foreground ${showAdjust ? "bg-accent text-foreground" : "text-muted-foreground"}`}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust
                          </button>
                          <span className="ml-auto text-[10px] text-muted-foreground">AI-generated content may be inaccurate</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Send action — only after Keep */}
                {draftState === "kept" && !isReplied && (
                  <div className="mt-3 flex items-center justify-end">
                    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={sendMut.isPending || !reply.trim()}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {sendMut.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Approve & Send
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send reply to {e.from_name ?? e.from_addr}?</AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-2 text-xs">
                              <div className="flex flex-col gap-0.5">
                                <span><span className="text-muted-foreground">To:</span> {e.from_addr}</span>
                                <span><span className="text-muted-foreground">Subject:</span> Re: {e.subject}</span>
                              </div>
                              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-card p-3 text-foreground/90">
                                {reply}
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={sendMut.isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(ev) => {
                              ev.preventDefault();
                              sendMut.mutate();
                            }}
                            disabled={sendMut.isPending}
                          >
                            {sendMut.isPending ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending…
                              </>
                            ) : (
                              <>
                                <Send className="mr-1.5 h-3.5 w-3.5" /> Send now
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Proof of concept: approved replies are logged as sent. Outlook dispatch can be wired in later.
                </p>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}