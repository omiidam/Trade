import { getState } from '../app';
import { marketDataService } from '../services/market/marketDataService';
import { openLiveFeed } from '../services/market/liveFeed';
import { callLLM, parseLLMJson } from '../services/llm/llmService';
import { buildAnalyzeSystemPrompt, buildAnalyzeUserMessage } from '../prompts/analyze';
import { searchMarket } from '../services/web/searchProvider';
import { fetchMultiplePages } from '../services/web/webPageFetcher';
import { extractMarketContent } from '../services/web/contentExtractor';
import { resolveTradingViewUrl } from '../services/web/tradingviewResolver';
import { buildNormalizeSystemPrompt, buildNormalizeUserMessage } from '../prompts/normalize';
import { formatPrice, formatPercent, formatVolume, formatDate, TIMEFRAMES, getErrorMessage } from '../utils/index';
import { storage } from '../services/storage';
import { } from '../types/index';
import ApexCharts from 'apexcharts';

let chartInstance = null;
let liveFeed = null;
let currentTimeframe = '1h';

export function chartPage(container) {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const symbol = storage.get('selectedMarket') || 'BTC/USDT';
  const state = { loading: true, data: null, analysis: null, error: null };

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="history.back()"><i class="bi bi-arrow-left"></i></button>
      <div class="topbar-title" id="chartSymbol">${symbol}</div>
      <button class="topbar-action" id="chartRefresh" onclick="refreshChart()"><i class="bi bi-arrow-clockwise"></i></button>
    </div>
    <div class="page-container">
      <!-- Price Header -->
      <div id="priceHeader" style="margin-bottom:16px;">
        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
          <span class="stat-card-value" id="chartPrice" style="font-size:28px;">—</span>
          <span id="chartChange" style="font-size:14px;font-weight:600;">—</span>
        </div>
        <div style="font-size:12px;color:var(--v-text-muted);margin-top:4px;" id="chartMeta">Loading...</div>
      </div>

      <!-- Timeframe Selector -->
      <div class="d-flex gap-8 mb-16" style="overflow-x:auto;" id="tfSelector">
        ${TIMEFRAMES.map(tf => `<button class="v-btn v-btn-sm ${tf.value==='1h'?'v-btn-primary':'v-btn-outline'}" data-tf="${tf.value}" onclick="switchTimeframe('${tf.value}')">${tf.label}</button>`).join('')}
      </div>

      <!-- Chart Container -->
      <div class="v-card mb-16" id="chartCard">
        <div id="chartContainer" style="min-height:300px;"></div>
      </div>

      <!-- Loading State -->
      <div id="chartLoading" class="v-card mb-16" style="display:none;">
        <div class="d-flex items-center gap-12" style="padding:20px;">
          <div class="skeleton" style="width:24px;height:24px;border-radius:50%;"></div>
          <span style="font-size:13px;color:var(--v-text-muted);">Fetching candles...</span>
        </div>
      </div>

      <!-- Error State -->
      <div id="chartError" class="v-card mb-16" style="display:none;border-color:var(--v-danger);">
        <div style="padding:16px;">
          <div class="d-flex items-center gap-8 mb-8"><i class="bi bi-exclamation-triangle" style="color:var(--v-danger);"></i><span class="fw-600" style="font-size:14px;">Error</span></div>
          <p id="chartErrorMsg" style="font-size:13px;color:var(--v-text-muted);"></p>
          <button class="v-btn v-btn-sm v-btn-outline mt-8" onclick="refreshChart()"><i class="bi bi-arrow-clockwise"></i> Retry</button>
        </div>
      </div>

      <!-- Indicators -->
      <div id="indicatorsCard" class="v-card mb-16" style="display:none;">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-activity" style="margin-right:6px;color:var(--v-primary);"></i>${t('Indicators','اندیکاتورها')}</div></div>
        <div class="grid-2" style="gap:8px;" id="indicatorsGrid"></div>
      </div>

      <!-- AI Analysis -->
      <div class="v-card mb-16">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-robot" style="margin-right:6px;color:var(--v-primary);"></i>${t('AI Analysis','تحلیل هوش مصنوعی')}</div></div>
        <div class="v-input-group">
          <textarea class="v-input" id="analysisPrompt" rows="2" placeholder="${t('What would you like analyzed?', 'چه چیزی را تحلیل کنیم؟')}"></textarea>
        </div>
        <div class="d-flex gap-8" style="flex-wrap:wrap;margin-bottom:12px;">
          ${['Analyze the trend','Find support & resistance','Look for reversal signals','Complete technical analysis'].map(p => `
            <button class="v-btn v-btn-sm v-btn-outline" onclick="document.getElementById('analysisPrompt').value='${p}'">${p}</button>
          `).join('')}
        </div>
        <button class="v-btn v-btn-primary v-btn-block" id="analyzeBtn" onclick="runAnalysis()">
          <i class="bi bi-robot"></i> ${t('Analyze','تحلیل')}
        </button>
        <div id="analysisLoading" style="display:none;text-align:center;padding:24px;">
          <div class="skeleton" style="width:32px;height:32px;border-radius:50%;margin:0 auto 8px;"></div>
          <p style="font-size:13px;color:var(--v-text-muted);">${t('AI is analyzing...','در حال تحلیل...')}</p>
        </div>
        <div id="analysisResult" style="display:none;margin-top:12px;"></div>
      </div>

      <!-- Sources -->
      <div id="sourcesCard" class="v-card" style="display:none;">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-globe" style="margin-right:6px;color:var(--v-primary);"></i>${t('Sources','منابع')}</div></div>
        <div id="sourcesList"></div>
      </div>
    </div>`;

  // Store state on the window for access from event handlers
  window._chartState = state;
  window._chartSymbol = symbol;
  window._chartData = null;
  loadChart(symbol);
}

async function loadChart(sym) {
  const state = window._chartState;
  const loadingEl = document.getElementById('chartLoading');
  const errorEl = document.getElementById('chartError');
  const loading = document.getElementById('chartLoading');

  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';

  try {
    const result = await marketDataService.getMarketData(sym, currentTimeframe, { minCandles: 200 });
    const chartData = {
      symbol: sym, market: result.quote.currentPrice ? 'crypto' : 'crypto', exchange: result.exchange,
      currency: sym.includes('/') ? sym.split('/')[1] : 'USDT', timeframe: currentTimeframe,
      retrievedAt: result.fetchedAt, currentPrice: result.quote.currentPrice,
      change24h: result.quote.change24h, changePercent24h: result.quote.changePercent24h,
      volume24h: result.quote.volume24h, candles: result.candles, indicators: result.indicators,
      levels: { support: [], resistance: [] },
      sources: [{ url: `https://www.binance.com/en/trade/${result.normalizedSymbol}`, title: `${result.exchange} OHLCV`, retrievedAt: result.fetchedAt, type: 'exchange' }],
    };

    state.data = chartData;
    state.error = null;
    if (loadingEl) loadingEl.style.display = 'none';

    // Update price header
    const priceEl = document.getElementById('chartPrice');
    const changeEl = document.getElementById('chartChange');
    const metaEl = document.getElementById('chartMeta');
    if (priceEl) priceEl.textContent = formatPrice(chartData.currentPrice);
    if (changeEl) {
      const pct = chartData.changePercent24h;
      changeEl.textContent = `${formatPercent(pct)}`;
      changeEl.style.color = (pct ?? 0) >= 0 ? 'var(--v-success)' : 'var(--v-danger)';
    }
    if (metaEl) metaEl.textContent = `${result.candles.length} candles • ${result.exchange} • ${result.normalizedSymbol} • ${currentTimeframe} • ${result.source}`;

    renderChart(chartData);
    renderIndicators(chartData);
    renderSources(chartData);
    startLiveFeed(sym);

    // Background enrichment (research + LLM normalize) — never blocks chart
    runBackgroundResearch(sym, chartData);
  } catch (err) {
    state.error = getErrorMessage(err);
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = 'block';
      const msgEl = document.getElementById('chartErrorMsg');
      if (msgEl) msgEl.textContent = state.error;
    }
  }
}

function renderChart(data) {
  const el = document.getElementById('chartContainer');
  if (!el || !data.candles.length) return;

  if (chartInstance) { try { chartInstance.destroy(); } catch {} chartInstance = null; }

  const isDark = getState().theme === 'dark';
  const tc = isDark ? '#a0aec0' : '#6c757d';
  const gc = isDark ? '#252838' : '#f1f3f6';

  const ohlc = data.candles.map(c => ({ x: new Date(c.timestamp), y: [c.open, c.high, c.low, c.close] }));
  const vol = data.candles.map(c => ({ x: new Date(c.timestamp), y: c.volume, fillColor: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }));

  chartInstance = new ApexCharts(el, {
    chart: { type: 'candlestick', height: 300, toolbar: { show: false }, background: 'transparent' },
    series: [{ name: 'Price', data: ohlc }],
    plotOptions: { candlestick: { colors: { upward: '#34c38f', downward: '#f46a6a' }, wick: { useFillColor: true } } },
    xaxis: { type: 'datetime', labels: { style: { colors: tc, fontSize: '10px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: tc, fontSize: '10px' }, formatter: (v) => formatPrice(v) }, tooltip: { enabled: true } },
    grid: { borderColor: gc, strokeDashArray: 4 },
    tooltip: { theme: isDark ? 'dark' : 'light', x: { format: 'dd MMM HH:mm' } },
  });
  chartInstance.render();

  // Volume as overlay
  const volEl = document.createElement('div');
  volEl.id = 'volumeChart';
  el.appendChild(volEl);
  // Volume chart is optional — skip for now to keep it simple
}

function renderIndicators(data) {
  const el = document.getElementById('indicatorsCard');
  const grid = document.getElementById('indicatorsGrid');
  if (!el || !grid) return;
  el.style.display = 'block';
  const n = data.candles.length - 1;
  const ind = data.indicators;

  const items = [
    { label: 'RSI (14)', value: ind.rsi14[n]?.toFixed(1) },
    { label: 'SMA (20)', value: ind.sma20[n] ? formatPrice(ind.sma20[n]) : '—' },
    { label: 'SMA (50)', value: ind.sma50[n] ? formatPrice(ind.sma50[n]) : '—' },
    { label: 'EMA (20)', value: ind.ema20[n] ? formatPrice(ind.ema20[n]) : '—' },
    { label: 'MACD', value: ind.macd.macd[n]?.toFixed(2) },
    { label: 'ATR (14)', value: ind.atr14[n]?.toFixed(4) },
    { label: 'BB Upper', value: ind.bollingerBands.upper[n] ? formatPrice(ind.bollingerBands.upper[n]) : '—' },
    { label: 'BB Lower', value: ind.bollingerBands.lower[n] ? formatPrice(ind.bollingerBands.lower[n]) : '—' },
  ];

  grid.innerHTML = items.map(i => `
    <div style="padding:8px;background:var(--v-input-bg);border-radius:8px;">
      <div style="font-size:10px;color:var(--v-text-muted);text-transform:uppercase;letter-spacing:0.5px;">${i.label}</div>
      <div style="font-size:13px;font-weight:600;font-family:monospace;margin-top:2px;">${i.value ?? '—'}</div>
    </div>
  `).join('');
}

function renderSources(data) {
  const card = document.getElementById('sourcesCard');
  const list = document.getElementById('sourcesList');
  if (!card || !list) return;
  if (!data.sources.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  list.innerHTML = data.sources.map(s => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--v-border-light);">
      <span class="v-badge v-badge-primary">${s.type}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.title}</div>
        <a href="${s.url}" target="_blank" rel="noopener" style="font-size:10px;color:var(--v-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${s.url}</a>
      </div>
    </div>
  `).join('');
}

function startLiveFeed(sym) {
  if (liveFeed) { liveFeed.close(); liveFeed = null; }
  try {
    liveFeed = openLiveFeed(sym, currentTimeframe, {
      onKline: (candle) => {
        const state = window._chartState;
        if (!state?.data) return;
        const candles = state.data.candles;
        const last = candles[candles.length - 1];
        if (!last) return;
        let updated;
        if (candle.timestamp === last.timestamp) updated = [...candles.slice(0, -1), candle];
        else if (candle.timestamp > last.timestamp) updated = [...candles, candle];
        else return;
        state.data = { ...state.data, candles: updated, currentPrice: candle.close };
        const priceEl = document.getElementById('chartPrice');
        if (priceEl) priceEl.textContent = formatPrice(candle.close);
        // Update chart with live data
        if (chartInstance) {
          try { chartInstance.updateSeries([{ data: updated.map(c => ({ x: new Date(c.timestamp), y: [c.open, c.high, c.low, c.close] })) }]); } catch {}
        }
      },
    });
  } catch {}
}

async function runBackgroundResearch(sym, baseData) {
  try {
    const searchResults = await searchMarket(sym, baseData.market);
    const urls = searchResults.slice(0, 3).map(r => r.url);
    const tv = resolveTradingViewUrl(sym);
    if (tv && !urls.includes(tv.url)) urls.unshift(tv.url);
    const pages = await fetchMultiplePages(urls);
    const extracted = extractMarketContent(pages);
    if (extracted.sources.length) {
      baseData.sources = [...baseData.sources, ...extracted.sources];
      renderSources(baseData);
    }
  } catch { /* silent */ }
}

window.switchTimeframe = (tf) => {
  currentTimeframe = tf;
  document.querySelectorAll('[data-tf]').forEach(b => { b.className = b.dataset.tf === tf ? 'v-btn v-btn-sm v-btn-primary' : 'v-btn v-btn-sm v-btn-outline'; });
  loadChart(window._chartSymbol);
};

window.refreshChart = () => loadChart(window._chartSymbol);

window.runAnalysis = async () => {
  const prompt = (document.getElementById('analysisPrompt'))?.value;
  const state = window._chartState;
  if (!prompt || !state?.data) return;

  const settings = getState();
  const loadingEl = document.getElementById('analysisLoading');
  const resultEl = document.getElementById('analysisResult');
  const btn = document.getElementById('analyzeBtn');

  if (!settings.llm?.apiKey) { alert('Please configure your LLM API key in Settings first.'); return; }

  if (loadingEl) loadingEl.style.display = 'block';
  if (resultEl) resultEl.style.display = 'none';
  if (btn) (btn).disabled = true;

  try {
    const response = await callLLM(
      { baseUrl: settings.llm.baseUrl, apiKey: settings.llm.apiKey, model: settings.llm.model, temperature: 0.3, maxTokens: 4096 },
      [
        { role: 'system', content: buildAnalyzeSystemPrompt() },
        { role: 'user', content: buildAnalyzeUserMessage(state.data, { symbol: state.data.symbol, category: state.data.market, rawContent: '', sources: state.data.sources, priceData: {}, rawHtml: '', retrievedAt: state.data.retrievedAt }, prompt) },
      ],
      { temperature: 0.3, maxTokens: 4096, timeout: 90000 }
    );
    const result = parseLLMJson<AnalysisResult>(response.content);
    state.analysis = result;
    renderAnalysisResult(result);
  } catch (err) {
    if (resultEl) resultEl.innerHTML = `<div style="padding:12px;background:var(--v-danger);color:#fff;border-radius:8px;font-size:13px;">Analysis failed: ${getErrorMessage(err)}</div>`;
    if (resultEl) resultEl.style.display = 'block';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    if (btn) (btn).disabled = false;
  }
};

function renderAnalysisResult(result) {
  const el = document.getElementById('analysisResult');
  if (!el) return;
  const trendColor = { bullish: 'var(--v-success)', bearish: 'var(--v-danger)', neutral: 'var(--v-text-muted)', mixed: 'var(--v-warning)' }[result.trend] || 'var(--v-text-muted)';
  const confBadge = { high: 'v-badge-success', medium: 'v-badge-warning', low: 'v-badge-danger' }[result.confidence] || 'v-badge-primary';

  el.innerHTML = `
    <div class="v-card" style="border-left:4px solid ${trendColor};">
      <div class="d-flex items-center gap-8 mb-8">
        <span class="v-badge ${confBadge}">${result.confidence} confidence</span>
        <span class="fw-700" style="font-size:16px;color:${trendColor};text-transform:capitalize;">${result.trend}</span>
      </div>
      <p style="font-size:13px;line-height:1.6;margin-bottom:12px;">${result.summary}</p>
      ${result.signals?.length ? `
        <div style="margin-bottom:12px;">
          <div class="fw-600" style="font-size:12px;margin-bottom:6px;">Signals</div>
          ${result.signals.map(s => `
            <div style="display:flex;align-items:start;gap:6px;padding:4px 0;font-size:12px;">
              <span class="v-badge ${s.type === 'bullish' ? 'v-badge-success' : s.type === 'bearish' ? 'v-badge-danger' : 'v-badge-primary'}" style="font-size:9px;">${s.type}</span>
              <span><strong>${s.name}:</strong> ${s.description}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${result.risks?.length ? `
        <div style="margin-bottom:12px;">
          <div class="fw-600" style="font-size:12px;margin-bottom:6px;color:var(--v-danger);">Risks</div>
          ${result.risks.map(r => `<div style="font-size:12px;padding:2px 0;">• ${r}</div>`).join('')}
        </div>
      ` : ''}
      ${result.dataLimitations?.length ? `
        <div style="font-size:11px;color:var(--v-text-muted);font-style:italic;">
          Data limitations: ${result.dataLimitations.join('; ')}
        </div>
      ` : ''}
    </div>`;
  el.style.display = 'block';
}
