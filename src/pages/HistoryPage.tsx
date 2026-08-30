import { useNavigate } from "react-router-dom";
import { Clock, Trash2, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate, formatPrice } from "@/utils";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { history, clearHistory, setCurrentChartData, setCurrentResearch } = useApp();

  const handleViewChart = (entry: (typeof history)[0]) => {
    setCurrentChartData(entry.chartData);
    navigate(`/market/${encodeURIComponent(entry.symbol)}`, {
      state: { category: entry.chartData.market },
    });
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case "bullish":
        return <TrendingUp className="w-3.5 h-3.5 text-bullish" />;
      case "bearish":
        return <TrendingDown className="w-3.5 h-3.5 text-bearish" />;
      case "neutral":
        return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
      default:
        return <BarChart3 className="w-3.5 h-3.5 text-yellow-500" />;
    }
  };

  const trendColor = (trend: string) => {
    switch (trend) {
      case "bullish":
        return "text-bullish";
      case "bearish":
        return "text-bearish";
      case "neutral":
        return "text-muted-foreground";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">{t.history.title}</h2>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.history.clearAll}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">{t.history.empty}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.history.emptyDesc}</p>
            </div>
          )}

          {history.map((entry) => (
            <Card
              key={entry.id}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleViewChart(entry)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      entry.result.trend === "bullish"
                        ? "bg-bullish/10"
                        : entry.result.trend === "bearish"
                        ? "bg-bearish/10"
                        : "bg-muted"
                    )}
                  >
                    {trendIcon(entry.result.trend)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{entry.symbol}</span>
                      <span className={cn("text-xs font-medium capitalize", trendColor(entry.result.trend))}>
                        {entry.result.trend}
                      </span>
                      <Badge variant="outline" className="text-[9px]">
                        {entry.result.confidence}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.prompt}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {formatDate(entry.timestamp, lang)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
