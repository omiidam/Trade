import type { CandleData, IndicatorData, MarketCategory, Timeframe } from "@/types";

export type MarketErrorCode = "NO_ADAPTER" | "NETWORK" | "HTTP_ERROR" | "TIMEOUT" | "INVALID_SYMBOL" | "EMPTY_RESPONSE" | "RATE_LIMIT";

export class MarketDataError extends Error {
  code: MarketErrorCode;
  httpStatus: number | null;
  exchange: string;
  symbol: string;
  timeframe: Timeframe;
  details?: string;
  constructor(p: { code: MarketErrorCode; message: string; exchange: string; symbol: string; timeframe: Timeframe; httpStatus?: number | null; details?: string }) {
    super(p.message);
    this.name = "MarketDataError";
    this.code = p.code;
    this.httpStatus = p.httpStatus ?? null;
    this.exchange = p.exchange;
    this.symbol = p.symbol;
    this.timeframe = p.timeframe;
    this.details = p.details;
  }
}

export type FetchCandlesOptions = { limit: number; startTime?: number; endTime?: number };
export type FetchedCandles = { candles: CandleData[]; httpStatus: number; requestSymbol: string };

export interface MarketDataAdapter {
  id: string;
  name: string;
  supports(symbol: string, category: MarketCategory): boolean;
  normalizeSymbol(symbol: string): string;
  fetchCandles(normalizedSymbol: string, timeframe: Timeframe, options: FetchCandlesOptions): Promise<FetchedCandles>;
  getKlineStream?(normalizedSymbol: string, timeframe: Timeframe): { url: string } | null;
}

export type CandleQuote = {
  currentPrice: number | null; change24h: number | null; changePercent24h: number | null;
  volume24h: number | null; high24h: number | null; low24h: number | null; open24h: number | null;
};

export type MarketDataResult = {
  symbol: string; normalizedSymbol: string; timeframe: Timeframe; exchange: string; adapterId: string;
  candles: CandleData[]; indicators: IndicatorData; quote: CandleQuote;
  source: "live" | "cache" | "cache+live"; fromCache: boolean; fetchedAt: string;
  meta: { requestedCandles: number; receivedCandles: number; httpStatus: number | null; latencyMs: number | null; cachedCandleCount: number };
};

export type OhlcvCacheEntry = {
  symbol: string; normalizedSymbol: string; timeframe: Timeframe; exchange: string;
  candles: CandleData[]; updatedAt: string;
};
