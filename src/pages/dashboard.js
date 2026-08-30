import { getState } from '../app.js';
import { dashboardData, formatCurrency, formatNumber, formatDateShort, orders } from '../services/mockData.js';
import ApexCharts from 'apexcharts';

let charts = [];

function destroyCharts() {
  charts.forEach(c => { try { c.destroy(); } catch {} });
  charts = [];
}

export function dashboardPage(container) {
  destroyCharts();
  const lang = getState().language;
  const d = dashboardData;
  const user = getState().user;
  const greeting = getGreeting(lang);

  container.innerHTML = `
    <div class="page-container">
      <div class="topbar" style="position:sticky;top:0;margin:-16px -16px 0;padding:12px 16px;">
        <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
        <div class="topbar-title">Veltrix</div>
        <button class="topbar-action" onclick="navigate('/notifications')">
          <i class="bi bi-bell"></i>
          <span class="topbar-badge"></span>
        </button>
        <div class="v-avatar v-avatar-sm" style="background:#556ee6;cursor:pointer;" onclick="navigate('/profile')">
          <span>${(user?.name || 'A').charAt(0)}</span>
        </div>
      </div>

      <div class="greeting mt-16">
        <h1>${greeting}, ${(user?.name || 'Admin').split(' ')[0]}!</h1>
        <p>${lang === 'fa' ? 'در اینجا خلاصه فعالیت‌ها را مشاهده می‌کنید' : "Here's what's happening with your business today."}</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid-2 mb-20">
        ${kpiCard(d.kpis.revenue, 'bi-currency-dollar', '#556ee6', 'rgba(85,110,230,0.1)')}
        ${kpiCard(d.kpis.orders, 'bi-cart3', '#34c38f', 'rgba(52,195,143,0.1)')}
        ${kpiCard(d.kpis.customers, 'bi-people', '#f1b44c', 'rgba(241,180,76,0.1)')}
        ${kpiCard(d.kpis.conversion, 'bi-graph-up-arrow', '#f46a6a', 'rgba(244,106,106,0.1)')}
      </div>

      <!-- Revenue Chart -->
      <div class="v-card mb-20">
        <div class="v-card-header">
          <div>
            <div class="v-card-title">${lang === 'fa' ? 'درآمد' : 'Revenue Overview'}</div>
            <div class="v-card-subtitle">${lang === 'fa' ? 'مقایسه درآمد، هزینه و سود' : 'Revenue vs Expenses vs Profit'}</div>
          </div>
          <div class="d-flex gap-8">
            ${['7D','30D','3M','1Y'].map((p,i) => `<button class="v-btn v-btn-sm ${i===1?'v-btn-primary':'v-btn-ghost'}" onclick="switchRevenuePeriod('${p}')">${p}</button>`).join('')}
          </div>
        </div>
        <div id="revenueChart" class="chart-container"></div>
      </div>

      <!-- Sales + Traffic row -->
      <div class="grid-2 mb-20">
        <div class="v-card">
          <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'فروش هفتگی' : 'Weekly Sales'}</div></div>
          <div id="salesChart" class="chart-container" style="min-height:200px;"></div>
        </div>
        <div class="v-card">
          <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'منابع ترافیک' : 'Traffic Sources'}</div></div>
          <div id="trafficChart" class="chart-container" style="min-height:200px;"></div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="v-card mb-20">
        <div class="v-card-header">
          <div class="v-card-title">${lang === 'fa' ? 'فعالیت اخیر' : 'Recent Activity'}</div>
        </div>
        ${d.recentActivity.map(a => `
          <div class="activity-item">
            <div class="activity-dot" style="background:${a.color}"></div>
            <div style="flex:1">
              <div class="activity-text"><strong>${a.user}</strong> ${a.action}</div>
              <div class="activity-time">${a.time}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Recent Orders -->
      <div class="v-card">
        <div class="v-card-header">
          <div class="v-card-title">${lang === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}</div>
          <button class="v-btn v-btn-sm v-btn-ghost" onclick="navigate('/tables')">${lang === 'fa' ? 'مشاهده همه' : 'View All'}</button>
        </div>
        <div class="v-table-card">
          ${orders.slice(0, 5).map(o => orderCard(o, lang)).join('')}
        </div>
      </div>
    </div>`;

  // Render charts after DOM is ready
  requestAnimationFrame(() => renderDashboardCharts(d));
}

function kpiCard(kpi, icon, color, bg) {
  const isPositive = kpi.change >= 0;
  const prefix = kpi.prefix || '';
  const suffix = kpi.suffix || '';
  const displayValue = typeof kpi.value === 'number' && kpi.value > 999
    ? formatNumber(Math.round(kpi.value))
    : (kpi.value % 1 !== 0 ? kpi.value.toFixed(2) : formatNumber(kpi.value));

  return `
    <div class="stat-card">
      <div class="stat-card-icon" style="background:${bg};color:${color};">
        <i class="bi ${icon}"></i>
      </div>
      <div class="stat-card-value">${prefix}${displayValue}${suffix}</div>
      <div class="stat-card-label">${kpi.label}</div>
      <div class="stat-card-change ${isPositive ? 'up' : 'down'}">
        <i class="bi bi-arrow-${isPositive ? 'up' : 'down'}"></i>
        ${Math.abs(kpi.change)}% ${isPositive ? '↑' : '↓'}
      </div>
    </div>`;
}

function orderCard(o, lang) {
  const statusBadge = {
    Completed: 'v-badge-success',
    Pending: 'v-badge-warning',
    Processing: 'v-badge-info',
    Cancelled: 'v-badge-danger',
  }[o.status] || 'v-badge-primary';
  return `
    <div class="v-table-row">
      <div class="v-table-row-header">
        <div style="flex:1">
          <div class="fw-600" style="font-size:14px;">${o.id}</div>
          <div style="font-size:12px;color:var(--v-text-muted);">${o.customer}</div>
        </div>
        <div class="fw-700" style="font-size:15px;">${formatCurrency(o.amount)}</div>
      </div>
      <div class="v-table-row-body">
        <div class="v-table-field">
          <span class="v-table-field-label">${lang === 'fa' ? 'محصول' : 'Product'}</span>
          <span class="v-table-field-value">${o.product}</span>
        </div>
        <div class="v-table-field">
          <span class="v-table-field-label">${lang === 'fa' ? 'وضعیت' : 'Status'}</span>
          <span class="v-badge ${statusBadge} v-badge-dot">${o.status}</span>
        </div>
      </div>
    </div>`;
}

function getGreeting(lang) {
  const h = new Date().getHours();
  if (lang === 'fa') return h < 12 ? 'صبح بخیر' : h < 18 ? 'عصر بخیر' : 'شب بخیر';
  return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening';
}

window.switchRevenuePeriod = (period) => {
  // Re-render with filtered data (mock — all periods show same data)
  const lang = getState().language;
  const buttons = document.querySelectorAll('.v-card-header .v-btn');
  buttons.forEach(b => {
    b.className = b.textContent.trim() === period ? 'v-btn v-btn-sm v-btn-primary' : 'v-btn v-btn-sm v-btn-ghost';
  });
};

function renderDashboardCharts(d) {
  const isDark = getState().theme === 'dark' || (getState().theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const textColor = isDark ? '#a0aec0' : '#6c757d';
  const gridColor = isDark ? '#252838' : '#f1f3f6';

  // Revenue chart
  const revenueEl = document.getElementById('revenueChart');
  if (revenueEl) {
    const chart = new ApexCharts(revenueEl, {
      chart: { type: 'area', height: 280, toolbar: { show: false }, background: 'transparent' },
      series: [
        { name: 'Revenue', data: d.revenueChart.revenue },
        { name: 'Expenses', data: d.revenueChart.expenses },
        { name: 'Profit', data: d.revenueChart.profit },
      ],
      colors: ['#556ee6', '#f46a6a', '#34c38f'],
      stroke: { width: 2, curve: 'smooth' },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
      xaxis: { categories: d.revenueChart.labels, labels: { style: { colors: textColor, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: textColor, fontSize: '11px' }, formatter: (v) => '$' + (v/1000).toFixed(0) + 'k' } },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      legend: { position: 'top', fontSize: '11px', labels: { colors: textColor }, markers: { radius: 12 } },
      tooltip: { theme: isDark ? 'dark' : 'light' },
      dataLabels: { enabled: false },
    });
    chart.render();
    charts.push(chart);
  }

  // Sales chart
  const salesEl = document.getElementById('salesChart');
  if (salesEl) {
    const chart = new ApexCharts(salesEl, {
      chart: { type: 'bar', height: 200, toolbar: { show: false }, background: 'transparent' },
      series: [{ name: 'Sales', data: d.salesChart.values }],
      colors: ['#556ee6'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '60%', distributed: true } },
      xaxis: { categories: d.salesChart.labels, labels: { style: { colors: textColor, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: textColor, fontSize: '11px' } } },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      legend: { show: false },
      tooltip: { theme: isDark ? 'dark' : 'light' },
      dataLabels: { enabled: false },
    });
    chart.render();
    charts.push(chart);
  }

  // Traffic donut
  const trafficEl = document.getElementById('trafficChart');
  if (trafficEl) {
    const chart = new ApexCharts(trafficEl, {
      chart: { type: 'donut', height: 200, background: 'transparent' },
      series: d.trafficSources.map(s => s.value),
      labels: d.trafficSources.map(s => s.label),
      colors: d.trafficSources.map(s => s.color),
      plotOptions: { pie: { donut: { size: '65%' }, expandOnClick: false } },
      legend: { position: 'bottom', fontSize: '11px', labels: { colors: textColor }, markers: { radius: 8 } },
      tooltip: { theme: isDark ? 'dark' : 'light' },
      stroke: { width: 0 },
      dataLabels: { enabled: false },
    });
    chart.render();
    charts.push(chart);
  }
}
