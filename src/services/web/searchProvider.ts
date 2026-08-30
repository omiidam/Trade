import type { MarketCategory } from "@/types";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

// ─── DuckDuckGo HTML Search ─────────────────────────────────
// Uses DuckDuckGo's lite HTML endpoint - no API key required
async function searchDuckDuckGo(query: string, maxResults: number = 10): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const params = new URLSearchParams({
      q: query,
      t: "h_",
      ia: "web",
    });

    // Use DuckDuckGo lite for simpler HTML parsing
    const response = await fetch(`https://lite.duckduckgo.com/lite/?${params.toString()}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
      },
    });

    const html = await response.text();
    results.push(...parseDuckDuckGoLite(html, maxResults));
  } catch (err) {
    console.error("DuckDuckGo search failed:", err);
  }

  // Fallback: try DuckDuckGo HTML
  if (results.length === 0) {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`https://html.duckduckgo.com/html/?${params.toString()}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
        },
      });
      const html = await response.text();
      results.push(...parseDuckDuckGoHTML(html, maxResults));
    } catch (err) {
      console.error("DuckDuckGo HTML search failed:", err);
    }
  }

  return results.slice(0, maxResults);
}

function parseDuckDuckGoLite(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];

  // Extract result links
  const linkRegex = /<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/gi;
  const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

  const links: { url: string; title: string }[] = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null && links.length < maxResults) {
    const url = match[1].trim();
    const title = match[2].trim();
    if (url && !url.includes("duckduckgo.com") && title) {
      links.push({ url, title });
    }
  }

  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
    snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
  }

  for (let i = 0; i < links.length && i < maxResults; i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] || "",
    });
  }

  return results;
}

function parseDuckDuckGoHTML(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];

  // Parse result blocks
  const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const url = decodeURIComponent(
      (match[1].match(/uddg=([^&]+)/)?.[1]) || match[1]
    );
    const title = match[2].replace(/<[^>]+>/g, "").trim();
    const snippet = match[3].replace(/<[^>]+>/g, "").trim();

    if (url && title && !url.includes("duckduckgo.com")) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

// ─── Market-Specific Search ─────────────────────────────────
export async function searchMarket(
  symbol: string,
  category: MarketCategory
): Promise<SearchResult[]> {
  const queries = buildSearchQueries(symbol, category);
  const allResults: SearchResult[] = [];

  for (const query of queries) {
    try {
      const results = await searchDuckDuckGo(query, 5);
      allResults.push(...results);
    } catch {
      // Continue with other queries
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

function buildSearchQueries(symbol: string, category: MarketCategory): string[] {
  const normalizedSymbol = symbol.replace("/", "").replace(" ", "");
  const cleanSymbol = symbol.replace("/", " ");

  switch (category) {
    case "crypto":
      return [
        `${cleanSymbol} price today live`,
        `${cleanSymbol} tradingview technical analysis`,
        `${normalizedSymbol} market data candlestick`,
      ];
    case "forex":
      return [
        `${cleanSymbol} exchange rate today`,
        `${cleanSymbol} forex technical analysis`,
        `${cleanSymbol} tradingview chart`,
      ];
    case "stocks":
      return [
        `${symbol} stock price today live`,
        `${symbol} stock technical analysis`,
        `${symbol} tradingview analysis market data`,
      ];
    case "indices":
      return [
        `${cleanSymbol} index value today`,
        `${cleanSymbol} technical analysis chart`,
        `${cleanSymbol} market data live`,
      ];
    case "commodities":
      return [
        `${cleanSymbol} price today live`,
        `${cleanSymbol} technical analysis chart`,
        `${cleanSymbol} market data commodity`,
      ];
    default:
      return [`${cleanSymbol} price today market data technical analysis`];
  }
}
