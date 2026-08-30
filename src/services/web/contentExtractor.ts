import type { FetchedPage } from "./webPageFetcher";
import type { SourceInfo } from "@/types";

export type ExtractedContent = {
  text: string;
  prices: PriceData[];
  sources: SourceInfo[];
};

export type PriceData = {
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  marketCap?: number;
};

// ─── Extract market-relevant content from fetched pages ─────
export function extractMarketContent(pages: FetchedPage[]): ExtractedContent {
  const allText: string[] = [];
  const allPrices: PriceData[] = [];
  const sources: SourceInfo[] = [];

  for (const page of pages) {
    if (page.status !== 200 || !page.text) continue;

    // Extract prices from text
    const prices = extractPrices(page.text);
    if (prices) allPrices.push(prices);

    // Extract relevant text sections
    const relevantText = extractRelevantText(page.text);
    if (relevantText) allText.push(relevantText);

    // Build source info
    const sourceType = detectSourceType(page.url);
    sources.push({
      url: page.url,
      title: page.title,
      retrievedAt: page.fetchedAt,
      type: sourceType,
    });
  }

  return {
    text: allText.join("\n\n"),
    prices: allPrices,
    sources,
  };
}

// ─── Extract numeric price data from text ──────────────────
function extractPrices(text: string): PriceData | null {
  const prices: PriceData = {};

  // Match common price patterns like "$1,234.56" or "1234.56" or "1,234.56"
  const pricePatterns = [
    // Price with dollar sign
    /(?:price|last|current|close)[:\s]*\$?([\d,]+\.?\d*)/i,
    // Price near "USD" or "USDT"
    /([\d,]+\.?\d*)\s*(?:USD|USDT)/i,
    // Standalone price patterns (look for numbers with commas and decimals)
    /(?:^|\s)([\d,]{3,}\.?\d{0,8})(?:\s|$)/gm,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/,/g, "");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0 && price < 1e15) {
        prices.price = price;
        break;
      }
    }
  }

  // Extract change percentage
  const changeMatch = text.match(
    /(?:change|chg|pct|percent)[:\s]*([+-]?[\d,]+\.?\d*)\s*%/i
  );
  if (changeMatch) {
    prices.changePercent = parseFloat(changeMatch[1].replace(/,/g, ""));
  }

  // Extract volume
  const volumeMatch = text.match(
    /(?:volume|vol)[:\s]*([\d,]+\.?\d*)\s*(billion|million|thousand|B|M|K)?/i
  );
  if (volumeMatch) {
    let vol = parseFloat(volumeMatch[1].replace(/,/g, ""));
    const unit = (volumeMatch[2] || "").toLowerCase();
    if (unit === "billion" || unit === "b") vol *= 1e9;
    else if (unit === "million" || unit === "m") vol *= 1e6;
    else if (unit === "thousand" || unit === "k") vol *= 1e3;
    prices.volume = vol;
  }

  // Extract high
  const highMatch = text.match(/(?:high|24h high)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (highMatch) {
    prices.high = parseFloat(highMatch[1].replace(/,/g, ""));
  }

  // Extract low
  const lowMatch = text.match(/(?:low|24h low)[:\s]*\$?([\d,]+\.?\d*)/i);
  if (lowMatch) {
    prices.low = parseFloat(lowMatch[1].replace(/,/g, ""));
  }

  return prices.price !== undefined ? prices : null;
}

// ─── Extract relevant text sections ────────────────────────
function extractRelevantText(text: string): string {
  const keywords = [
    "price",
    "trend",
    "support",
    "resistance",
    "analysis",
    "technical",
    "indicator",
    "bullish",
    "bearish",
    "momentum",
    "volume",
    "breakout",
    "reversal",
    "moving average",
    "rsi",
    "macd",
    "bollinger",
    "fibonacci",
    "candlestick",
    "pattern",
    "forecast",
    "outlook",
    "signal",
    "buy",
    "sell",
    "entry",
    "target",
    "stop loss",
    "market cap",
    "24h",
    "week",
    "month",
    "year",
  ];

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const relevant: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const hasKeyword = keywords.some((kw) => lower.includes(kw));
    // Also include if sentence has numbers (likely data)
    const hasNumbers = /\d{2,}/.test(sentence);
    if (hasKeyword || hasNumbers) {
      relevant.push(sentence.trim());
    }
    if (relevant.length >= 50) break;
  }

  return relevant.join(". ");
}

// ─── Detect source type from URL ───────────────────────────
function detectSourceType(
  url: string
): "tradingview" | "exchange" | "financial_portal" | "news" | "other" {
  const lower = url.toLowerCase();
  if (lower.includes("tradingview.com")) return "tradingview";
  if (
    lower.includes("binance.com") ||
    lower.includes("coinbase.com") ||
    lower.includes("kraken.com") ||
    lower.includes("kucoin.com") ||
    lower.includes("bybit.com")
  )
    return "exchange";
  if (
    lower.includes("investing.com") ||
    lower.includes("coingecko.com") ||
    lower.includes("coinmarketcap.com") ||
    lower.includes("messari.io") ||
    lower.includes("tradingview.com") ||
    lower.includes("marketwatch.com") ||
    lower.includes("finance.yahoo.com") ||
    lower.includes("bloomberg.com")
  )
    return "financial_portal";
  if (
    lower.includes("reuters.com") ||
    lower.includes("cnbc.com") ||
    lower.includes("coindesk.com") ||
    lower.includes("cointelegraph.com")
  )
    return "news";
  return "other";
}

// ─── Merge extracted prices ────────────────────────────────
export function mergePriceData(pricesArray: PriceData[]): PriceData {
  const merged: PriceData = {};
  for (const p of pricesArray) {
    if (p.price !== undefined && merged.price === undefined) merged.price = p.price;
    if (p.change !== undefined && merged.change === undefined) merged.change = p.change;
    if (p.changePercent !== undefined && merged.changePercent === undefined)
      merged.changePercent = p.changePercent;
    if (p.volume !== undefined && merged.volume === undefined) merged.volume = p.volume;
    if (p.high !== undefined && merged.high === undefined) merged.high = p.high;
    if (p.low !== undefined && merged.low === undefined) merged.low = p.low;
    if (p.open !== undefined && merged.open === undefined) merged.open = p.open;
    if (p.previousClose !== undefined && merged.previousClose === undefined)
      merged.previousClose = p.previousClose;
    if (p.marketCap !== undefined && merged.marketCap === undefined)
      merged.marketCap = p.marketCap;
  }
  return merged;
}
