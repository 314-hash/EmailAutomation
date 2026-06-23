import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function getAiModel() {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const provider = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      headers: { Authorization: `Bearer ${geminiKey}` },
    });
    return provider("gemini-1.5-flash");
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const provider = createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      headers: { Authorization: `Bearer ${openaiKey}` },
    });
    return provider("gpt-4o-mini");
  }

  const lovableKey = process.env.LOVABLE_API_KEY;
  if (lovableKey) {
    const provider = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": lovableKey },
    });
    return provider("google/gemini-3-flash-preview");
  }

  throw new Error("Missing AI API key. Please configure GEMINI_API_KEY, OPENAI_API_KEY, or LOVABLE_API_KEY in your environment.");
}