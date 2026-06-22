import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Sparkles, Zap, Shield, BarChart3, Inbox, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Triage — AI Email Assistant for Supply Chain Teams" },
      {
        name: "description",
        content:
          "Triage reads, classifies and drafts replies for every email hitting your supply chain inbox — so urgent issues never get buried.",
      },
      { property: "og:title", content: "Triage — AI Email Assistant" },
      {
        property: "og:description",
        content: "Cut response time on urgent supplier emails by 80%. Built for ops and supply chain teams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Triage</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,oklch(0.66_0.18_275/0.18),transparent)]" />
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> AI built for operations teams
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            The inbox that runs your <span className="text-primary">supply chain</span>, not the other way around.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Triage reads every email, ranks urgency, extracts order IDs and dates, and drafts a reply your team can send in one click.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              See how it works
            </a>
          </div>

          {/* Product preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
              <div className="rounded-lg border border-border bg-background">
                <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                  <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                </div>
                <div className="grid grid-cols-12 gap-0">
                  <div className="col-span-3 border-r border-border p-4">
                    <div className="label-eyebrow mb-3">Inbox</div>
                    <div className="space-y-1.5">
                      {[
                        { t: "Container stuck at Rotterdam", u: "high" },
                        { t: "Short shipment PO 88231", u: "high" },
                        { t: "Q3 packaging counter…", u: "medium" },
                        { t: "Dock door 14 down", u: "low" },
                      ].map((r) => (
                        <div key={r.t} className="flex items-center gap-2 rounded p-1.5 text-left text-[11px]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${r.u === "high" ? "bg-destructive" : r.u === "medium" ? "bg-warning" : "bg-muted-foreground/50"}`}
                          />
                          <span className="truncate text-muted-foreground">{r.t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-9 p-6 text-left">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">High</span>
                      <span className="text-[11px] text-muted-foreground">order issue</span>
                    </div>
                    <h3 className="text-sm font-semibold">URGENT: Container MSCU7841299 stuck at Rotterdam</h3>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Container holding 26 pallets of automotive sensors hasn't been released from Rotterdam terminal despite customs clearance. Vessel cut-off in 4 hours; missing it pushes delivery 9 days and risks line stoppage in Wolfsburg.
                    </p>
                    <div className="mt-4 rounded-md border border-border bg-card p-3 text-xs">
                      <div className="label-eyebrow mb-1.5">Suggested reply</div>
                      Hi Julia, escalating with APMT operations now and looping in our Rotterdam agent. Will confirm release status within 30 minutes…
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label-eyebrow text-center">Features</div>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Every email, instantly understood and ready to act on.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Zap, t: "Urgency detection", d: "Every incoming email is scored High / Medium / Low so the line-down emergency never sits behind a newsletter." },
              { Icon: Inbox, t: "Structured extraction", d: "Order IDs, sender, company, dates, dollar amounts — pulled out automatically and shown beside the message." },
              { Icon: Sparkles, t: "One-click replies", d: "Professional drafts in your tone, ready to edit and send. Saves 6+ minutes per email." },
              { Icon: BarChart3, t: "Workflow analytics", d: "See response times, urgent volume and team throughput in one panel." },
              { Icon: Shield, t: "Enterprise security", d: "OAuth-only inbox access. Data encrypted at rest and in transit. GDPR-ready." },
              { Icon: Mail, t: "Outlook & Gmail", d: "Connect your existing mailbox in one click. No forwarding rules, no IT tickets." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-6">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label-eyebrow text-center">How it works</div>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Connect once. Triage runs in the background.
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Connect", "Sign in with Outlook or Gmail. We pull the latest messages and stay in sync."],
              ["02", "Analyze", "Each email gets a summary, urgency tag, intent classification and extracted key fields."],
              ["03", "Respond", "Approve the suggested reply, tweak the tone, or escalate — all from one screen."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div className="font-mono text-xs text-primary">{n}</div>
                <h3 className="mt-2 text-base font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="label-eyebrow text-center">Pricing</div>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Pay for what you process.
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              { name: "Starter", price: "$0", limit: "200 emails / mo", features: ["AI summary + urgency", "1 inbox", "Community support"] },
              { name: "Growth", price: "$49", limit: "2,500 emails / mo", features: ["Smart replies", "3 inboxes", "Email support"], highlight: true },
              { name: "Pro", price: "$149", limit: "12,000 emails / mo", features: ["Custom tone profiles", "10 inboxes", "Analytics + exports"] },
              { name: "Enterprise", price: "Custom", limit: "Unlimited", features: ["SSO + SAML", "DPA & audit log", "Dedicated CSM"] },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-xl border p-6 ${p.highlight ? "border-primary/60 bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {p.price}
                  {p.price !== "Custom" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.limit}</div>
                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
        <div>© 2026 Triage</div>
        <div>Built for supply chain teams.</div>
      </footer>
    </div>
  );
}
