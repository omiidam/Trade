import { getState } from '../app';
import { POPULAR_MARKETS, formatPrice, formatPercent, formatVolume } from '../utils/index';
import { marketDataService } from '../services/market/marketDataService';
import { storage } from '../services/storage';

export function dashboardPage(container) {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const user = getState().user;

  container.innerHTML = `
    <div class="topbar" style="position:sticky;top:0;z-index:100;">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">TradeFinex</div>
      <button class="topbar-action" onclick="navigate('/settings')"><i class="bi bi-gear"></i></button>
    </div>
    <div class="page-container">
      <div class="greeting">
        <h1>${getGreeting(lang)}, ${(user?.name || 'Trader').split(' ')[0]}!</h1>
        <p>${t('Market overview and quick access','نمای کلی بازار و دسترسی سریع')}</p>
      </div>

      <!-- Featured Markets -->
      <div class="mb-20">
        <div class="v-card-header"><div class="v-card-title">${t('Featured Markets','بازارهای ویژه')}</div></div>
        <div id="featuredMarkets" class="grid-2 mb-16">
          ${['BTC/USDT','ETH/USDT','EUR/USD','XAU/USD'].map(sym => `
            <div class="stat-card" style="cursor:pointer;" onclick="navigateToMarket('${sym}')">
              <div class="d-flex justify-content-between items-center mb-16">
                <div>
                  <div class="stat-card-label" style="font-size:13px;font-weight:600;">${sym}</div>
                  <div style="font-size:11px;color:var(--v-text-muted);">${POPULAR_MARKETS.find(m=>m.symbol===sym)?.displayName || sym}</div>
                </div>
                <div class="v-avatar v-avatar-sm" style="background:${getCategoryColor(POPULAR_MARKETS.find(m=>m.symbol===sym)?.category || 'crypto')}">
                  <i class="bi ${getCategoryIcon(POPULAR_MARKETS.find(m=>m.symbol===sym)?.category || 'crypto')}" style="font-size:14px;"></i>
                </div>
              </div>
              <div class="stat-card-value" id="price-${sym.replace('/','')}">—</div>
              <div class="stat-card-change" id="change-${sym.replace('/','')}">${t('Loading...','بارگذاری...')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title">${t('Quick Actions','دسترسی سریع')}</div></div>
        <div class="d-flex gap-8" style="flex-wrap:wrap;">
          <button class="v-btn v-btn-primary" onclick="navigate('/markets')"><i class="bi bi-search"></i> ${t('Find Market','جستجوی بازار')}</button>
          <button class="v-btn v-btn-outline" onclick="navigate('/chart')"><i class="bi bi-bar-chart-line"></i> ${t('Open Chart','نمودار')}</button>
          <button class="v-btn v-btn-outline" onclick="navigate('/history')"><i class="bi bi-clock-history"></i> ${t('History','تاریخچه')}</button>
        </div>
      </div>

      <!-- Recent Markets -->
      <div class="v-card mb-20" id="recentMarketsCard">
        <div class="v-card-header"><div class="v-card-title">${t('Recent Markets','بازارهای اخیر')}</div></div>
        <div id="recentMarkets"></div>
      </div>

      <!-- Market Categories -->
      <div class="v-card">
        <div class="v-card-header"><div class="v-card-title">${t('Browse Categories','دسته‌بندی‌ها')}</div></div>
        <div class="grid-2" style="gap:8px;">
          ${[
            { cat:'crypto', label:t('Crypto','ارز دیجیتال'), icon:'bi-currency-bitcoin', count:8 },
            { cat:'forex', label:t('Forex','فارکس'), icon:'bi-currency-exchange', count:4 },
            { cat:'stocks', label:t('Stocks','سهام'), icon:'bi-graph-up', count:4 },
            { cat:'indices', label:t('Indices','شاخص‌ها'), icon:'bi-bar-chart-line', count:2 },
            { cat:'commodities', label:t('Commodities','کالاها'), icon:'bi-gem', count:2 },
          ].map(c => `
            <button class="stat-card" style="text-align:left;padding:14px;" onclick="navigate('/markets?cat=${c.cat}')">
              <div class="d-flex items-center gap-12">
                <div class="stat-card-icon" style="width:36px;height:36px;font-size:16px;background:${getCategoryColor(c.cat)}20;color:${getCategoryColor(c.cat)};"><i class="bi ${c.icon}"></i></div>
                <div><div class="fw-600" style="font-size:13px;">${c.label}</div><div style="font-size:11px;color:var(--v-text-muted);">${c.count} ${t('markets','بازار')}</div></div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>`;

  // Load prices in background
  loadFeaturedPrices();
  renderRecentMarkets();
}

function getGreeting(lang) {
  const h = new Date().getHours();
  if (lang === 'fa') return h < 12 ? 'صبح بخیر' : h < 18 ? 'عصر بخیر' : 'شب بخیر';
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
}

function getCategoryColor(cat) {
  return { crypto:'#f1b44c', forex:'#556ee6', stocks:'#34c38f', indices:'#50a5f1', commodities:'#f46a6a' }[cat] || '#74788d';
}

function getCategoryIcon(cat) {
  return { crypto:'bi-currency-bitcoin', forex:'bi-currency-exchange', stocks:'bi-graph-up', indices:'bi-bar-chart-line', commodities:'bi-gem' }[cat] || 'bi-circle';
}

async function loadFeaturedPrices() {
  const featured = ['BTC/USDT', 'ETH/USDT', 'EUR/USD', 'XAU/USD'];
  for (const sym of featured) {
    const id = sym.replace('/', '');
    try {
      const result = await marketDataService.getMarketData(sym, '1h', { minCandles: 5 });
      const priceEl = document.getElementById(`price-${id}`);
      const changeEl = document.getElementById(`change-${id}`);
      if (priceEl) priceEl.textContent = formatPrice(result.quote.currentPrice);
      if (changeEl) {
        const pct = result.quote.changePercent24h;
        changeEl.innerHTML = `<i class="bi bi-arrow-${pct >= 0 ? 'up' : 'down'}"></i> ${formatPercent(pct)}`;
        changeEl.className = `stat-card-change ${pct >= 0 ? 'up' : 'down'}`;
      }
    } catch {
      const priceEl = document.getElementById(`price-${id}`);
      if (priceEl) priceEl.textContent = '—';
    }
  }
}

function renderRecentMarkets() {
  const el = document.getElementById('recentMarkets');
  const card = document.getElementById('recentMarketsCard');
  if (!el) return;
  const recent = storage.getJSON('recent', []);
  if (!recent.length) { if (card) card.style.display = 'none'; return; }
  el.innerHTML = recent.slice(0, 5).map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--v-border-light);cursor:pointer;" onclick="navigateToMarket('${s}')">
      <span class="fw-600" style="font-size:14px;">${s}</span>
      <i class="bi bi-chevron-right" style="color:var(--v-text-muted);"></i>
    </div>
  `).join('');
}

window.navigateToMarket = (sym) => {
  storage.set('selectedMarket', sym);
  navigate('/chart');
};
