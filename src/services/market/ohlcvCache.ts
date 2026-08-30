import type { OhlcvCacheEntry } from "./types";
import type { CandleData, Timeframe } from "@/types";
import { timeframeMs } from "./adapters/binanceAdapter";

export const MAX_CACHED = 500;
function cacheKey(sym: string, tf: Timeframe) { return `tf_ohlcv_${sym.toUpperCase().replace(/[^A-Z0-9/]/g,"_")}_${tf}`; }

export function getCached(sym: string, tf: Timeframe): OhlcvCacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(sym, tf));
    if (!raw) return null;
    const e = JSON.parse(raw) as OhlcvCacheEntry;
    if (!e?.candles?.length) return null;
    return e;
  } catch { return null; }
}

export function saveCached(sym: string, norm: string, tf: Timeframe, exchange: string, candles: CandleData[]) {
  try {
    const entry: OhlcvCacheEntry = { symbol:sym, normalizedSymbol:norm, timeframe:tf, exchange, candles:candles.slice(-MAX_CACHED), updatedAt:new Date().toISOString() };
    localStorage.setItem(cacheKey(sym, tf), JSON.stringify(entry));
  } catch { /* quota */ }
}

export function mergeCandles(cached: CandleData[], fresh: CandleData[], max = MAX_CACHED): CandleData[] {
  const byTime = new Map<number, CandleData>();
  for (const c of cached) byTime.set(c.timestamp, c);
  for (const c of fresh) byTime.set(c.timestamp, c);
  return [...byTime.values()].sort((a,b)=>a.timestamp-b.timestamp).slice(-max);
}

export function findMissing(candles: CandleData[], tf: Timeframe): { startTime: number } | null {
  if (!candles.length) return null;
  const lastOpen = candles[candles.length-1].timestamp;
  const nextOpen = lastOpen + timeframeMs(tf);
  if (Date.now() >= nextOpen) return { startTime: nextOpen };
  return null;
}
