import type {
  AppSettings,
  StoredMarketData,
  AnalysisHistoryEntry,
  MarketSymbol,
} from "@/types";

const STORAGE_KEYS = {
  SETTINGS: "tradefinex_settings",
  MARKET_CACHE: "tradefinex_market_cache",
  HISTORY: "tradefinex_history",
  FAVORITES: "tradefinex_favorites",
  RECENT: "tradefinex_recent",
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 4096,
  },
  defaultTimeframe: "1h",
  theme: "dark",
  language: "en",
  favorites: [],
  recentMarkets: [],
};

// ─── Settings ───────────────────────────────────────────────
export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, llm: { ...DEFAULT_SETTINGS.llm, ...parsed.llm } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const current = getSettings();
  const merged = { ...current, ...settings };
  if (settings.llm) {
    merged.llm = { ...current.llm, ...settings.llm };
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
}

// ─── Market Cache ───────────────────────────────────────────
export function getCachedMarketData(symbol: string): StoredMarketData | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.MARKET_CACHE}_${symbol}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMarketData(data: StoredMarketData): void {
  localStorage.setItem(
    `${STORAGE_KEYS.MARKET_CACHE}_${data.symbol}`,
    JSON.stringify(data)
  );
}

export function clearMarketCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.MARKET_CACHE)) {
      localStorage.removeItem(key);
    }
  });
}

// ─── Analysis History ──────────────────────────────────────
export function getHistory(): AnalysisHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: AnalysisHistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  // Keep last 50 entries
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// ─── Favorites ──────────────────────────────────────────────
export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleFavorite(symbol: string): string[] {
  const favorites = getFavorites();
  const idx = favorites.indexOf(symbol);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(symbol);
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(symbol: string): boolean {
  return getFavorites().includes(symbol);
}

// ─── Recent Markets ────────────────────────────────────────
export function getRecentMarkets(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addRecentMarket(symbol: string): string[] {
  let recent = getRecentMarkets();
  recent = recent.filter((s) => s !== symbol);
  recent.unshift(symbol);
  if (recent.length > 20) recent.pop();
  localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent));
  return recent;
}

// ─── Clear All ──────────────────────────────────────────────
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith(key)) localStorage.removeItem(k);
    });
  });
}
