import type { FetchedPage } from "./webPageFetcher";
import type { SourceInfo } from "@/types";

export type ExtractedContent = { text: string; sources: SourceInfo[] };

export function extractMarketContent(pages: FetchedPage[]): ExtractedContent {
  const texts: string[] = [];
  const sources: SourceInfo[] = [];
  for (const p of pages) {
    if (p.status !== 200 || !p.text) continue;
    const relevant = p.text.split(/[.!?]+/).filter(s => /price|trend|support|resistance|bullish|bearish|volume|analysis/i.test(s) && s.trim().length > 20).slice(0, 30).join(". ");
    if (relevant) texts.push(relevant);
    const type: SourceInfo["type"] = /tradingview/.test(p.url) ? "tradingview" : /binance|coinbase|kraken/.test(p.url) ? "exchange" : /reuters|cnbc|coindesk/.test(p.url) ? "news" : "financial_portal";
    sources.push({ url: p.url, title: p.title, retrievedAt: p.fetchedAt, type });
  }
  return { text: texts.join("\n\n"), sources };
}
