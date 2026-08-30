import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AppSettings,
  ChartData,
  AnalysisHistoryEntry,
  ResearchPackage,
  LLMConfig,
  Timeframe,
} from "@/types";
import * as storage from "@/services/storage/storageService";

type AppContextType = {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateLLMConfig: (partial: Partial<LLMConfig>) => void;
  currentChartData: ChartData | null;
  setCurrentChartData: (data: ChartData | null) => void;
  currentResearch: ResearchPackage | null;
  setCurrentResearch: (data: ResearchPackage | null) => void;
  history: AnalysisHistoryEntry[];
  addHistoryEntry: (entry: AnalysisHistoryEntry) => void;
  clearHistory: () => void;
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  recentMarkets: string[];
  addRecentMarket: (symbol: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings);
  const [currentChartData, setCurrentChartData] = useState<ChartData | null>(null);
  const [currentResearch, setCurrentResearch] = useState<ResearchPackage | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>(storage.getHistory);
  const [favorites, setFavorites] = useState<string[]>(storage.getFavorites);
  const [recentMarkets, setRecentMarkets] = useState<string[]>(storage.getRecentMarkets);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist settings changes
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (settings.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Apply language/RTL
  useEffect(() => {
    document.documentElement.dir = settings.language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateLLMConfig = useCallback((partial: Partial<LLMConfig>) => {
    setSettings((prev) => ({
      ...prev,
      llm: { ...prev.llm, ...partial },
    }));
  }, []);

  const addHistoryEntry = useCallback((entry: AnalysisHistoryEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 50);
      storage.addHistoryEntry(entry);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    storage.clearHistory();
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const updated = storage.toggleFavorite(symbol);
      return updated;
    });
  }, []);

  const addRecentMarket = useCallback((symbol: string) => {
    setRecentMarkets((prev) => {
      const updated = storage.addRecentMarket(symbol);
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        updateLLMConfig,
        currentChartData,
        setCurrentChartData,
        currentResearch,
        setCurrentResearch,
        history,
        addHistoryEntry,
        clearHistory,
        favorites,
        toggleFavorite,
        recentMarkets,
        addRecentMarket,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
