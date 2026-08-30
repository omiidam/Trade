import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type ISeriesApi, ColorType } from "lightweight-charts";
import type { ChartData, CandleData } from "@/types";
import { cn } from "@/utils";

type ChartView = "candlestick" | "line" | "area";

export function TradingChart({
  data,
  className,
}: {
  data: ChartData;
  className?: string;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [view, setView] = useState<ChartView>("candlestick");

  useEffect(() => {
    if (!chartContainerRef.current || data.candles.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const isDark = document.documentElement.classList.contains("dark");

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#a0aec0" : "#64748b",
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
      },
      crosshair: {
        vertLine: {
          color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
          width: 1,
          style: 2,
        },
        horzLine: {
          color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      },
      timeScale: {
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    // Prepare candle data
    const candleData = data.candles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    // Add candlestick or line/area series
    if (view === "candlestick") {
      const candleSeries = chart.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      candleSeries.setData(candleData);
      candleSeriesRef.current = candleSeries;
    } else if (view === "line") {
      const lineSeries = chart.addLineSeries({
        color: "#3b82f6",
        lineWidth: 2,
      });
      const lineData = data.candles.map((c) => ({
        time: Math.floor(c.timestamp / 1000) as any,
        value: c.close,
      }));
      lineSeries.setData(lineData);
    } else {
      const areaSeries = chart.addAreaSeries({
        topColor: "rgba(59, 130, 246, 0.4)",
        bottomColor: "rgba(59, 130, 246, 0.0)",
        lineColor: "#3b82f6",
        lineWidth: 2,
      });
      const areaData = data.candles.map((c) => ({
        time: Math.floor(c.timestamp / 1000) as any,
        value: c.close,
      }));
      areaSeries.setData(areaData);
    }

    // Add volume histogram
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeData = data.candles.map((c) => ({
      time: Math.floor(c.timestamp / 1000) as any,
      value: c.volume,
      color:
        c.close >= c.open
          ? "rgba(34, 197, 94, 0.3)"
          : "rgba(239, 68, 68, 0.3)",
    }));
    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;

    // Add SMA 20 overlay
    if (data.indicators.sma20.some((v) => v !== null)) {
      const sma20Series = chart.addLineSeries({
        color: "rgba(250, 204, 21, 0.7)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const sma20Data = data.indicators.sma20
        .map((v, i) => ({
          time: Math.floor(data.candles[i].timestamp / 1000) as any,
          value: v!,
        }))
        .filter((d) => d.value !== null && d.value !== undefined);
      sma20Series.setData(sma20Data as any);
    }

    // Add SMA 50 overlay
    if (data.indicators.sma50.some((v) => v !== null)) {
      const sma50Series = chart.addLineSeries({
        color: "rgba(168, 85, 247, 0.7)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      const sma50Data = data.indicators.sma50
        .map((v, i) => ({
          time: Math.floor(data.candles[i].timestamp / 1000) as any,
          value: v!,
        }))
        .filter((d) => d.value !== null && d.value !== undefined);
      sma50Series.setData(sma50Data as any);
    }

    // Add support/resistance lines
    for (const level of data.levels.support) {
      const series = chart.addLineSeries({
        color: "rgba(34, 197, 94, 0.5)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      series.setData(
        data.candles.map((c) => ({
          time: Math.floor(c.timestamp / 1000) as any,
          value: level,
        })) as any
      );
    }

    for (const level of data.levels.resistance) {
      const series = chart.addLineSeries({
        color: "rgba(239, 68, 68, 0.5)",
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      series.setData(
        data.candles.map((c) => ({
          time: Math.floor(c.timestamp / 1000) as any,
          value: level,
        })) as any
      );
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, view]);

  if (data.candles.length === 0) {
    return (
      <div className={cn("chart-container flex items-center justify-center bg-card min-h-[300px]", className)}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No chart data available</p>
          <p className="text-xs mt-1">Data will appear once research is complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("chart-container", className)}>
      {/* View switcher */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        {(["candlestick", "line", "area"] as ChartView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-all capitalize",
              view === v
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v === "candlestick" ? "Candle" : v}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-yellow-400/70 rounded-full inline-block" />
            SMA20
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-purple-500/70 rounded-full inline-block" />
            SMA50
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="w-full h-[350px] sm:h-[400px]" />
    </div>
  );
}
