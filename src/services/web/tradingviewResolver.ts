import type { MarketCategory } from "@/types";

const TV: Record<string, { url: string; exchange: string }> = {
  "BTC/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT", exchange: "Binance" },
  "ETH/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:ETHUSDT", exchange: "Binance" },
  "EUR/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:EURUSD", exchange: "Forex" },
  "GBP/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:GBPUSD", exchange: "Forex" },
  "USD/JPY": { url: "https://www.tradingview.com/chart/?symbol=FX:USDJPY", exchange: "Forex" },
  "XAU/USD": { url: "https://www.tradingview.com/chart/?symbol=TVC:GOLD", exchange: "COMEX" },
  "AAPL": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:AAPL", exchange: "NASDAQ" },
  "TSLA": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:TSLA", exchange: "NASDAQ" },
  "NVDA": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:NVDA", exchange: "NASDAQ" },
};

export function resolveTradingViewUrl(symbol: string) { return TV[symbol] ?? null; }
export function getDefaultExchange(category: MarketCategory): string {
  return { crypto:"Binance", forex:"Forex", stocks:"NASDAQ", indices:"CME", commodities:"COMEX" }[category] ?? "Exchange";
}
