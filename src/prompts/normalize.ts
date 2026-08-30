import type { ResearchPackage } from "@/types";

// ─── System Prompt for LLM #1: Normalize Research ───────────
export function buildNormalizeSystemPrompt(): string {
  return `You are TradeFinex Market Data Normalizer. Your ONLY job is to transform raw web research into a strict JSON structure.

RULES:
1. Return ONLY valid JSON. No markdown, no explanation, no text outside the JSON.
2. NEVER invent financial data. Never fabricate prices, candles, timestamps, volumes, or indicator values.
3. NEVER fabricate historical OHLC data. If candle data is not available in the research, set "candles" to an empty array [].
4. Use null for any numeric field where data is unavailable.
5. Preserve source attribution in the "sources" array.
6. Clearly mark "dataQuality" based on what you actually found:
   - "complete" = price, volume, and some historical data available
   - "partial" = price and some data available, but incomplete
   - "minimal" = only basic price info found
7. Extract support/resistance levels ONLY if they were explicitly mentioned in the research.
8. For indicators, extract ONLY values that were explicitly stated in the research. Use null if not found.
9. Do NOT calculate or infer values. If the research says "RSI is around 65", use 65. If it doesn't mention RSI, use null.
10. Include ALL source URLs from the research in the sources array.

The output JSON MUST match this exact structure:
{
  "symbol": "string - the trading symbol",
  "market": "crypto|forex|stocks|indices|commodities",
  "exchange": "string|null - exchange name",
  "currency": "string|null - quote currency",
  "currentPrice": number|null,
  "previousClose": number|null,
  "change24h": number|null,
  "changePercent24h": number|null,
  "volume24h": number|null,
  "high24h": number|null,
  "low24h": number|null,
  "open24h": number|null,
  "marketCap": number|null,
  "candles": [{"timestamp": number, "open": number, "high": number, "low": number, "close": number, "volume": number}],
  "support": [number],
  "resistance": [number],
  "keyLevels": [{"price": number, "type": "support|resistance", "strength": "string"}],
  "technicalIndicators": {
    "rsi": number|null,
    "macd": {"value": number|null, "signal": number|null, "histogram": number|null},
    "sma20": number|null,
    "sma50": number|null,
    "ema20": number|null
  },
  "timeframe": "string|null",
  "sources": [{"url": "string", "title": "string", "retrievedAt": "string", "type": "tradingview|exchange|financial_portal|news|other"}],
  "dataQuality": "complete|partial|minimal",
  "retrievedAt": "ISO 8601 string"
}`;
}

// ─── Build the user message for normalize call ──────────────
export function buildNormalizeUserMessage(research: ResearchPackage): string {
  const parts: string[] = [];

  parts.push(`=== MARKET RESEARCH FOR ${research.symbol} ===`);
  parts.push(`Market Type: ${research.category}`);
  parts.push(`Retrieved At: ${research.retrievedAt}`);
  parts.push("");

  // Add source information
  parts.push("=== SOURCES ===");
  for (const source of research.sources) {
    parts.push(`- [${source.type}] ${source.title}`);
    parts.push(`  URL: ${source.url}`);
  }
  parts.push("");

  // Add extracted content
  parts.push("=== EXTRACTED CONTENT ===");
  parts.push(research.rawContent.substring(0, 8000));
  parts.push("");

  // Add known price data if any
  if (research.priceData.currentPrice) {
    parts.push("=== KNOWN PRICE DATA ===");
    parts.push(JSON.stringify(research.priceData, null, 2));
  }

  parts.push("");
  parts.push("Transform this research into the required JSON format. Do not invent any data not present in the research.");

  return parts.join("\n");
}
