import type { CandleData, Timeframe } from "@/types";
import { binanceAdapter } from "./adapters/binanceAdapter";

type Cbs = { onKline: (c: CandleData) => void; onStatus?: (s: "connecting"|"open"|"closed"|"error") => void };
export type FeedHandle = { close: () => void };
const BASE_MS = 2000, MAX_MS = 30000, THROTTLE = 1000;

export function openLiveFeed(symbol: string, tf: Timeframe, cbs: Cbs): FeedHandle {
  const stream = binanceAdapter.getKlineStream(binanceAdapter.normalizeSymbol(symbol), tf);
  if (!stream || typeof WebSocket === "undefined") return { close(){} };
  let ws: WebSocket|null=null, closed=false, attempt=0, timer: ReturnType<typeof setTimeout>|null=null, lastAt=0, lastCandle: CandleData|null=null;

  const connect = () => {
    if (closed) return;
    cbs.onStatus?.("connecting");
    try { ws = new WebSocket(stream.url); } catch { schedule(); return; }
    ws.onopen = () => { attempt=0; cbs.onStatus?.("open"); };
    ws.onmessage = (ev) => {
      try {
        const k = JSON.parse(ev.data as string)?.k;
        if (!k) return;
        const c: CandleData = { timestamp:Number(k.t), open:parseFloat(k.o), high:parseFloat(k.h), low:parseFloat(k.l), close:parseFloat(k.c), volume:parseFloat(k.v) };
        if (![c.timestamp,c.open,c.close].every(Number.isFinite)) return;
        lastCandle = c;
        const now = Date.now();
        if (now - lastAt >= THROTTLE) { lastAt = now; cbs.onKline(c); }
      } catch {}
    };
    ws.onerror = () => cbs.onStatus?.("error");
    ws.onclose = () => { cbs.onStatus?.("closed"); schedule(); };
  };
  const schedule = () => { if (closed) return; if (timer) clearTimeout(timer); timer = setTimeout(connect, Math.min(BASE_MS*2**attempt++, MAX_MS)); };
  connect();
  return { close() { closed=true; if (timer) clearTimeout(timer); if (lastCandle) cbs.onKline(lastCandle); try { ws?.close(); } catch {} ws=null; } };
}
