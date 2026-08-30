export type FetchedPage = {
  url: string;
  title: string;
  html: string;
  text: string;
  fetchedAt: string;
  status: number;
};

// CORS proxy options for browser environment
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

// ─── Fetch a web page with CORS proxy fallback ──────────────
export async function fetchWebPage(url: string, timeout: number = 15000): Promise<FetchedPage> {
  // Try direct fetch first (works in Capacitor / non-browser)
  try {
    const result = await fetchDirect(url, timeout);
    if (result.status === 200) return result;
  } catch {
    // Direct fetch failed (likely CORS), try proxies
  }

  // Try CORS proxies
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      const result = await fetchDirect(proxyUrl, timeout);
      if (result.status === 200) return result;
    } catch {
      continue;
    }
  }

  // If all fail, return minimal result
  return {
    url,
    title: "",
    html: "",
    text: "",
    fetchedAt: new Date().toISOString(),
    status: 0,
  };
}

async function fetchDirect(url: string, timeout: number): Promise<FetchedPage> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();
    const title = extractTitle(html);
    const text = htmlToText(html);

    return {
      url,
      title,
      html,
      text,
      fetchedAt: new Date().toISOString(),
      status: response.status,
    };
  } finally {
    clearTimeout(timer);
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function htmlToText(html: string): string {
  let text = html;
  // Remove scripts and styles
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");
  // Replace common block elements with newlines
  text = text.replace(/<(br|hr|\/div|\/p|\/li|\/h[1-6]|\/tr)[^>]*>/gi, "\n");
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// ─── Fetch multiple pages concurrently ─────────────────────
export async function fetchMultiplePages(
  urls: string[],
  maxConcurrent: number = 3,
  timeout: number = 15000
): Promise<FetchedPage[]> {
  const results: FetchedPage[] = [];

  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map((url) => fetchWebPage(url, timeout))
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.status === 200) {
        results.push(result.value);
      }
    }
  }

  return results;
}
