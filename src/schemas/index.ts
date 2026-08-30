import { z } from "zod";

// ─── Candle Schema ──────────────────────────────────────────
export const CandleSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

// ─── Source Schema ──────────────────────────────────────────
export const SourceInfoSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  retrievedAt: z.string(),
  type: z.enum(["tradingview", "exchange", "financial_portal", "news", "other"]),
});

// ─── Chart Data Schema ─────────────────────────────────────
export const IndicatorDataSchema = z.object({
  sma20: z.array(z.number().nullable()),
  sma50: z.array(z.number().nullable()),
  ema20: z.array(z.number().nullable()),
  ema50: z.array(z.number().nullable()),
  rsi14: z.array(z.number().nullable()),
  macd: z.object({
    macd: z.array(z.number().nullable()),
    signal: z.array(z.number().nullable()),
    histogram: z.array(z.number().nullable()),
  }),
  bollingerBands: z.object({
    upper: z.array(z.number().nullable()),
    middle: z.array(z.number().nullable()),
    lower: z.array(z.number().nullable()),
  }),
  atr14: z.array(z.number().nullable()),
});

export const ChartDataSchema = z.object({
  symbol: z.string(),
  market: z.enum(["crypto", "forex", "stocks", "indices", "commodities"]),
  exchange: z.string(),
  currency: z.string(),
  timeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]),
  retrievedAt: z.string(),
  currentPrice: z.number().nullable(),
  change24h: z.number().nullable(),
  changePercent24h: z.number().nullable(),
  volume24h: z.number().nullable(),
  candles: z.array(CandleSchema),
  indicators: IndicatorDataSchema,
  levels: z.object({
    support: z.array(z.number()),
    resistance: z.array(z.number()),
  }),
  sources: z.array(SourceInfoSchema),
});

// ─── Analysis Schemas ──────────────────────────────────────
export const AnalysisSignalSchema = z.object({
  type: z.enum(["bullish", "bearish", "neutral"]),
  name: z.string(),
  description: z.string(),
  strength: z.enum(["strong", "moderate", "weak"]),
});

export const AnalysisResultSchema = z.object({
  summary: z.string(),
  trend: z.enum(["bullish", "bearish", "neutral", "mixed"]),
  confidence: z.enum(["high", "medium", "low"]),
  support: z.array(z.number()),
  resistance: z.array(z.number()),
  signals: z.array(AnalysisSignalSchema),
  risks: z.array(z.string()),
  reasoning: z.array(z.string()),
  dataLimitations: z.array(z.string()),
  keyLevels: z
    .object({
      entry: z.number().nullable().optional(),
      invalidation: z.number().nullable().optional(),
      target1: z.number().nullable().optional(),
      target2: z.number().nullable().optional(),
    })
    .optional(),
  disclaimer: z.string().optional(),
});

// ─── Market Info Schema ────────────────────────────────────
export const MarketInfoSchema = z.object({
  symbol: z.string(),
  displayName: z.string(),
  category: z.enum(["crypto", "forex", "stocks", "indices", "commodities"]),
  exchange: z.string(),
  currentPrice: z.number().nullable(),
  previousClose: z.number().nullable(),
  change24h: z.number().nullable(),
  changePercent24h: z.number().nullable(),
  volume24h: z.number().nullable(),
  high24h: z.number().nullable(),
  low24h: z.number().nullable(),
  open24h: z.number().nullable(),
  marketCap: z.number().nullable(),
  lastUpdated: z.string(),
  sources: z.array(SourceInfoSchema),
});

// ─── LLM Config Schema ─────────────────────────────────────
export const LLMConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(100).max(128000),
});

// ─── App Settings Schema ───────────────────────────────────
export const AppSettingsSchema = z.object({
  llm: LLMConfigSchema,
  defaultTimeframe: z.enum(["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]),
  theme: z.enum(["dark", "light", "system"]),
  language: z.enum(["en", "fa"]),
  favorites: z.array(z.string()),
  recentMarkets: z.array(z.string()),
});

// ─── Normalized Research Schema (for LLM #1 output) ───────
export const NormalizedResearchSchema = z.object({
  symbol: z.string(),
  market: z.enum(["crypto", "forex", "stocks", "indices", "commodities"]),
  exchange: z.string().nullable(),
  currency: z.string().nullable(),
  currentPrice: z.number().nullable(),
  previousClose: z.number().nullable(),
  change24h: z.number().nullable(),
  changePercent24h: z.number().nullable(),
  volume24h: z.number().nullable(),
  high24h: z.number().nullable(),
  low24h: z.number().nullable(),
  open24h: z.number().nullable(),
  marketCap: z.number().nullable(),
  candles: z
    .array(
      z.object({
        timestamp: z.number(),
        open: z.number(),
        high: z.number(),
        low: z.number(),
        close: z.number(),
        volume: z.number(),
      })
    )
    .optional(),
  support: z.array(z.number()).optional(),
  resistance: z.array(z.number()).optional(),
  keyLevels: z
    .array(
      z.object({
        price: z.number(),
        type: z.enum(["support", "resistance"]),
        strength: z.string().optional(),
      })
    )
    .optional(),
  technicalIndicators: z
    .object({
      rsi: z.number().nullable().optional(),
      macd: z
        .object({
          value: z.number().nullable(),
          signal: z.number().nullable(),
          histogram: z.number().nullable(),
        })
        .optional(),
      sma20: z.number().nullable().optional(),
      sma50: z.number().nullable().optional(),
      ema20: z.number().nullable().optional(),
    })
    .optional(),
  timeframe: z.string().optional(),
  sources: z.array(SourceInfoSchema),
  dataQuality: z.enum(["complete", "partial", "minimal"]),
  retrievedAt: z.string(),
});

export type NormalizedResearch = z.infer<typeof NormalizedResearchSchema>;
