import type { MarketDataAdapter, MarketDataError } from "../types";
import type { MarketCategory } from "@/types";
import { binanceAdapter } from "./binanceAdapter";
import { okxAdapter } from "./okxAdapter";

const ADAPTERS: MarketDataAdapter[] = [binanceAdapter, okxAdapter];
export function listAdapters() { return ADAPTERS; }
export function resolveAdapter(symbol: string, category: MarketCategory): MarketDataAdapter | null {
  for (const a of ADAPTERS) { try { if (a.supports(symbol, category)) return a; } catch { continue; } }
  return null;
}
