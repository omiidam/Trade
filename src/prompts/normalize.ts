import type { ResearchPackage } from "@/types";

export function buildNormalizeSystemPrompt(): string {
  return `You are a market data normalizer. Transform web research into strict JSON.
Rules:
- Return ONLY valid JSON.
- Never invent financial data (prices, candles, timestamps, volumes).
- Use null for unavailable data.
- Preserve source attribution.
- Clearly distinguish observed data from calculated data.

Output schema:
{
  "symbol": "string",
  "currentPrice": number|null,
  "change24h": number|null,
  "changePercent24h": number|null,
  "volume24h": number|null,
  "support": number[],
  "resistance": number[],
  "sources": [{ "url": "string", "title": "string", "type": "string" }],
  "context": "string - brief market context from the research"
}`;
}

export function buildNormalizeUserMessage(research: ResearchPackage): string {
  return `Symbol: ${research.symbol}
Category: ${research.category}
Price data found: ${JSON.stringify(research.priceData)}
Sources: ${research.sources.map(s => `${s.title} (${s.url})`).join(", ")}
Web content:
${research.text.slice(0, 3000)}

Normalize this into the JSON schema.`;
}
