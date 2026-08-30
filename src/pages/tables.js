import { getState } from '../app.js';
import { orders } from '../services/mockData.js';
import { formatCurrency, formatDateShort } from '../services/mockData.js';
import { showToast } from '../services/toast.js';

let sortField = 'date';
let sortDir = 'desc';
let search = '';

export function tablesPage(container) {
  const lang = getState().language;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'جدول داده‌ها' : 'Data Tables'}</div>
      <button class="topbar-action" onclick="exportCSV()"><i class="bi bi-download"></i></button>
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${lang === 'fa' ? 'جدول سفارشات' : 'Orders Table'}</h1></div>
      <div class="d-flex gap-8 mb-16" style="flex-wrap:wrap;">
        <input type="text" class="v-input" style="flex:1;min-width:160px;" placeholder="${lang === 'fa' ? 'جستجو...' : 'Search orders...'}" oninput="searchOrders(this.value)" />
        <button class="v-btn v-btn-sm v-btn-outline" onclick="sortOrders('id')">${lang === 'fa' ? 'مرتب‌سازی' : 'Sort'} <i class="bi bi-arrow-down-up"></i></button>
      </div>
      <div id="ordersTable" class="v-table-card"></div>
    </div>`;

  renderTable();
}

function renderTable() {
  const lang = getState().language;
  const el = document.getElementById('ordersTable');
  if (!el) return;

  let data = [...orders];
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q));
  }
  data.sort((a, b) => {
    const va = a[sortField], vb = b[sortField];
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const statusBadge = { Completed: 'v-badge-success', Pending: 'v-badge-warning', Processing: 'v-badge-info', Cancelled: 'v-badge-danger' };

  el.innerHTML = data.map(o => `
    <div class="v-table-row">
      <div class="v-table-row-header">
        <div style="flex:1"><div class="fw-600">${o.id}</div></div>
        <div class="fw-700" style="font-size:15px;">${formatCurrency(o.amount)}</div>
      </div>
      <div class="v-table-row-body">
        <div class="v-table-field"><span class="v-table-field-label">${lang === 'fa' ? 'مشتری' : 'Customer'}</span><span class="v-table-field-value">${o.customer}</span></div>
        <div class="v-table-field"><span class="v-table-field-label">${lang === 'fa' ? 'محصول' : 'Product'}</span><span class="v-table-field-value">${o.product}</span></div>
        <div class="v-table-field"><span class="v-table-field-label">${lang === 'fa' ? 'وضعیت' : 'Status'}</span><span class="v-badge ${statusBadge[o.status]} v-badge-dot">${o.status}</span></div>
        <div class="v-table-field"><span class="v-table-field-label">${lang === 'fa' ? 'تاریخ' : 'Date'}</span><span class="v-table-field-value">${formatDateShort(o.date)}</span></div>
      </div>
      <div class="v-table-row-action">
        <button class="v-btn v-btn-sm v-btn-outline"><i class="bi bi-pencil"></i> ${lang === 'fa' ? 'ویرایش' : 'Edit'}</button>
        <button class="v-btn v-btn-sm v-btn-ghost" style="color:var(--v-danger);"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('') || `<div class="empty-state"><i class="bi bi-inbox"></i><h3>${lang === 'fa' ? 'داده‌ای یافت نشد' : 'No orders found'}</h3></div>`;
}

window.searchOrders = (q) => { search = q; renderTable(); };
window.sortOrders = (field) => {
  if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  else { sortField = field; sortDir = 'desc'; }
  renderTable();
};
window.exportCSV = () => {
  showToast(getState().language === 'fa' ? 'خروجی CSV دانلود شد' : 'CSV exported', 'success');
};
