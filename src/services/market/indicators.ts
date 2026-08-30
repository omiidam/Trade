import type { CandleData, IndicatorData } from "@/types";

export function calculateSMA(data: number[], period: number): (number|null)[] {
  const r: (number|null)[] = [];
  for (let i=0;i<data.length;i++) { if (i<period-1) r.push(null); else { let s=0; for (let j=i-period+1;j<=i;j++) s+=data[j]; r.push(s/period); } }
  return r;
}

export function calculateEMA(data: number[], period: number): (number|null)[] {
  const r: (number|null)[] = []; const m = 2/(period+1); let ema: number|null = null;
  for (let i=0;i<data.length;i++) {
    if (i<period-1) r.push(null);
    else if (i===period-1) { let s=0; for (let j=0;j<period;j++) s+=data[j]; ema=s/period; r.push(ema); }
    else { ema=(data[i]-ema!)*m+ema!; r.push(ema); }
  }
  return r;
}

export function calculateRSI(closes: number[], period=14): (number|null)[] {
  if (closes.length<period+1) return closes.map(()=>null);
  const gains:number[]=[], losses:number[]=[];
  for (let i=1;i<closes.length;i++) { const d=closes[i]-closes[i-1]; gains.push(d>0?d:0); losses.push(d<0?-d:0); }
  let ag=0, al=0;
  for (let i=0;i<period;i++) { ag+=gains[i]; al+=losses[i]; }
  ag/=period; al/=period;
  const r:(number|null)[]=[null]; for (let i=0;i<period;i++) r.push(null);
  r.push(al===0?100:100-100/(1+ag/al));
  for (let i=period;i<gains.length;i++) { ag=(ag*(period-1)+gains[i])/period; al=(al*(period-1)+losses[i])/period; r.push(al===0?100:100-100/(1+ag/al)); }
  while (r.length<closes.length) r.unshift(null);
  return r;
}

export function calculateMACD(closes: number[], fast=12, slow=26, sig=9) {
  const ef=calculateEMA(closes,fast), es=calculateEMA(closes,slow);
  const ml:(number|null)[]=[]; for (let i=0;i<closes.length;i++) ml.push(ef[i]!==null&&es[i]!==null?ef[i]!-es[i]!:null);
  const mv=ml.filter((v): v is number=>v!==null); const se=calculateEMA(mv,sig);
  const sl:(number|null)[]=[],hl:(number|null)[]=[]; let si=0;
  for (let i=0;i<closes.length;i++) { if (ml[i]===null){sl.push(null);hl.push(null);} else { sl.push(se[si]??null); hl.push(se[si]!==null&&ml[i]!==null?ml[i]!-se[si]!:null); si++; } }
  return { macd:ml, signal:sl, histogram:hl };
}

export function calculateBB(closes: number[], period=20, mult=2) {
  const mid=calculateSMA(closes,period), up:(number|null)[]=[], lo:(number|null)[]=[];
  for (let i=0;i<closes.length;i++) { if(mid[i]===null){up.push(null);lo.push(null);} else { let sq=0; for(let j=i-period+1;j<=i;j++) sq+=Math.pow(closes[j]-mid[i]!,2); const sd=Math.sqrt(sq/period); up.push(mid[i]!+mult*sd); lo.push(mid[i]!-mult*sd); } }
  return { upper:up, middle:mid, lower:lo };
}

export function calculateATR(candles: CandleData[], period=14): (number|null)[] {
  const tr:number[]=[]; for (let i=0;i<candles.length;i++) { if(i===0) tr.push(candles[i].high-candles[i].low); else { const hl=candles[i].high-candles[i].low, hc=Math.abs(candles[i].high-candles[i-1].close), lc=Math.abs(candles[i].low-candles[i-1].close); tr.push(Math.max(hl,hc,lc)); } }
  const r:(number|null)[]=[]; let atr:number|null=null;
  for (let i=0;i<tr.length;i++) { if(i<period-1)r.push(null); else if(i===period-1){let s=0;for(let j=0;j<period;j++)s+=tr[j]; atr=s/period; r.push(atr);} else { atr=(atr!*(period-1)+tr[i])/period; r.push(atr); } }
  return r;
}

export function calculateAllIndicators(candles: CandleData[]): IndicatorData {
  const c=candles.map(x=>x.close);
  return { sma20:calculateSMA(c,20), sma50:calculateSMA(c,50), ema20:calculateEMA(c,20), ema50:calculateEMA(c,50), rsi14:calculateRSI(c,14), macd:calculateMACD(c), bollingerBands:calculateBB(c), atr14:calculateATR(candles) };
}
