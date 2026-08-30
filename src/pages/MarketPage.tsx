import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Star,
  Share2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  BarChart3,
  Globe,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingChart } from "@/components/chart/TradingChart";
import { AnalysisInput } from "@/components/analysis/AnalysisInput";
import { AnalysisResultDisplay } from "@/components/analysis/AnalysisResult";
import {
  normalizeSymbol,
  detectMarketCategory,
  formatPrice,
  formatPercent,
  formatVolume,
  formatDate,
  TIMEFRAMES,
  cn,
  generateId,
  getErrorMessage,
} from "@/utils";
import type {
  MarketCategory,
  ChartData,
  ResearchPackage,
  AnalysisResult,
  Timeframe,
  CandleData,
} from "@/types";
import { searchMarket } from "@/services/web/searchProvider";
import { fetchMultiplePages } from "@/services/web/webPageFetcher";
import { extractMarketContent, mergePriceData } from "@/services/web/contentExtractor";
import { resolveTradingViewUrl, getDefaultExchange } from "@/services/web/tradingviewResolver";
import { callLLM, parseLLMJson } from "@/services/llm/llmService";
import { buildNormalizeSystemPrompt, buildNormalizeUserMessage } from "@/prompts/normalize";
import { buildAnalyzeSystemPrompt, buildAnalyzeUserMessage } from "@/prompts/analyze";
import { calculateAllIndicators } from "@/services/market/indicators";
import { NormalizedResearchSchema } from "@/schemas";
import * as storage from "@/services/storage/storageService";

export default function MarketPage() {
  const { symbol: urlSymbol } = useParams<{ symbol: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const {
    settings,
    currentChartData,
    setCurrentChartData,
    currentResearch,
    setCurrentResearch,
    addHistoryEntry,
    favorites,
    toggleFavorite,
    setIsLoading,
    isLoading,
    error,
    setError,
  } = useApp();

  const symbol = decodeURIComponent(urlSymbol || "");
  const category: MarketCategory =
    (location.state?.category as MarketCategory) || detectMarketCategory(symbol);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [timeframe, setTimeframe] = useState<Timeframe>(settings.defaultTimeframe);

  const isFavorited = favorites.includes(symbol);

  // ─── Market Research Flow ───────────────────────────────
  const runResearch = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Search the web
      const searchResults = await searchMarket(symbol, category);

      // Step 2: Fetch web pages
      const urls = searchResults.slice(0, 5).map((r) => r.url);

      // Add TradingView URL if available
      const tvMapping = resolveTradingViewUrl(symbol);
      if (tvMapping && !urls.includes(tvMapping.url)) {
        urls.unshift(tvMapping.url);
      }

      const fetchedPages = await fetchMultiplePages(urls);

      // Step 3: Extract content
      const extracted = extractMarketContent(fetchedPages);
      const mergedPrices = mergePriceData(extracted.prices);

      // Build research package
      const research: ResearchPackage = {
        symbol,
        category,
        rawContent: extracted.text,
        sources: extracted.sources,
        priceData: {
          currentPrice: mergedPrices.price ?? null,
          change24h: mergedPrices.change ?? null,
          changePercent24h: mergedPrices.changePercent ?? null,
          volume24h: mergedPrices.volume ?? null,
          high24h: mergedPrices.high ?? null,
          low24h: mergedPrices.low ?? null,
          open24h: mergedPrices.open ?? null,
        },
        rawHtml: "",
        retrievedAt: new Date().toISOString(),
      };

      setCurrentResearch(research);

      // Step 4: LLM Normalize call
      let chartData: ChartData | null = null;

      if (settings.llm.apiKey) {
        try {
          const normalizeResponse = await callLLM(
            settings.llm,
            [
              { role: "system", content: buildNormalizeSystemPrompt() },
              { role: "user", content: buildNormalizeUserMessage(research) },
            ],
            { temperature: 0.1, maxTokens: 4096, timeout: 60000 }
          );

          const normalized = parseLLMJson(normalizeResponse.content, NormalizedResearchSchema);

          // Build chart data from normalized research
          const exchange = normalized.exchange || getDefaultExchange(category);
          const currency = normalized.currency || (category === "forex" ? symbol.split("/")[1] || "USD" : "USD");

          // Use candles from LLM if available, otherwise generate placeholder data
          let candles: CandleData[] = [];
          if (normalized.candles && normalized.candles.length > 0) {
            candles = normalized.candles;
          } else if (normalized.currentPrice) {
            // Generate synthetic candles from current price for chart display
            candles = generateSyntheticCandles(normalized.currentPrice, timeframe);
          }

          // Calculate technical indicators locally
          const indicators = candles.length > 5 ? calculateAllIndicators(candles) : {
            sma20: [], sma50: [], ema20: [], ema50: [], rsi14: [],
            macd: { macd: [], signal: [], histogram: [] },
            bollingerBands: { upper: [], middle: [], lower: [] },
            atr14: [],
          };

          chartData = {
            symbol,
            market: category,
            exchange,
            currency,
            timeframe,
            retrievedAt: new Date().toISOString(),
            currentPrice: normalized.currentPrice,
            change24h: normalized.change24h,
            changePercent24h: normalized.changePercent24h,
            volume24h: normalized.volume24h,
            candles,
            indicators,
            levels: {
              support: normalized.support || [],
              resistance: normalized.resistance || [],
            },
            sources: normalized.sources.length > 0 ? normalized.sources : research.sources,
          };
        } catch (err) {
          console.error("LLM normalization failed:", err);
          // Fall back to basic chart data from web extraction
          chartData = buildFallbackChartData(symbol, category, research);
        }
      } else {
        // No LLM configured, use extracted data directly
        chartData = buildFallbackChartData(symbol, category, research);
      }

      setCurrentChartData(chartData);

      // Cache the data
      storage.saveMarketData({
        symbol,
        chartData,
        research,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [symbol, category, timeframe, settings.llm]);

  // Run research on mount
  useEffect(() => {
    // Check cache first
    const cached = storage.getCachedMarketData(symbol);
    const cacheAge = cached
      ? Date.now() - new Date(cached.timestamp).getTime()
      : Infinity;
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    if (cached && cacheAge < CACHE_TTL) {
      setCurrentChartData(cached.chartData);
      setCurrentResearch(cached.research);
    } else {
      runResearch();
    }
  }, [symbol]);

  // ─── AI Analysis Flow ───────────────────────────────────
  const handleAnalyze = useCallback(
    async (prompt: string) => {
      if (!currentChartData || !settings.llm.apiKey) {
        if (!settings.llm.apiKey) {
          setError(t.errors.invalidApiKey);
        }
        return;
      }

      setIsAnalyzing(true);
      setAnalysisResult(null);

      try {
        const response = await callLLM(
          settings.llm,
          [
            { role: "system", content: buildAnalyzeSystemPrompt() },
            {
              role: "user",
              content: buildAnalyzeUserMessage(
                currentChartData,
                currentResearch || {
                  symbol,
                  category,
                  rawContent: "",
                  sources: currentChartData.sources,
                  priceData: {},
                  rawHtml: "",
                  retrievedAt: new Date().toISOString(),
                },
                prompt
              ),
            },
          ],
          { temperature: 0.3, maxTokens: 4096, timeout: 90000 }
        );

        const result = parseLLMJson<AnalysisResult>(response.content);
        setAnalysisResult(result);

        // Save to history
        addHistoryEntry({
          id: generateId(),
          symbol,
          prompt,
          result,
          chartData: currentChartData,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const msg = getErrorMessage(err);
        if (msg === "MALFORMED_JSON") {
          setError(t.errors.malformedJson);
        } else if (msg.includes("429") || msg === "RATE_LIMIT") {
          setError(t.errors.llmRateLimit);
        } else {
          setError(t.errors.llmFailed);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentChartData, currentResearch, symbol, category, settings.llm, t]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="safe-top px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 rtl-flip" />
            </Button>
            <div>
              <h2 className="font-bold text-base">{symbol}</h2>
              <p className="text-[10px] text-muted-foreground">
                {category} • {currentChartData?.exchange || getDefaultExchange(category)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toggleFavorite(symbol)}
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  isFavorited ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={runResearch}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {/* Price Display */}
        {currentChartData && (
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold font-mono text-price">
              {formatPrice(currentChartData.currentPrice)}
            </span>
            {currentChartData.changePercent24h !== null && (
              <span
                className={cn(
                  "text-sm font-medium font-mono",
                  (currentChartData.changePercent24h ?? 0) >= 0
                    ? "text-bullish"
                    : "text-bearish"
                )}
              >
                {formatPercent(currentChartData.changePercent24h)}
              </span>
            )}
            {currentChartData.volume24h !== null && (
              <span className="text-xs text-muted-foreground">
                Vol: {formatVolume(currentChartData.volume24h)}
              </span>
            )}
          </div>
        )}

        {/* Timeframe selector */}
        <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-medium transition-all whitespace-nowrap",
                timeframe === tf.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && !currentChartData && (
          <div className="p-4 space-y-4">
            <Skeleton className="h-[350px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{t.common.error}</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setError(null);
                      runResearch();
                    }}
                  >
                    {t.market.tryAgain}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chart + Analysis Tabs */}
        {currentChartData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-4 py-2 border-b border-border">
              <TabsList className="w-full">
                <TabsTrigger value="chart" className="flex-1 gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {t.market.chart}
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1 gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t.market.analysis}
                </TabsTrigger>
                <TabsTrigger value="sources" className="flex-1 gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {t.market.sources}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Chart Tab */}
            <TabsContent value="chart" className="mt-0 px-4 pb-4 space-y-3">
              <TradingChart data={currentChartData} className="mt-3" />

              {/* Indicators Summary */}
              <Card>
                <CardContent className="p-3">
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">{t.market.indicators}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <IndicatorBadge
                      label="RSI 14"
                      value={lastValue(currentChartData.indicators.rsi14)}
                      format={(v) => v.toFixed(1)}
                    />
                    <IndicatorBadge
                      label="SMA 20"
                      value={lastValue(currentChartData.indicators.sma20)}
                      format={(v) => formatPrice(v)}
                    />
                    <IndicatorBadge
                      label="SMA 50"
                      value={lastValue(currentChartData.indicators.sma50)}
                      format={(v) => formatPrice(v)}
                    />
                    <IndicatorBadge
                      label="ATR 14"
                      value={lastValue(currentChartData.indicators.atr14)}
                      format={(v) => v.toFixed(4)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sources */}
              {currentChartData.sources.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    {t.market.lastUpdated}: {formatDate(currentChartData.retrievedAt, lang)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentChartData.sources.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[9px]">
                        {s.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="mt-0 px-4 pb-4 space-y-4">
              <div className="mt-3">
                <AnalysisInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
              </div>

              {/* Loading */}
              {isAnalyzing && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">{t.analysis.analyzing}</p>
                </div>
              )}

              {/* Result */}
              {analysisResult && <AnalysisResultDisplay result={analysisResult} />}

              {/* Empty State */}
              {!isAnalyzing && !analysisResult && (
                <div className="flex flex-col items-center py-8 text-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">{t.analysis.noResults}</p>
                </div>
              )}
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="mt-0 px-4 pb-4">
              <div className="mt-3 space-y-2">
                {currentChartData.sources.map((source, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">
                          {source.type}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{source.title}</p>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary truncate block"
                          >
                            {source.url}
                          </a>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDate(source.retrievedAt, lang)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {currentChartData.sources.length === 0 && (
                  <div className="text-center py-8">
                    <Globe className="w-10 h-10 text-muted-foreground/30 mb-3 mx-auto" />
                    <p className="text-sm text-muted-foreground">No sources available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────
function IndicatorBadge({
  label,
  value,
  format,
}: {
  label: string;
  value: number | null;
  format: (v: number) => string;
}) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <p className="text-xs font-mono font-medium mt-0.5">
        {value !== null ? format(value) : "—"}
      </p>
    </div>
  );
}

// ─── Helper Functions ───────────────────────────────────────
function lastValue(arr: (number | null)[]): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== null) return arr[i];
  }
  return null;
}

function generateSyntheticCandles(
  currentPrice: number,
  timeframe: Timeframe
): CandleData[] {
  const now = Date.now();
  const tfSeconds =
    TIMEFRAMES.find((t) => t.value === timeframe)?.seconds ?? 3600;
  const count = 60; // 60 candles
  const candles: CandleData[] = [];

  let price = currentPrice * (1 - 0.05 + Math.random() * 0.1);

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * tfSeconds * 1000;
    const volatility = price * 0.005;
    const open = price + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const volume = Math.random() * 1000000;

    candles.push({
      timestamp,
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
      volume,
    });

    price = close;
  }

  // Adjust last candle to match current price
  if (candles.length > 0) {
    candles[candles.length - 1].close = currentPrice;
  }

  return candles;
}

function buildFallbackChartData(
  symbol: string,
  category: MarketCategory,
  research: ResearchPackage
): ChartData {
  const exchange = getDefaultExchange(category);
  const price = research.priceData.currentPrice;

  const candles = price ? generateSyntheticCandles(price, "1h") : [];
  const indicators = candles.length > 5 ? calculateAllIndicators(candles) : {
    sma20: [], sma50: [], ema20: [], ema50: [], rsi14: [],
    macd: { macd: [], signal: [], histogram: [] },
    bollingerBands: { upper: [], middle: [], lower: [] },
    atr14: [],
  };

  return {
    symbol,
    market: category,
    exchange,
    currency: symbol.includes("/") ? symbol.split("/")[1] : "USD",
    timeframe: "1h",
    retrievedAt: new Date().toISOString(),
    currentPrice: price ?? null,
    change24h: research.priceData.change24h ?? null,
    changePercent24h: research.priceData.changePercent24h ?? null,
    volume24h: research.priceData.volume24h ?? null,
    candles,
    indicators,
    levels: { support: [], resistance: [] },
    sources: research.sources,
  };
}
