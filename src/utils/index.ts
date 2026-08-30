import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MarketCategory, MarketSymbol, Timeframe } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Market Utilities ───────────────────────────────────────
export const POPULAR_MARKETS: MarketSymbol[] = [
  // Crypto
  { symbol: "BTC/USDT", displayName: "Bitcoin", category: "crypto", exchange: "Binance", baseCurrency: "BTC", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:BTCUSDT" },
  { symbol: "ETH/USDT", displayName: "Ethereum", category: "crypto", exchange: "Binance", baseCurrency: "ETH", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:ETHUSDT" },
  { symbol: "BNB/USDT", displayName: "BNB", category: "crypto", exchange: "Binance", baseCurrency: "BNB", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:BNBUSDT" },
  { symbol: "SOL/USDT", displayName: "Solana", category: "crypto", exchange: "Binance", baseCurrency: "SOL", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:SOLUSDT" },
  { symbol: "XRP/USDT", displayName: "XRP", category: "crypto", exchange: "Binance", baseCurrency: "XRP", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:XRPUSDT" },
  { symbol: "ADA/USDT", displayName: "Cardano", category: "crypto", exchange: "Binance", baseCurrency: "ADA", quoteCurrency: "USDT", tradingViewSymbol: "BINANCE:ADAUSDT" },
  // Forex
  { symbol: "EUR/USD", displayName: "Euro / US Dollar", category: "forex", exchange: "Forex", baseCurrency: "EUR", quoteCurrency: "USD", tradingViewSymbol: "FX:EURUSD" },
  { symbol: "GBP/USD", displayName: "British Pound / US Dollar", category: "forex", exchange: "Forex", baseCurrency: "GBP", quoteCurrency: "USD", tradingViewSymbol: "FX:GBPUSD" },
  { symbol: "USD/JPY", displayName: "US Dollar / Japanese Yen", category: "forex", exchange: "Forex", baseCurrency: "USD", quoteCurrency: "JPY", tradingViewSymbol: "FX:USDJPY" },
  { symbol: "USD/CHF", displayName: "US Dollar / Swiss Franc", category: "forex", exchange: "Forex", baseCurrency: "USD", quoteCurrency: "CHF", tradingViewSymbol: "FX:USDCHF" },
  // Stocks
  { symbol: "AAPL", displayName: "Apple Inc.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:AAPL" },
  { symbol: "TSLA", displayName: "Tesla Inc.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:TSLA" },
  { symbol: "NVDA", displayName: "NVIDIA Corp.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:NVDA" },
  { symbol: "MSFT", displayName: "Microsoft Corp.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:MSFT" },
  { symbol: "GOOGL", displayName: "Alphabet Inc.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:GOOGL" },
  { symbol: "AMZN", displayName: "Amazon.com Inc.", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:AMZN" },
  { symbol: "META", displayName: "Meta Platforms", category: "stocks", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:META" },
  // Indices
  { symbol: "SPX", displayName: "S&P 500", category: "indices", exchange: "CME", tradingViewSymbol: "SP:SPX" },
  { symbol: "NDX", displayName: "NASDAQ 100", category: "indices", exchange: "NASDAQ", tradingViewSymbol: "NASDAQ:NDX" },
  { symbol: "DJI", displayName: "Dow Jones", category: "indices", exchange: "NYSE", tradingViewSymbol: "TVC:DJI" },
  // Commodities
  { symbol: "XAU/USD", displayName: "Gold / US Dollar", category: "commodities", exchange: "COMEX", baseCurrency: "XAU", quoteCurrency: "USD", tradingViewSymbol: "TVC:GOLD" },
  { symbol: "XAG/USD", displayName: "Silver / US Dollar", category: "commodities", exchange: "COMEX", baseCurrency: "XAG", quoteCurrency: "USD", tradingViewSymbol: "TVC:SILVER" },
  { symbol: "WTI", displayName: "Crude Oil (WTI)", category: "commodities", exchange: "NYMEX", tradingViewSymbol: "NYMEX:CL1!" },
];

export const CATEGORY_LABELS: Record<MarketCategory, { en: string; fa: string }> = {
  crypto: { en: "Crypto", fa: "ارز دیجیتال" },
  forex: { en: "Forex", fa: "فارکس" },
  stocks: { en: "Stocks", fa: "سهام" },
  indices: { en: "Indices", fa: "شاخص‌ها" },
  commodities: { en: "Commodities", fa: "کالاها" },
};

export const CATEGORY_ICONS: Record<MarketCategory, string> = {
  crypto: "₿",
  forex: "💱",
  stocks: "📈",
  indices: "📊",
  commodities: "🥇",
};

// ─── Symbol Normalization ───────────────────────────────────
export function normalizeSymbol(input: string): string {
  let s = input.trim().toUpperCase();
  // Remove exchange prefix if present (e.g., "BINANCE:BTCUSDT")
  if (s.includes(":")) {
    s = s.split(":")[1];
  }
  // Add slash if missing for forex-like pairs
  const forexPairs: Record<string, string> = {
    BTCUSDT: "BTC/USDT",
    ETHUSDT: "ETH/USDT",
    BNBUSDT: "BNB/USDT",
    SOLUSDT: "SOL/USDT",
    XRPUSDT: "XRP/USDT",
    ADAUSDT: "ADA/USDT",
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    USDJPY: "USD/JPY",
    USDCHF: "USD/CHF",
    AUDUSD: "AUD/USD",
    USDCAD: "USD/CAD",
    NZDUSD: "NZD/USD",
    EURGBP: "EUR/GBP",
    EURJPY: "EUR/JPY",
    GBPJPY: "GBP/JPY",
    XAUUSD: "XAU/USD",
    XAGUSD: "XAG/USD",
    BTCUSD: "BTC/USD",
    ETHUSD: "ETH/USD",
  };
  if (forexPairs[s]) return forexPairs[s];
  // If already has slash, return as-is
  if (s.includes("/")) return s;
  // Otherwise return as-is (stock symbols like AAPL)
  return s;
}

export function detectMarketCategory(symbol: string): MarketCategory {
  const s = symbol.toUpperCase();
  if (
    s.includes("BTC") || s.includes("ETH") || s.includes("BNB") || s.includes("SOL") ||
    s.includes("XRP") || s.includes("ADA") || s.includes("DOGE") || s.includes("DOT") ||
    s.includes("AVAX") || s.includes("MATIC") || s.includes("LINK") || s.includes("UNI") ||
    s.includes("ATOM") || s.includes("LTC") || s.includes("XLM") || s.includes("USDT") || s.includes("USDC")
  ) {
    return "crypto";
  }
  if (s.includes("XAU") || s.includes("XAG") || s.includes("GOLD") || s.includes("SILVER") || s.includes("WTI") || s.includes("OIL")) {
    return "commodities";
  }
  if (s === "SPX" || s === "NDX" || s === "DJI" || s.includes("SP500") || s.includes("S&P") || s.includes("NASDAQ") || s.includes("DOW")) {
    return "indices";
  }
  if (s.includes("EUR") || s.includes("GBP") || s.includes("JPY") || s.includes("CHF") || s.includes("AUD") || s.includes("CAD") || s.includes("NZD")) {
    return "forex";
  }
  return "stocks";
}

// ─── Formatting ─────────────────────────────────────────────
export function formatPrice(price: number | null, decimals?: number): string {
  if (price === null || price === undefined) return "—";
  if (price === 0) return "0";
  if (Math.abs(price) >= 1e9) return `${(price / 1e9).toFixed(2)}B`;
  if (Math.abs(price) >= 1e6) return `${(price / 1e6).toFixed(2)}M`;
  if (Math.abs(price) >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: decimals ?? 2 });
  if (Math.abs(price) >= 1) return price.toFixed(decimals ?? 2);
  return price.toFixed(decimals ?? 4);
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(volume: number | null): string {
  if (volume === null || volume === undefined) return "—";
  if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`;
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
}

export function formatDate(dateStr: string, lang: "en" | "fa" = "en"): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ─── Timeframe Utilities ────────────────────────────────────
export const TIMEFRAMES: { value: Timeframe; label: string; seconds: number }[] = [
  { value: "1m", label: "1M", seconds: 60 },
  { value: "5m", label: "5M", seconds: 300 },
  { value: "15m", label: "15M", seconds: 900 },
  { value: "1h", label: "1H", seconds: 3600 },
  { value: "4h", label: "4H", seconds: 14400 },
  { value: "1d", label: "1D", seconds: 86400 },
  { value: "1w", label: "1W", seconds: 604800 },
  { value: "1M", label: "1M", seconds: 2592000 },
];

export function timeframeToSeconds(tf: Timeframe): number {
  return TIMEFRAMES.find((t) => t.value === tf)?.seconds ?? 3600;
}

// ─── ID Generation ──────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Error Messages ─────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}
