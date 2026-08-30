import type { ChartData, ResearchPackage } from "@/types";

// ─── System Prompt for LLM #2: Analyze ─────────────────────
export function buildAnalyzeSystemPrompt(): string {
  return `You are TradeFinex AI Market Analyst. You provide professional technical analysis based on supplied data.

RULES:
1. Analyze ONLY the supplied market data. Do not invent market data.
2. Clearly distinguish facts from interpretation.
3. Do not guarantee future price movements.
4. Mention limitations in the supplied data.
5. Follow the user's requested analysis objective.
6. Use a measured, professional tone appropriate for financial analysis.
7. If data is incomplete, state what you CAN and CANNOT analyze.
8. Support/resistance levels should be based on the provided data.
9. Signal strength should reflect the quality of evidence.

Return ONLY valid JSON matching this structure:
{
  "summary": "string - 2-3 sentence overall analysis summary",
  "trend": "bullish|bearish|neutral|mixed",
  "confidence": "high|medium|low",
  "support": [number - key support price levels],
  "resistance": [number - key resistance price levels],
  "signals": [
    {
      "type": "bullish|bearish|neutral",
      "name": "string - signal name",
      "description": "string - brief description",
      "strength": "strong|moderate|weak"
    }
  ],
  "risks": ["string - identified risks or concerns"],
  "reasoning": ["string - step-by-step reasoning for the analysis"],
  "dataLimitations": ["string - what data was missing or limited"],
  "keyLevels": {
    "entry": number|null,
    "invalidation": number|null,
    "target1": number|null,
    "target2": number|null
  },
  "disclaimer": "string - standard disclaimer"
}`;
}

// ─── Build the user message for analysis call ───────────────
export function buildAnalyzeUserMessage(
  chartData: ChartData,
  research: ResearchPackage,
  userPrompt: string
): string {
  const parts: string[] = [];

  // Include chart data
  parts.push("=== MARKET DATA ===");
  parts.push(`Symbol: ${chartData.symbol}`);
  parts.push(`Market: ${chartData.market}`);
  parts.push(`Exchange: ${chartData.exchange}`);
  parts.push(`Currency: ${chartData.currency}`);
  parts.push(`Timeframe: ${chartData.timeframe}`);
  parts.push(`Current Price: ${chartData.currentPrice ?? "N/A"}`);
  parts.push(`24h Change: ${chartData.change24h ?? "N/A"} (${chartData.changePercent24h ?? "N/A"}%)`);
  parts.push(`24h Volume: ${chartData.volume24h ?? "N/A"}`);
  parts.push("");

  // Include recent candles (last 20 for context)
  if (chartData.candles.length > 0) {
    parts.push("=== RECENT CANDLES (latest 20) ===");
    const recentCandles = chartData.candles.slice(-20);
    for (const c of recentCandles) {
      const date = new Date(c.timestamp).toISOString();
      parts.push(`${date} | O:${c.open} H:${c.high} L:${c.low} C:${c.close} V:${c.volume}`);
    }
    parts.push("");
  }

  // Include calculated indicators
  if (chartData.indicators) {
    parts.push("=== TECHNICAL INDICATORS ===");
    const ind = chartData.indicators;
    const lastIdx = Math.max(0, (chartData.candles.length || 1) - 1);

    const sma20Last = ind.sma20[lastIdx];
    const sma50Last = ind.sma50[lastIdx];
    const ema20Last = ind.ema20[lastIdx];
    const rsiLast = ind.rsi14[lastIdx];
    const macdLast = ind.macd.macd[lastIdx];
    const macdSignalLast = ind.macd.signal[lastIdx];
    const bbUpper = ind.bollingerBands.upper[lastIdx];
    const bbLower = ind.bollingerBands.lower[lastIdx];
    const atrLast = ind.atr14[lastIdx];

    if (sma20Last !== null) parts.push(`SMA 20: ${sma20Last.toFixed(2)}`);
    if (sma50Last !== null) parts.push(`SMA 50: ${sma50Last.toFixed(2)}`);
    if (ema20Last !== null) parts.push(`EMA 20: ${ema20Last.toFixed(2)}`);
    if (rsiLast !== null) parts.push(`RSI 14: ${rsiLast.toFixed(2)}`);
    if (macdLast !== null) parts.push(`MACD: ${macdLast.toFixed(4)}`);
    if (macdSignalLast !== null) parts.push(`MACD Signal: ${macdSignalLast.toFixed(4)}`);
    if (bbUpper !== null) parts.push(`Bollinger Upper: ${bbUpper.toFixed(2)}`);
    if (bbLower !== null) parts.push(`Bollinger Lower: ${bbLower.toFixed(2)}`);
    if (atrLast !== null) parts.push(`ATR 14: ${atrLast.toFixed(4)}`);
    parts.push("");
  }

  // Include support/resistance levels
  if (chartData.levels.support.length > 0 || chartData.levels.resistance.length > 0) {
    parts.push("=== KEY LEVELS ===");
    parts.push(`Support: ${chartData.levels.support.join(", ") || "None found"}`);
    parts.push(`Resistance: ${chartData.levels.resistance.join(", ") || "None found"}`);
    parts.push("");
  }

  // Include source information
  parts.push("=== DATA SOURCES ===");
  for (const source of chartData.sources) {
    parts.push(`- [${source.type}] ${source.title}: ${source.url}`);
  }
  parts.push("");

  // Include raw research context (truncated)
  if (research.rawContent) {
    parts.push("=== ADDITIONAL RESEARCH CONTEXT ===");
    parts.push(research.rawContent.substring(0, 3000));
    parts.push("");
  }

  // User's analysis request
  parts.push("=== ANALYSIS REQUEST ===");
  parts.push(userPrompt);

  return parts.join("\n");
}
