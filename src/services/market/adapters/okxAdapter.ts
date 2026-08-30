import type { MarketDataAdapter, FetchCandlesOptions, FetchedCandles } from "../types";
import { MarketDataError } from "../types";
import type { CandleData, MarketCategory, Timeframe } from "@/types";

const OKX_BASE = "https://www.okx.com";
const OKX_BAR: Record<string, string> = { "1m":"1m","5m":"5m","15m":"15m","1h":"1H","4h":"4H","1d":"1D","1w":"1W","1M":"30D" };

function normalizeOkx(symbol: string): string {
  let s = symbol.trim().toUpperCase();
  if (s.includes(":")) s = s.split(":").pop()!;
  if (s.includes("/")) return s.replace("/", "-");
  for (const q of ["USDT","USDC","USD","BTC","ETH"]) { if (s.endsWith(q) && s.length > q.length) return `${s.slice(0,-q.length)}-${q}`; }
  return s;
}
function isValidOkx(s: string) { return /^[A-Z0-9]{2,10}-[A-Z0-9]{2,10}$/.test(s); }

function parseRow(row: unknown[]): CandleData | null {
  if (!Array.isArray(row) || row.length < 6) return null;
  const [t,o,h,l,c,v] = [Number(row[0]),parseFloat(String(row[1])),parseFloat(String(row[2])),parseFloat(String(row[3])),parseFloat(String(row[4])),parseFloat(String(row[5]))];
  if (![t,o,h,l,c,v].every(Number.isFinite)) return null;
  return { timestamp:t, open:o, high:h, low:l, close:c, volume:v };
}

export const okxAdapter: MarketDataAdapter = {
  id: "okx", name: "OKX",
  supports: (s, cat) => cat === "crypto" && isValidOkx(normalizeOkx(s)),
  normalizeSymbol: (s) => normalizeOkx(s),
  async fetchCandles(sym, tf, opts) {
    if (!isValidOkx(sym)) throw new MarketDataError({ code:"INVALID_SYMBOL", message:`"${sym}" is not a valid OKX instrument`, exchange:"OKX", symbol:sym, timeframe:tf });
    const bar = OKX_BAR[tf]; if (!bar) throw new MarketDataError({ code:"INVALID_SYMBOL", message:`Unsupported timeframe: ${tf}`, exchange:"OKX", symbol:sym, timeframe:tf });
    const params = new URLSearchParams({ instId:sym, bar, limit:String(Math.min(Math.max(opts.limit,1),300)) });
    if (opts.startTime) params.set("after", String(opts.startTime));
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(`${OKX_BASE}/api/v5/market/candles?${params}`, { signal:ctrl.signal, headers:{Accept:"application/json"} });
      if (res.status === 429) throw new MarketDataError({ code:"RATE_LIMIT", message:"OKX rate limit", exchange:"OKX", symbol:sym, timeframe:tf, httpStatus:429 });
      if (!res.ok) { const b = await res.text().catch(()=>""); throw new MarketDataError({ code:"HTTP_ERROR", message:`OKX returned ${res.status}`, exchange:"OKX", symbol:sym, timeframe:tf, httpStatus:res.status, details:b.slice(0,300) }); }
      const json = (await res.json()) as { data?: unknown[] };
      const rows = Array.isArray(json?.data) ? json.data : [];
      const parsed = rows.map(parseRow).filter((c): c is CandleData => c!==null);
      const byTime = new Map<number, CandleData>();
      for (const c of parsed) { if (c.open>0 && c.low>0 && c.high>=c.low && c.volume>=0 && c.timestamp>0) byTime.set(c.timestamp, c); }
      return { candles:[...byTime.values()].sort((a,b)=>a.timestamp-b.timestamp), httpStatus:res.status, requestSymbol:sym };
    } catch(e) {
      if (e instanceof MarketDataError) throw e;
      const msg = e instanceof Error?e.message:String(e);
      throw new MarketDataError({ code:msg.includes("abort")?"TIMEOUT":"NETWORK", message:msg.includes("abort")?"OKX timeout":`OKX: ${msg}`, exchange:"OKX", symbol:sym, timeframe:tf });
    } finally { clearTimeout(timer); }
  },
};
