import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  Shield,
  Zap,
  Brain,
  BarChart3,
  Info,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPrice } from "@/utils";
import type { AnalysisResult as AnalysisResultType } from "@/types";

export function AnalysisResultDisplay({ result }: { result: AnalysisResultType }) {
  const { t, lang } = useI18n();

  const trendConfig = {
    bullish: { icon: TrendingUp, color: "text-bullish", bg: "bg-bullish/10", label: "Bullish" },
    bearish: { icon: TrendingDown, color: "text-bearish", bg: "bg-bearish/10", label: "Bearish" },
    neutral: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted", label: "Neutral" },
    mixed: { icon: BarChart3, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Mixed" },
  };

  const trend = trendConfig[result.trend];
  const TrendIcon = trend.icon;

  const confidenceColors = {
    high: "bg-bullish/15 text-bullish",
    medium: "bg-yellow-500/15 text-yellow-500",
    low: "bg-bearish/15 text-bearish",
  };

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Summary + Trend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", trend.bg)}>
              <TrendIcon className={cn("w-5 h-5", trend.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("font-bold", trend.color)}>{trend.label}</span>
                <Badge className={cn("text-[10px]", confidenceColors[result.confidence])}>
                  {t.analysis.result.confidence}: {result.confidence}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Levels */}
      {result.keyLevels && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {t.analysis.result.keyLevels}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {result.keyLevels.entry !== null && result.keyLevels.entry !== undefined && (
                <div className="p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground uppercase">{t.analysis.result.entry}</span>
                  <p className="text-sm font-mono font-medium">{formatPrice(result.keyLevels.entry)}</p>
                </div>
              )}
              {result.keyLevels.invalidation !== null && result.keyLevels.invalidation !== undefined && (
                <div className="p-2 rounded-lg bg-bearish/5">
                  <span className="text-[10px] text-muted-foreground uppercase">{t.analysis.result.invalidation}</span>
                  <p className="text-sm font-mono font-medium text-bearish">{formatPrice(result.keyLevels.invalidation)}</p>
                </div>
              )}
              {result.keyLevels.target1 !== null && result.keyLevels.target1 !== undefined && (
                <div className="p-2 rounded-lg bg-bullish/5">
                  <span className="text-[10px] text-muted-foreground uppercase">{t.analysis.result.target1}</span>
                  <p className="text-sm font-mono font-medium text-bullish">{formatPrice(result.keyLevels.target1)}</p>
                </div>
              )}
              {result.keyLevels.target2 !== null && result.keyLevels.target2 !== undefined && (
                <div className="p-2 rounded-lg bg-bullish/5">
                  <span className="text-[10px] text-muted-foreground uppercase">{t.analysis.result.target2}</span>
                  <p className="text-sm font-mono font-medium text-bullish">{formatPrice(result.keyLevels.target2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support & Resistance */}
      {(result.support.length > 0 || result.resistance.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {result.support.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-bullish" />
                    <span className="text-xs font-medium text-bullish">{t.analysis.result.support}</span>
                  </div>
                  <div className="space-y-1">
                    {result.support.map((level, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-bullish" />
                        {formatPrice(level)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.resistance.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-bearish" />
                    <span className="text-xs font-medium text-bearish">{t.analysis.result.resistance}</span>
                  </div>
                  <div className="space-y-1">
                    {result.resistance.map((level, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-bearish" />
                        {formatPrice(level)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Signals */}
      {result.signals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              {t.analysis.result.signals}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {result.signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    signal.type === "bullish"
                      ? "bg-bullish/10"
                      : signal.type === "bearish"
                      ? "bg-bearish/10"
                      : "bg-muted"
                  )}
                >
                  {signal.type === "bullish" ? (
                    <TrendingUp className="w-3 h-3 text-bullish" />
                  ) : signal.type === "bearish" ? (
                    <TrendingDown className="w-3 h-3 text-bearish" />
                  ) : (
                    <Minus className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{signal.name}</span>
                    <Badge variant="outline" className="text-[9px] py-0">
                      {signal.strength}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reasoning */}
      {result.reasoning.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              {t.analysis.result.reasoning}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ol className="space-y-1.5">
              {result.reasoning.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-primary font-mono shrink-0">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {result.risks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-bearish">
              <AlertTriangle className="w-4 h-4" />
              {t.analysis.result.risks}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-1.5">
              {result.risks.map((risk, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-bearish shrink-0">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Data Limitations */}
      {result.dataLimitations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Info className="w-4 h-4" />
              {t.analysis.result.dataLimitations}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-1">
              {result.dataLimitations.map((limitation, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  • {limitation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong>{t.analysis.disclaimers.title}:</strong>{" "}
          {t.analysis.disclaimers.text}
        </p>
      </div>
    </div>
  );
}
