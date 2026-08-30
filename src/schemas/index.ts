// Lightweight schema validation (no external dependency)
// Validates structure of LLM responses

export function validateNormalized(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.symbol === "string" || d.currentPrice === null || typeof d.currentPrice === "number";
}

export function validateAnalysis(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.summary === "string" && ["bullish","bearish","neutral","mixed"].includes(d.trend as string);
}
