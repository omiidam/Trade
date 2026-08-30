import type { MarketDataResult, MarketDataError, CandleQuote } from "./types";
import { MarketDataError as MDE } from "./types";
import { listAdapters } from "./adapters";
import { timeframeMs } from "./adapters/binanceAdapter";
import { getCached, saveCached, mergeCandles, findMissing, MAX_CACHED } from "./ohlcvCache";
import { calculateAllIndicators } from "./indicators";
import { detectMarketCategory } from "@/utils";
import type { MarketDataAdapter } from "./types";
import type { CandleData, MarketCategory, Timeframe } from "@/types";

export type GetMarketDataOptions = { category?: MarketCategory; minCandles?: number; forceRefresh?: boolean; allowStaleCache?: boolean };

export const marketDataService = {
  async getMarketData(symbol: string, timeframe: Timeframe, opts: GetMarketDataOptions = {}): Promise<MarketDataResult> {
    const { category = detectMarketCategory(symbol), minCandles = 200, forceRefresh = false, allowStaleCache = true } = opts;
    const startedAt = Date.now();
    const cachedEntry = forceRefresh ? null : getCached(symbol, timeframe);
    const cachedCount = cachedEntry?.candles.length ?? 0;
    const candidates = listAdapters().filter(a => { try { return a.supports(symbol, category); } catch { return false; } });

    if (!candidates.length) throw new MDE({ code:"NO_ADAPTER", message:`No adapter supports ${symbol} (${category})`, exchange:"—", symbol, timeframe });

    let lastError: MDE | null = null;
    for (const adapter of candidates) {
      try {
        return await fetchViaAdapter({ adapter, symbol, timeframe, cachedEntry, forceRefresh, minCandles, startedAt, cachedCount });
      } catch(e) {
        lastError = e instanceof MDE ? e : new MDE({ code:"NETWORK", message:e instanceof Error?e.message:String(e), exchange:adapter.name, symbol:adapter.normalizeSymbol(symbol), timeframe });
        continue;
      }
    }
    if (allowStaleCache && cachedEntry?.candles.length) {
      return buildResult({ symbol, normalizedSymbol:cachedEntry.normalizedSymbol, timeframe, adapter:candidates[0], candles:cachedEntry.candles, source:"cache", fetchedAt:cachedEntry.updatedAt, meta:{requestedCandles:minCandles, receivedCandles:cachedEntry.candles.length, httpStatus:lastError?.httpStatus??null, latencyMs:Date.now()-startedAt, cachedCandleCount:cachedCount} });
    }
    throw lastError ?? new MDE({ code:"NETWORK", message:"All sources failed", exchange:candidates[0].name, symbol, timeframe });
  },
};

async function fetchViaAdapter(p: { adapter:MarketDataAdapter; symbol:string; timeframe:Timeframe; cachedEntry:any; forceRefresh:boolean; minCandles:number; startedAt:number; cachedCount:number }): Promise<MarketDataResult> {
  const { adapter, symbol, timeframe, cachedEntry, forceRefresh, minCandles, startedAt, cachedCount } = p;
  const norm = adapter.normalizeSymbol(symbol);
  let httpStatus: number | null = null;
  let merged = cachedEntry?.candles ?? [];
  let source: MarketDataResult["source"] = merged.length ? "cache" : "live";
  const needFull = !cachedEntry || cachedEntry.candles.length < minCandles || forceRefresh;
  const missing = cachedEntry && !forceRefresh ? findMissing(cachedEntry.candles, timeframe) : null;

  if (needFull || missing) {
    let fresh: CandleData[] = [];
    if (needFull) {
      const limit = Math.min(MAX_CACHED, Math.max(minCandles+50, 300));
      const res = await adapter.fetchCandles(norm, timeframe, { limit });
      httpStatus = res.httpStatus; fresh = res.candles;
      if (fresh.length && fresh.length < minCandles) {
        try {
          const older = await adapter.fetchCandles(norm, timeframe, { limit:Math.min(1000, minCandles-fresh.length+10), endTime:fresh[0].timestamp-1 });
          fresh = mergeCandles([], [...older.candles,...fresh], 2000);
        } catch { /* best effort */ }
      }
    } else if (missing) {
      const res = await adapter.fetchCandles(norm, timeframe, { limit:Math.min(1000, minCandles), startTime:missing.startTime });
      httpStatus = res.httpStatus; fresh = res.candles;
    }
    if (fresh.length) { merged = mergeCandles(cachedEntry?.candles??[], fresh); source = cachedEntry?.candles?.length ? "cache+live" : "live"; }
  } else if (cachedEntry) {
    try { const res = await adapter.fetchCandles(norm, timeframe, { limit:1 }); httpStatus=res.httpStatus; if (res.candles.length) { merged = mergeCandles(cachedEntry.candles, res.candles); source = "cache+live"; } } catch { /* keep cached */ }
  }
  if (!merged.length) throw new MDE({ code:"EMPTY_RESPONSE", message:`No candles for ${norm} ${timeframe}`, exchange:adapter.name, symbol:norm, timeframe, httpStatus });
  saveCached(symbol, norm, timeframe, adapter.name, merged);
  return buildResult({ symbol, normalizedSymbol:norm, timeframe, adapter, candles:merged, source, fetchedAt:new Date().toISOString(), meta:{requestedCandles:minCandles, receivedCandles:merged.length, httpStatus, latencyMs:Date.now()-startedAt, cachedCandleCount:cachedCount} });
}

function buildResult(p: { symbol:string; normalizedSymbol:string; timeframe:Timeframe; adapter:{id:string;name:string}; candles:CandleData[]; source:MarketDataResult["source"]; fetchedAt:string; meta:MarketDataResult["meta"] }): MarketDataResult {
  return { ...p, exchange:p.adapter.name, adapterId:p.adapter.id, indicators:calculateAllIndicators(p.candles), quote:deriveQuote(p.candles, p.timeframe), fromCache:p.source==="cache" };
}

function deriveQuote(candles: CandleData[], tf: Timeframe): CandleQuote {
  if (!candles.length) return { currentPrice:null, change24h:null, changePercent24h:null, volume24h:null, high24h:null, low24h:null, open24h:null };
  const last = candles[candles.length-1];
  const cutoff = last.timestamp - 24*60*60*1000;
  let win = candles.filter(c => c.timestamp >= cutoff);
  if (!win.length) win = [last];
  const base = win[0];
  const cur = last.close;
  return { currentPrice:cur, change24h:cur-base.open, changePercent24h:base.open>0?((cur-base.open)/base.open)*100:null, volume24h:win.reduce((s,c)=>s+c.volume,0), high24h:Math.max(...win.map(c=>c.high)), low24h:Math.min(...win.map(c=>c.low)), open24h:base.open };
}
