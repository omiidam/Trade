import type { MarketCategory } from "@/types";

type SearchResult = { title: string; url: string; snippet: string };

const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

export async function searchMarket(symbol: string, category: MarketCategory): Promise<SearchResult[]> {
  const query = `${symbol} ${category} price chart analysis`;
  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(ddgUrl), { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const html = await res.text();
      return parseDDG(html);
    } catch { continue; }
  }
  return [];
}

function parseDDG(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const regex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null && results.length < 10) {
    let url = match[1];
    const uddg = url.match(/uddg=([^&]+)/);
    if (uddg) url = decodeURIComponent(uddg[1]);
    results.push({ title: stripHtml(match[2]), url, snippet: stripHtml(match[3]) });
  }
  return results;
}

function stripHtml(s: string): string { return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim(); }
