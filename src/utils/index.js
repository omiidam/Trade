export const POPULAR_MARKETS = [
  { symbol:"BTC/USDT", displayName:"Bitcoin", category:"crypto", exchange:"Binance" },
  { symbol:"ETH/USDT", displayName:"Ethereum", category:"crypto", exchange:"Binance" },
  { symbol:"SOL/USDT", displayName:"Solana", category:"crypto", exchange:"Binance" },
  { symbol:"BNB/USDT", displayName:"BNB", category:"crypto", exchange:"Binance" },
  { symbol:"XRP/USDT", displayName:"XRP", category:"crypto", exchange:"Binance" },
  { symbol:"ADA/USDT", displayName:"Cardano", category:"crypto", exchange:"Binance" },
  { symbol:"DOGE/USDT", displayName:"Dogecoin", category:"crypto", exchange:"Binance" },
  { symbol:"AVAX/USDT", displayName:"Avalanche", category:"crypto", exchange:"Binance" },
  { symbol:"EUR/USD", displayName:"Euro / US Dollar", category:"forex", exchange:"Forex" },
  { symbol:"GBP/USD", displayName:"British Pound / USD", category:"forex", exchange:"Forex" },
  { symbol:"USD/JPY", displayName:"US Dollar / Yen", category:"forex", exchange:"Forex" },
  { symbol:"USD/CHF", displayName:"US Dollar / Franc", category:"forex", exchange:"Forex" },
  { symbol:"AAPL", displayName:"Apple Inc.", category:"stocks", exchange:"NASDAQ" },
  { symbol:"TSLA", displayName:"Tesla Inc.", category:"stocks", exchange:"NASDAQ" },
  { symbol:"NVDA", displayName:"NVIDIA Corp.", category:"stocks", exchange:"NASDAQ" },
  { symbol:"MSFT", displayName:"Microsoft Corp.", category:"stocks", exchange:"NASDAQ" },
  { symbol:"SPX", displayName:"S&P 500", category:"indices", exchange:"CME" },
  { symbol:"NDX", displayName:"NASDAQ 100", category:"indices", exchange:"NASDAQ" },
  { symbol:"XAU/USD", displayName:"Gold / US Dollar", category:"commodities", exchange:"COMEX" },
  { symbol:"XAG/USD", displayName:"Silver / US Dollar", category:"commodities", exchange:"COMEX" },
];

export const CATEGORIES = [
  { value:"crypto", label:"Crypto", icon:"bi-currency-bitcoin" },
  { value:"forex", label:"Forex", icon:"bi-currency-exchange" },
  { value:"stocks", label:"Stocks", icon:"bi-graph-up" },
  { value:"indices", label:"Indices", icon:"bi-bar-chart-line" },
  { value:"commodities", label:"Commodities", icon:"bi-gem" },
];

export const TIMEFRAMES = [
  { value:"1m", label:"1M", seconds:60 },
  { value:"5m", label:"5M", seconds:300 },
  { value:"15m", label:"15M", seconds:900 },
  { value:"1h", label:"1H", seconds:3600 },
  { value:"4h", label:"4H", seconds:14400 },
  { value:"1d", label:"1D", seconds:86400 },
  { value:"1w", label:"1W", seconds:604800 },
  { value:"1M", label:"1M", seconds:2592000 },
];

export function normalizeSymbol(input) {
  let s = input.trim().toUpperCase();
  if (s.includes(":")) s = s.split(":")[1];
  const map = { BTCUSDT:"BTC/USDT", ETHUSDT:"ETH/USDT", BNBUSDT:"BNB/USDT", SOLUSDT:"SOL/USDT", EURUSD:"EUR/USD", GBPUSD:"GBP/USD", USDJPY:"USD/JPY", XAUUSD:"XAU/USD" };
  if (map[s]) return map[s];
  if (s.includes("/")) return s;
  return s;
}

export function detectMarketCategory(symbol) {
  const s = symbol.toUpperCase();
  if (/BTC|ETH|BNB|SOL|XRP|ADA|DOGE|DOT|AVAX|LINK|USDT|USDC/.test(s)) return "crypto";
  if (/XAU|XAG|GOLD|SILVER|WTI|OIL/.test(s)) return "commodities";
  if (/SPX|NDX|DJI|SP500|S&P|NASDAQ|DOW/.test(s)) return "indices";
  if (/EUR|GBP|JPY|CHF|AUD|CAD|NZD/.test(s)) return "forex";
  return "stocks";
}

export function formatPrice(p, dec) {
  if (p == null) return "\u2014";
  if (p === 0) return "0";
  if (Math.abs(p) >= 1e9) return `${(p/1e9).toFixed(2)}B`;
  if (Math.abs(p) >= 1e6) return `${(p/1e6).toFixed(2)}M`;
  if (Math.abs(p) >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: dec ?? 2 });
  if (Math.abs(p) >= 1) return p.toFixed(dec ?? 2);
  return p.toFixed(dec ?? 4);
}

export function formatPercent(v) {
  if (v == null) return "\u2014";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function formatVolume(v) {
  if (v == null) return "\u2014";
  if (v >= 1e12) return `${(v/1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v/1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
  return v.toString();
}

export function formatDate(d, lang) {
  try { return new Date(d).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" }); } catch { return d; }
}

export function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
export function getErrorMessage(e) { return e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error"; }
