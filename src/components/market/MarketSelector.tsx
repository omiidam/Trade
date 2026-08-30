import { useState, useMemo } from "react";
import {
  Search,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/context/AppContext";
import {
  POPULAR_MARKETS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  detectMarketCategory,
  normalizeSymbol,
  cn,
} from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarketCategory } from "@/types";

const CATEGORIES: MarketCategory[] = ["crypto", "forex", "stocks", "indices", "commodities"];

export function MarketSelector({ onSelect }: { onSelect: (symbol: string, category: MarketCategory) => void }) {
  const { t, lang } = useI18n();
  const { favorites, recentMarkets } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "all" | "favorites">("all");

  const filteredMarkets = useMemo(() => {
    let markets = POPULAR_MARKETS;

    if (search) {
      const q = search.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.symbol.toLowerCase().includes(q) ||
          m.displayName.toLowerCase().includes(q)
      );
    }

    if (activeCategory === "favorites") {
      markets = markets.filter((m) => favorites.includes(m.symbol));
    } else if (activeCategory !== "all") {
      markets = markets.filter((m) => m.category === activeCategory);
    }

    return markets;
  }, [search, activeCategory, favorites]);

  const handleCustomSymbol = () => {
    if (!search.trim()) return;
    const normalized = normalizeSymbol(search);
    const category = detectMarketCategory(normalized);
    onSelect(normalized, category);
  };

  const recentMarketsList = useMemo(() => {
    return recentMarkets
      .map((sym) => POPULAR_MARKETS.find((m) => m.symbol === sym))
      .filter(Boolean)
      .slice(0, 5);
  }, [recentMarkets]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.home.searchPlaceholder}
            className="ps-9 pe-9 bg-secondary/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(["all", "favorites", ...CATEGORIES] as const).map((cat) => {
            const label =
              cat === "all"
                ? t.home.all
                : cat === "favorites"
                ? t.home.favorites
                : CATEGORY_LABELS[cat][lang];

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {cat !== "all" && cat !== "favorites" && (
                  <span className="me-1">{CATEGORY_ICONS[cat]}</span>
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Symbol Entry */}
      {search && filteredMarkets.length === 0 && (
        <div className="px-4 pb-3">
          <button
            onClick={handleCustomSymbol}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-accent transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-start">
              <p className="font-medium text-sm">{search.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">{t.home.customSymbol}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Recent Markets */}
      {!search && activeCategory === "all" && recentMarketsList.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t.home.recent}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {recentMarketsList.map((market) => (
              <button
                key={market!.symbol}
                onClick={() => onSelect(market!.symbol, market!.category)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all whitespace-nowrap"
              >
                <span className="text-xs font-medium">{market!.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Market List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-1.5">
          {filteredMarkets.map((market) => (
            <button
              key={market.symbol}
              onClick={() => onSelect(market.symbol, market.category)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                  market.category === "crypto"
                    ? "bg-orange-500/10 text-orange-500"
                    : market.category === "forex"
                    ? "bg-blue-500/10 text-blue-500"
                    : market.category === "stocks"
                    ? "bg-green-500/10 text-green-500"
                    : market.category === "indices"
                    ? "bg-purple-500/10 text-purple-500"
                    : "bg-yellow-500/10 text-yellow-500"
                )}
              >
                {CATEGORY_ICONS[market.category]}
              </div>
              <div className="flex-1 text-start">
                <p className="font-medium text-sm">{market.symbol}</p>
                <p className="text-xs text-muted-foreground truncate">{market.displayName}</p>
              </div>
              <div className="flex items-center gap-2">
                {favorites.includes(market.symbol) && (
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                )}
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                  {market.exchange}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        {filteredMarkets.length === 0 && !search && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t.home.noMarkets}</p>
          </div>
        )}
      </div>
    </div>
  );
}
