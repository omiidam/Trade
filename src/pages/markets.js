import { getState } from '../app';
import { POPULAR_MARKETS, CATEGORIES } from '../utils/index';
import { storage } from '../services/storage';

export function marketsPage(container) {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialCat = params.get('cat') || 'all';

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${t('Markets','بازارها')}</div>
      <button class="topbar-action" onclick="navigate('/settings')"><i class="bi bi-gear"></i></button>
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${t('Select a Market','انتخاب بازار')}</h1></div>

      <!-- Search -->
      <div class="v-input-group mb-16">
        <input type="text" class="v-input" id="marketSearch" placeholder="${t('Search markets...','جستجوی بازار...')}" oninput="filterMarkets()" />
      </div>

      <!-- Category Tabs -->
      <div class="d-flex gap-8 mb-16" style="overflow-x:auto;padding-bottom:4px;">
        <button class="v-btn v-btn-sm ${initialCat==='all'?'v-btn-primary':'v-btn-outline'}" data-cat="all" onclick="selectCategory('all',this)">${t('All','همه')}</button>
        ${CATEGORIES.map(c => `
          <button class="v-btn v-btn-sm ${initialCat===c.value?'v-btn-primary':'v-btn-outline'}" data-cat="${c.value}" onclick="selectCategory('${c.value}',this)">
            <i class="bi ${c.icon}"></i> ${c.label}
          </button>
        `).join('')}
      </div>

      <!-- Favorites -->
      <div id="favoritesSection" style="display:none;" class="mb-16">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-star-fill" style="color:var(--v-warning);margin-right:6px;"></i>${t('Favorites','علاقه‌مندی‌ها')}</div></div>
        <div id="favoritesList" class="d-flex gap-8" style="flex-wrap:wrap;"></div>
      </div>

      <!-- Markets Grid -->
      <div id="marketsList"></div>
    </div>`;

  window._currentCategory = initialCat;
  renderMarkets();
  renderFavorites();
}

function renderMarkets() {
  const el = document.getElementById('marketsList');
  const search = document.getElementById('marketSearch')?.value?.toLowerCase() || '';
  const cat = window._currentCategory || 'all';
  if (!el) return;

  let filtered = POPULAR_MARKETS;
  if (cat !== 'all') filtered = filtered.filter(m => m.category === cat);
  if (search) filtered = filtered.filter(m => m.symbol.toLowerCase().includes(search) || m.displayName.toLowerCase().includes(search));

  const catColors = { crypto:'#f1b44c', forex:'#556ee6', stocks:'#34c38f', indices:'#50a5f1', commodities:'#f46a6a' };

  el.innerHTML = filtered.map(m => `
    <div class="v-table-row" style="cursor:pointer;margin-bottom:8px;" onclick="selectMarket('${m.symbol}')">
      <div class="v-table-row-header">
        <div class="v-avatar v-avatar-sm" style="background:${catColors[m.category] || '#74788d'}">
          <span style="font-size:12px;">${m.symbol.charAt(0)}</span>
        </div>
        <div style="flex:1;">
          <div class="fw-600" style="font-size:14px;">${m.symbol}</div>
          <div style="font-size:11px;color:var(--v-text-muted);">${m.displayName}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="v-btn v-btn-sm v-btn-ghost" onclick="event.stopPropagation();toggleFav('${m.symbol}')" title="${m.symbol}">
            <i class="bi bi-star${isFav(m.symbol)?'-fill':''}" style="color:${isFav(m.symbol)?'var(--v-warning)':'var(--v-text-muted)'}"></i>
          </button>
          <i class="bi bi-chevron-right" style="color:var(--v-text-muted);"></i>
        </div>
      </div>
    </div>
  `).join('') || `<div class="empty-state"><i class="bi bi-search"></i><h3>No markets found</h3></div>`;
}

function renderFavorites() {
  const favs = storage.getJSON('favorites', []);
  const section = document.getElementById('favoritesSection');
  const list = document.getElementById('favoritesList');
  if (!section || !list) return;
  if (!favs.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = favs.map(s => `
    <button class="v-btn v-btn-sm v-btn-outline" onclick="selectMarket('${s}')" style="gap:4px;">
      <i class="bi bi-star-fill" style="color:var(--v-warning);font-size:10px;"></i> ${s}
    </button>
  `).join('');
}

function isFav(sym) { return storage.getJSON('favorites', []).includes(sym); }

window.selectCategory = (cat, btn) => {
  window._currentCategory = cat;
  document.querySelectorAll('[data-cat]').forEach(b => { b.className = b.dataset.cat === cat ? 'v-btn v-btn-sm v-btn-primary' : 'v-btn v-btn-sm v-btn-outline'; });
  renderMarkets();
};

window.filterMarkets = () => renderMarkets();

window.selectMarket = (sym) => {
  storage.set('selectedMarket', sym);
  const recent = storage.getJSON('recent', []);
  const updated = [sym, ...recent.filter(s => s !== sym)].slice(0, 20);
  storage.setJSON('recent', updated);
  navigate('/chart');
};

window.toggleFav = (sym) => {
  const favs = storage.getJSON('favorites', []);
  const idx = favs.indexOf(sym);
  if (idx >= 0) favs.splice(idx, 1); else favs.push(sym);
  storage.setJSON('favorites', favs);
  renderMarkets();
  renderFavorites();
};
