import type { MarketCategory } from "@/types";

type TradingViewMapping = {
  url: string;
  exchange: string;
  fullName: string;
};

// ─── TradingView Symbol Mappings ────────────────────────────
const TRADINGVIEW_MAPPINGS: Record<string, TradingViewMapping> = {
  // Crypto
  "BTC/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT", exchange: "Binance", fullName: "Bitcoin / Tether" },
  "ETH/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:ETHUSDT", exchange: "Binance", fullName: "Ethereum / Tether" },
  "BNB/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:BNBUSDT", exchange: "Binance", fullName: "BNB / Tether" },
  "SOL/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:SOLUSDT", exchange: "Binance", fullName: "Solana / Tether" },
  "XRP/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:XRPUSDT", exchange: "Binance", fullName: "XRP / Tether" },
  "ADA/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:ADAUSDT", exchange: "Binance", fullName: "Cardano / Tether" },
  "DOGE/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:DOGEUSDT", exchange: "Binance", fullName: "Dogecoin / Tether" },
  "AVAX/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:AVAXUSDT", exchange: "Binance", fullName: "Avalanche / Tether" },
  "DOT/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:DOTUSDT", exchange: "Binance", fullName: "Polkadot / Tether" },
  "LINK/USDT": { url: "https://www.tradingview.com/chart/?symbol=BINANCE:LINKUSDT", exchange: "Binance", fullName: "Chainlink / Tether" },
  "BTC/USD": { url: "https://www.tradingview.com/chart/?symbol=COINBASE:BTCUSD", exchange: "Coinbase", fullName: "Bitcoin / US Dollar" },
  "ETH/USD": { url: "https://www.tradingview.com/chart/?symbol=COINBASE:ETHUSD", exchange: "Coinbase", fullName: "Ethereum / US Dollar" },

  // Forex
  "EUR/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:EURUSD", exchange: "Forex", fullName: "Euro / US Dollar" },
  "GBP/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:GBPUSD", exchange: "Forex", fullName: "British Pound / US Dollar" },
  "USD/JPY": { url: "https://www.tradingview.com/chart/?symbol=FX:USDJPY", exchange: "Forex", fullName: "US Dollar / Japanese Yen" },
  "USD/CHF": { url: "https://www.tradingview.com/chart/?symbol=FX:USDCHF", exchange: "Forex", fullName: "US Dollar / Swiss Franc" },
  "AUD/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:AUDUSD", exchange: "Forex", fullName: "Australian Dollar / US Dollar" },
  "USD/CAD": { url: "https://www.tradingview.com/chart/?symbol=FX:USDCAD", exchange: "Forex", fullName: "US Dollar / Canadian Dollar" },
  "NZD/USD": { url: "https://www.tradingview.com/chart/?symbol=FX:NZDUSD", exchange: "Forex", fullName: "New Zealand Dollar / US Dollar" },
  "EUR/GBP": { url: "https://www.tradingview.com/chart/?symbol=FX:EURGBP", exchange: "Forex", fullName: "Euro / British Pound" },
  "EUR/JPY": { url: "https://www.tradingview.com/chart/?symbol=FX:EURJPY", exchange: "Forex", fullName: "Euro / Japanese Yen" },
  "GBP/JPY": { url: "https://www.tradingview.com/chart/?symbol=FX:GBPJPY", exchange: "Forex", fullName: "British Pound / Japanese Yen" },

  // Stocks
  "AAPL": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:AAPL", exchange: "NASDAQ", fullName: "Apple Inc." },
  "TSLA": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:TSLA", exchange: "NASDAQ", fullName: "Tesla Inc." },
  "NVDA": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:NVDA", exchange: "NASDAQ", fullName: "NVIDIA Corp." },
  "MSFT": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:MSFT", exchange: "NASDAQ", fullName: "Microsoft Corp." },
  "GOOGL": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:GOOGL", exchange: "NASDAQ", fullName: "Alphabet Inc." },
  "AMZN": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:AMZN", exchange: "NASDAQ", fullName: "Amazon.com Inc." },
  "META": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:META", exchange: "NASDAQ", fullName: "Meta Platforms" },
  "NFLX": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:NFLX", exchange: "NASDAQ", fullName: "Netflix Inc." },

  // Indices
  "SPX": { url: "https://www.tradingview.com/chart/?symbol=SP:SPX", exchange: "S&P", fullName: "S&P 500" },
  "NDX": { url: "https://www.tradingview.com/chart/?symbol=NASDAQ:NDX", exchange: "NASDAQ", fullName: "NASDAQ 100" },
  "DJI": { url: "https://www.tradingview.com/chart/?symbol=TVC:DJI", exchange: "Dow Jones", fullName: "Dow Jones Industrial Average" },
  "IXIC": { url: "https://www.tradingview.com/chart/?symbol=TVC:NDQ", exchange: "NASDAQ", fullName: "NASDAQ Composite" },

  // Commodities
  "XAU/USD": { url: "https://www.tradingview.com/chart/?symbol=TVC:GOLD", exchange: "COMEX", fullName: "Gold / US Dollar" },
  "XAG/USD": { url: "https://www.tradingview.com/chart/?symbol=TVC:SILVER", exchange: "COMEX", fullName: "Silver / US Dollar" },
  "WTI": { url: "https://www.tradingview.com/chart/?symbol=NYMEX:CL1!", exchange: "NYMEX", fullName: "Crude Oil WTI" },
};

// ─── Resolve TradingView URL for a symbol ───────────────────
export function resolveTradingViewUrl(symbol: string): TradingViewMapping | null {
  return TRADINGVIEW_MAPPINGS[symbol] ?? null;
}

// ─── Get TradingView symbol search URL ──────────────────────
export function getTradingViewSearchUrl(query: string): string {
  return `https://www.tradingview.com/symbols/${encodeURIComponent(query)}/`;
}

// ─── Build TradingView data page URL ────────────────────────
export function getTradingViewDataUrl(symbol: string): string {
  const mapping = resolveTradingViewUrl(symbol);
  if (mapping) return mapping.url;
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`;
}

// ─── Known exchange for a category ──────────────────────────
export function getDefaultExchange(category: MarketCategory): string {
  switch (category) {
    case "crypto": return "Binance";
    case "forex": return "Forex";
    case "stocks": return "NASDAQ";
    case "indices": return "CME";
    case "commodities": return "COMEX";
  }
}
