import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- list emails ----------
export const listEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("emails")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getEmail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("emails")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- seed demo emails ----------
export const seedDemoEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { DEMO_EMAILS } = await import("./demo-emails.server");
    const { count } = await context.supabase
      .from("emails")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) return { inserted: 0 };
    const rows = DEMO_EMAILS.map((e) => ({
      user_id: context.userId,
      from_addr: e.from_addr,
      from_name: e.from_name,
      subject: e.subject,
      body: e.body,
      received_at: new Date(Date.now() - e.received_at_minutes_ago * 60_000).toISOString(),
      status: "pending" as const,
    }));
    const { error } = await context.supabase.from("emails").insert(rows);
    if (error) throw new Error(error.message);
    return { inserted: rows.length };
  });

// ---------- AI processing ----------
const AiSchema = z.object({
  summary: z.string(),
  intent: z.string(),
  urgency: z.enum(["high", "medium", "low"]),
  key_details: z.record(z.string(), z.string()).default({}),
  suggested_reply: z.string(),
  next_action: z.string(),
});

export const processEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), tone: z.enum(["formal", "direct", "friendly"]).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { data: email, error } = await context.supabase
      .from("emails")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!email) throw new Error("Email not found");

    const tone = data.tone ?? "formal";
    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const system = `You are an AI email assistant for a supply chain and operations team. Analyze the email and return ONLY a JSON object with this exact shape:
{
  "summary": "2-3 sentence summary",
  "intent": "short label e.g. 'order issue', 'delay notification', 'invoice dispute', 'price negotiation', 'internal FYI', 'newsletter'",
  "urgency": "high|medium|low",
  "key_details": { "Sender": "...", "Company": "...", "Order ID": "...", "Dates": "...", "Issue": "..." },
  "suggested_reply": "professional reply, ${tone} tone, ready to send",
  "next_action": "one of: reply, escalate, follow-up, schedule, archive — with a short reason"
}
Only include keys in key_details that are actually present. Never invent data. No prose outside JSON.`;

    const prompt = `From: ${email.from_name ?? ""} <${email.from_addr}>
Subject: ${email.subject}
Received: ${email.received_at}

${email.body}`;

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned no JSON");
    const parsed = AiSchema.parse(JSON.parse(jsonMatch[0]));

    const { error: updErr } = await context.supabase
      .from("emails")
      .update({
        summary: parsed.summary,
        intent: parsed.intent,
        urgency: parsed.urgency,
        key_details: parsed.key_details,
        suggested_reply: parsed.suggested_reply,
        next_action: parsed.next_action,
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", email.id);
    if (updErr) throw new Error(updErr.message);

    return parsed;
  });

// ---------- process all pending ----------
export const processPending = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: pending, error } = await context.supabase
      .from("emails")
      .select("id")
      .eq("status", "pending")
      .limit(20);
    if (error) throw new Error(error.message);
    const ids = (pending ?? []).map((r) => r.id);
    let done = 0;
    for (const id of ids) {
      try {
        await processEmail({ data: { id } });
        done++;
      } catch (e) {
        console.error("processEmail failed", id, e);
      }
    }
    return { processed: done };
  });

// ---------- send / mark replied ----------
export const markReplied = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), reply: z.string().min(1) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("emails")
      .update({
        suggested_reply: data.reply,
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const archiveEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("emails")
      .update({ status: "archived" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- analytics ----------
export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("emails")
      .select("status, urgency, processed_at, replied_at, received_at");
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const total = rows.length;
    const processed = rows.filter((r) => r.processed_at).length;
    const replied = rows.filter((r) => r.status === "replied").length;
    const urgent = rows.filter((r) => r.urgency === "high").length;
    const avgResponseMin = (() => {
      const diffs = rows
        .filter((r) => r.replied_at && r.received_at)
        .map((r) => (new Date(r.replied_at!).getTime() - new Date(r.received_at).getTime()) / 60000);
      if (!diffs.length) return null;
      return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    })();
    return { total, processed, replied, urgent, avgResponseMin };
  });