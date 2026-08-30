// ─── Market Types ───────────────────────────────────────────
export type MarketCategory = "crypto" | "forex" | "stocks" | "indices" | "commodities";

export type MarketSymbol = {
  symbol: string;
  displayName: string;
  category: MarketCategory;
  exchange?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
};

export type CandleData = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w" | "1M";

export type IndicatorData = {
  sma20: (number | null)[];
  sma50: (number | null)[];
  ema20: (number | null)[];
  ema50: (number | null)[];
  rsi14: (number | null)[];
  macd: {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  };
  bollingerBands: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
  atr14: (number | null)[];
};

export type ChartData = {
  symbol: string;
  market: MarketCategory;
  exchange: string;
  currency: string;
  timeframe: Timeframe;
  retrievedAt: string;
  currentPrice: number | null;
  change24h: number | null;
  changePercent24h: number | null;
  volume24h: number | null;
  candles: CandleData[];
  indicators: IndicatorData;
  levels: { support: number[]; resistance: number[] };
  sources: SourceInfo[];
};

export type SourceInfo = {
  url: string;
  title: string;
  retrievedAt: string;
  type: "tradingview" | "exchange" | "financial_portal" | "news" | "other";
};

export type ResearchPackage = {
  symbol: string;
  category: MarketCategory;
  rawContent: string;
  sources: SourceInfo[];
  priceData: Partial<{
    currentPrice: number | null;
    change24h: number | null;
    changePercent24h: number | null;
    volume24h: number | null;
  }>;
  rawHtml: string;
  retrievedAt: string;
};

export type AnalysisResult = {
  summary: string;
  trend: "bullish" | "bearish" | "neutral" | "mixed";
  confidence: "high" | "medium" | "low";
  support: number[];
  resistance: number[];
  signals: { type: "bullish" | "bearish" | "neutral"; name: string; description: string; strength: "strong" | "moderate" | "weak" }[];
  risks: string[];
  reasoning: string[];
  dataLimitations: string[];
};

export type AnalysisHistoryEntry = {
  id: string;
  symbol: string;
  prompt: string;
  result: AnalysisResult;
  chartData: ChartData;
  timestamp: string;
};

export type LLMConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
};

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMResponse = {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
};

export type AppSettings = {
  llm: LLMConfig;
  defaultTimeframe: Timeframe;
  theme: "dark" | "light" | "system";
  language: "en" | "fa";
  favorites: string[];
  recentMarkets: string[];
};

export type StoredMarketData = {
  symbol: string;
  chartData: ChartData;
  research: ResearchPackage;
  timestamp: string;
};
