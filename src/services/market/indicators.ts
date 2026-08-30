import type { CandleData, IndicatorData } from "@/types";

// ─── Simple Moving Average ──────────────────────────────────
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

// ─── Exponential Moving Average ─────────────────────────────
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA is SMA
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      ema = sum / period;
      result.push(ema);
    } else {
      ema = (data[i] - ema!) * multiplier + ema!;
      result.push(ema);
    }
  }
  return result;
}

// ─── Relative Strength Index ────────────────────────────────
export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (closes.length < period + 1) {
    return closes.map(() => null);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Initial average gain/loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI
  result.push(null); // no data point 0
  for (let i = 0; i < period; i++) result.push(null);

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));

  // Subsequent RSI values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push(rsi);
  }

  // Pad beginning
  while (result.length < closes.length) result.unshift(null);

  return result;
}

// ─── MACD ───────────────────────────────────────────────────
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      macdLine.push(emaFast[i]! - emaSlow[i]!);
    } else {
      macdLine.push(null);
    }
  }

  // Calculate signal line from non-null MACD values
  const macdValues = macdLine.filter((v): v is number => v !== null);
  const signalEma = calculateEMA(macdValues, signalPeriod);

  // Map signal back
  const signalLine: (number | null)[] = [];
  const histogramLine: (number | null)[] = [];
  let signalIdx = 0;

  for (let i = 0; i < closes.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogramLine.push(null);
    } else {
      signalLine.push(signalEma[signalIdx] ?? null);
      histogramLine.push(
        signalEma[signalIdx] !== null && macdLine[i] !== null
          ? macdLine[i]! - signalEma[signalIdx]!
          : null
      );
      signalIdx++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram: histogramLine };
}

// ─── Bollinger Bands ────────────────────────────────────────
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSqDiff += Math.pow(closes[j] - middle[i]!, 2);
      }
      const stdDev = Math.sqrt(sumSqDiff / period);
      upper.push(middle[i]! + stdDevMultiplier * stdDev);
      lower.push(middle[i]! - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}

// ─── Average True Range ─────────────────────────────────────
export function calculateATR(candles: CandleData[], period: number = 14): (number | null)[] {
  const trueRanges: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      trueRanges.push(candles[i].high - candles[i].low);
    } else {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      trueRanges.push(Math.max(hl, hc, lc));
    }
  }

  const result: (number | null)[] = [];
  let atr: number | null = null;

  for (let i = 0; i < trueRanges.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += trueRanges[j];
      atr = sum / period;
      result.push(atr);
    } else {
      atr = (atr! * (period - 1) + trueRanges[i]) / period;
      result.push(atr);
    }
  }
  return result;
}

// ─── Calculate All Indicators ───────────────────────────────
export function calculateAllIndicators(candles: CandleData[]): IndicatorData {
  const closes = candles.map((c) => c.close);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  const atr14 = calculateATR(candles, 14);

  return { sma20, sma50, ema20, ema50, rsi14, macd, bollingerBands, atr14 };
}
