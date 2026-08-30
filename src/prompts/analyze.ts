import type { ChartData, ResearchPackage } from "@/types";

export function buildAnalyzeSystemPrompt(): string {
  return `You are a professional market analyst. Analyze the supplied market data and respond with JSON.
Rules:
- Analyze ONLY the supplied data. Never invent market data.
- Clearly distinguish facts from interpretation.
- Do not guarantee future price movements.
- Mention limitations in the supplied data.
- Follow the user's requested analysis objective.

Output schema:
{
  "summary": "string",
  "trend": "bullish"|"bearish"|"neutral"|"mixed",
  "confidence": "high"|"medium"|"low",
  "support": number[],
  "resistance": number[],
  "signals": [{ "type": "bullish"|"bearish"|"neutral", "name": "string", "description": "string", "strength": "strong"|"moderate"|"weak" }],
  "risks": string[],
  "reasoning": string[],
  "dataLimitations": string[]
}`;
}

export function buildAnalyzeUserMessage(chart: ChartData, research: ResearchPackage, prompt: string): string {
  const last = chart.candles[chart.candles.length - 1];
  const indicators = chart.indicators;
  const n = chart.candles.length;
  return `Symbol: ${chart.symbol} (${chart.exchange})
Current price: ${chart.currentPrice}
24h change: ${chart.changePercent24h}%
24h volume: ${chart.volume24h}
Candles: ${chart.candles.length} (${chart.timeframe})
Last candle: O=${last?.open} H=${last?.high} L=${last?.low} C=${last?.close}

Indicators (latest):
RSI(14): ${indicators.rsi14[n-1]?.toFixed(1) ?? "N/A"}
SMA(20): ${indicators.sma20[n-1]?.toFixed(2) ?? "N/A"}
SMA(50): ${indicators.sma50[n-1]?.toFixed(2) ?? "N/A"}
EMA(20): ${indicators.ema20[n-1]?.toFixed(2) ?? "N/A"}
MACD: ${indicators.macd.macd[n-1]?.toFixed(2) ?? "N/A"} (Signal: ${indicators.macd.signal[n-1]?.toFixed(2) ?? "N/A"})
BB Upper: ${indicators.bollingerBands.upper[n-1]?.toFixed(2) ?? "N/A"}
BB Lower: ${indicators.bollingerBands.lower[n-1]?.toFixed(2) ?? "N/A"}
ATR(14): ${indicators.atr14[n-1]?.toFixed(4) ?? "N/A"}

Web research context: ${research.rawContent.slice(0, 1000)}

User request: ${prompt}`;
}
