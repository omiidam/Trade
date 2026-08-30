export type FetchedPage = { url: string; title: string; text: string; fetchedAt: string; status: number };

const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

export async function fetchWebPage(url: string, timeout = 12000): Promise<FetchedPage> {
  for (const fn of [...[directFetch], ...PROXIES.map(p => (u: string) => p(u))]) {
    try {
      const fetchUrl = fn === directFetch ? url : fn(url);
      const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(fetchUrl, { signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
      clearTimeout(timer);
      if (res.ok) { const html = await res.text(); return { url, title: extractTitle(html), text: htmlToText(html), fetchedAt: new Date().toISOString(), status: res.status }; }
    } catch { continue; }
  }
  return { url, title: "", text: "", fetchedAt: new Date().toISOString(), status: 0 };
}

function directFetch(u: string) { return u; }
function extractTitle(h: string) { const m = h.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? m[1].replace(/\s+/g, " ").trim() : ""; }
function htmlToText(h: string): string {
  let t = h.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  t = t.replace(/<(br|hr|\/div|\/p|\/li|\/h[1-6]|\/tr)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ");
  return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

export async function fetchMultiplePages(urls: string[], max = 3, timeout = 12000): Promise<FetchedPage[]> {
  const results: FetchedPage[] = [];
  for (let i = 0; i < urls.length; i += max) {
    const batch = urls.slice(i, i + max);
    const r = await Promise.allSettled(batch.map(u => fetchWebPage(u, timeout)));
    for (const x of r) if (x.status === "fulfilled" && x.value.status === 200) results.push(x.value);
  }
  return results;
}
