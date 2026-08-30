import type { MarketDataAdapter, FetchCandlesOptions, FetchedCandles } from "../types";
import { MarketDataError } from "../types";
import type { CandleData, MarketCategory, Timeframe } from "@/types";

const BINANCE_REST_BASES = [
  "https://data-api.binance.vision",
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
];

const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";
const TIMEFRAME_MAP: Record<string, string> = { "1m":"1m","5m":"5m","15m":"15m","1h":"1h","4h":"4h","1d":"1d","1w":"1w","1M":"1M" };

export function binanceInterval(tf: Timeframe): string { return TIMEFRAME_MAP[tf] ?? "1h"; }
export function timeframeMs(tf: Timeframe): number {
  const s: Record<string, number> = { "1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400,"1w":604800,"1M":2592000 };
  return (s[tf] ?? 3600) * 1000;
}

function normalizeToBinance(symbol: string): string {
  let s = symbol.trim().toUpperCase();
  if (s.includes(":")) s = s.split(":").pop()!;
  return s.replace(/\//g, "").replace(/[^A-Z0-9]/g, "");
}
function isValid(s: string) { return /^[A-Z0-9]{4,20}$/.test(s); }

function parseKlineRow(row: unknown[]): CandleData | null {
  if (!Array.isArray(row) || row.length < 6) return null;
  const [t,o,h,l,c,v] = [Number(row[0]),parseFloat(String(row[1])),parseFloat(String(row[2])),parseFloat(String(row[3])),parseFloat(String(row[4])),parseFloat(String(row[5]))];
  if (![t,o,h,l,c,v].every(Number.isFinite)) return null;
  return { timestamp:t, open:o, high:h, low:l, close:c, volume:v };
}

function validateAndDedup(raw: CandleData[]): CandleData[] {
  const byTime = new Map<number, CandleData>();
  for (const c of raw) {
    if (c.open>0 && c.low>0 && c.high>=c.low && c.high>=c.open && c.high>=c.close && c.low<=c.open && c.low<=c.close && c.volume>=0 && c.timestamp>0) byTime.set(c.timestamp, c);
  }
  return [...byTime.values()].sort((a,b) => a.timestamp - b.timestamp);
}

export const binanceAdapter: MarketDataAdapter = {
  id: "binance", name: "Binance",
  supports: (symbol, category) => category === "crypto" && isValid(normalizeToBinance(symbol)),
  normalizeSymbol: (s) => normalizeToBinance(s),
  async fetchCandles(normalizedSymbol, timeframe, options) {
    if (!isValid(normalizedSymbol)) throw new MarketDataError({ code:"INVALID_SYMBOL", message:`"${normalizedSymbol}" is not a valid Binance symbol`, exchange:"Binance", symbol:normalizedSymbol, timeframe });
    const interval = binanceInterval(timeframe);
    const params = new URLSearchParams({ symbol:normalizedSymbol, interval, limit:String(Math.min(Math.max(options.limit,1),1000)) });
    if (options.startTime) params.set("startTime", String(options.startTime));
    if (options.endTime) params.set("endTime", String(options.endTime));
    const path = `/api/v3/klines?${params.toString()}`;
    let lastStatus = 0, lastBody = "";
    for (const base of BINANCE_REST_BASES) {
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(`${base}${path}`, { signal:ctrl.signal, headers:{Accept:"application/json"} });
        lastStatus = res.status;
        if (res.status === 429) throw new MarketDataError({ code:"RATE_LIMIT", message:"Binance rate limit reached", exchange:"Binance", symbol:normalizedSymbol, timeframe, httpStatus:429 });
        if (!res.ok) { lastBody = await res.text().catch(()=>""); continue; }
        const data = (await res.json()) as unknown[];
        if (!Array.isArray(data)) continue;
        return { candles: validateAndDedup(data.map(parseKlineRow).filter((c): c is CandleData => c!==null)), httpStatus:res.status, requestSymbol:normalizedSymbol };
      } catch(e) { if (e instanceof MarketDataError) throw e; lastBody = e instanceof Error?e.message:String(e); continue; }
      finally { clearTimeout(timer); }
    }
    throw new MarketDataError({ code:lastStatus?"HTTP_ERROR":"NETWORK", message:lastStatus?`Binance returned HTTP ${lastStatus}`:"Could not reach Binance", exchange:"Binance", symbol:normalizedSymbol, timeframe, httpStatus:lastStatus||null, details:lastBody.slice(0,300)||undefined });
  },
  getKlineStream(normalizedSymbol, timeframe) {
    if (!isValid(normalizedSymbol)) return null;
    const iv = TIMEFRAME_MAP[timeframe]; if (!iv) return null;
    return { url:`${BINANCE_WS_BASE}/${normalizedSymbol.toLowerCase()}@kline_${iv}` };
  },
};
