import { getState } from '../app';
import { storage } from '../services/storage';
import { formatPrice, formatDate } from '../utils/index';
import { showToast } from '../services/toast';

export function historyPage(container) {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const history = storage.getJSON('analysis_history', []);

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${t('History','تاریخچه')}</div>
      ${history.length ? `<button class="topbar-action" onclick="clearHistory()"><i class="bi bi-trash3"></i></button>` : ''}
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${t('Analysis History','تاریخچه تحلیل‌ها')}</h1><p>${history.length} ${t('previous analyses','تحلیل قبلی')}</p></div>
      <div id="historyList"></div>
    </div>`;

  renderHistory();
}

function renderHistory() {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const el = document.getElementById('historyList');
  const history = storage.getJSON('analysis_history', []);
  if (!el) return;

  if (!history.length) {
    el.innerHTML = `<div class="empty-state"><i class="bi bi-clock-history"></i><h3>${t('No history yet','تاریخچه‌ای نیست')}</h3><p>${t('Your analyses will appear here','تحلیل‌های شما اینجا نمایش داده می‌شوند')}</p></div>`;
    return;
  }

  const trendColor = { bullish: 'var(--v-success)', bearish: 'var(--v-danger)', neutral: 'var(--v-text-muted)', mixed: 'var(--v-warning)' };

  el.innerHTML = history.map((h) => `
    <div class="v-table-row" style="margin-bottom:8px;">
      <div class="v-table-row-header">
        <div>
          <div class="fw-600" style="font-size:14px;">${h.symbol}</div>
          <div style="font-size:11px;color:var(--v-text-muted);">${formatDate(h.timestamp, lang)}</div>
        </div>
        ${h.result?.trend ? `<span class="v-badge ${h.result.trend === 'bullish' ? 'v-badge-success' : h.result.trend === 'bearish' ? 'v-badge-danger' : 'v-badge-primary'}">${h.result.trend}</span>` : ''}
      </div>
      <div style="font-size:12px;color:var(--v-text-secondary);margin-top:8px;">"${h.prompt}"</div>
      ${h.result?.summary ? `<div style="font-size:12px;color:var(--v-text-muted);margin-top:6px;line-height:1.5;">${h.result.summary.slice(0, 150)}${h.result.summary.length > 150 ? '...' : ''}</div>` : ''}
      <div class="v-table-row-action">
        <button class="v-btn v-btn-sm v-btn-outline" onclick="viewHistoryItem('${h.symbol}')">
          <i class="bi bi-bar-chart-line"></i> ${t('View Chart','مشاهده نمودار')}
        </button>
        <button class="v-btn v-btn-sm v-btn-ghost" style="color:var(--v-danger);" onclick="deleteHistoryItem(${h.id || 0})">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.viewHistoryItem = (sym) => {
  storage.set('selectedMarket', sym);
  navigate('/chart');
};

window.deleteHistoryItem = (id) => {
  let history = storage.getJSON('analysis_history', []);
  history = history.filter((h) => h.id !== id);
  storage.setJSON('analysis_history', history);
  renderHistory();
  showToast(getState().language === 'fa' ? 'حذف شد' : 'Deleted', 'success');
};

window.clearHistory = () => {
  if (confirm(getState().language === 'fa' ? 'تاریخچه پاک شود؟' : 'Clear all history?')) {
    storage.setJSON('analysis_history', []);
    renderHistory();
    showToast(getState().language === 'fa' ? 'تاریخچه پاک شد' : 'History cleared', 'success');
  }
};
