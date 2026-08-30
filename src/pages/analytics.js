import { getState } from '../app.js';
import ApexCharts from 'apexcharts';

let charts = [];
function destroyCharts() { charts.forEach(c => { try { c.destroy(); } catch {} }); charts = []; }

export function analyticsPage(container) {
  destroyCharts();
  const lang = getState().language;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'آنالیتیکس' : 'Analytics'}</div>
      <button class="topbar-action"><i class="bi bi-download"></i></button>
    </div>
    <div class="page-container">
      <div class="page-header">
        <h1>${lang === 'fa' ? 'تحلیل و آمار' : 'Analytics Overview'}</h1>
        <p>${lang === 'fa' ? 'آمار بازدید و تعامل کاربران' : 'Traffic and engagement statistics'}</p>
      </div>

      <div class="grid-2 mb-20">
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(85,110,230,0.1);color:#556ee6;"><i class="bi bi-eye"></i></div>
          <div class="stat-card-value">48,520</div>
          <div class="stat-card-label">${lang === 'fa' ? 'بازدید صفحه' : 'Page Views'}</div>
          <div class="stat-card-change up"><i class="bi bi-arrow-up"></i> 24.5%</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(52,195,143,0.1);color:#34c38f;"><i class="bi bi-person-check"></i></div>
          <div class="stat-card-value">12,840</div>
          <div class="stat-card-label">${lang === 'fa' ? 'بازدیدکنندگان یکتا' : 'Unique Visitors'}</div>
          <div class="stat-card-change up"><i class="bi bi-arrow-up"></i> 18.2%</div>
        </div>
      </div>

      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'ترافیک سایت' : 'Website Traffic'}</div></div>
        <div id="analyticsLineChart" class="chart-container"></div>
      </div>

      <div class="grid-2 mb-20">
        <div class="v-card">
          <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'صفحات برتر' : 'Top Pages'}</div></div>
          ${[
            { page: '/dashboard', views: 8420, pct: 45 },
            { page: '/analytics', views: 6230, pct: 33 },
            { page: '/users', views: 4180, pct: 22 },
            { page: '/settings', views: 2950, pct: 16 },
          ].map(p => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--v-border-light);">
              <span style="font-size:13px;font-weight:500;">${p.page}</span>
              <span style="font-size:12px;color:var(--v-text-muted);">${p.views.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
        <div class="v-card">
          <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'مرورگرها' : 'Browsers'}</div></div>
          <div id="browserChart" class="chart-container" style="min-height:180px;"></div>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const isDark = getState().theme === 'dark';
    const tc = isDark ? '#a0aec0' : '#6c757d';
    const gc = isDark ? '#252838' : '#f1f3f6';

    const lineEl = document.getElementById('analyticsLineChart');
    if (lineEl) {
      const chart = new ApexCharts(lineEl, {
        chart: { type: 'area', height: 280, toolbar: { show: false }, background: 'transparent' },
        series: [{ name: 'Visitors', data: [1200,1800,1500,2100,1900,2400,2200,2800,2600,3100,2900,3400] }],
        colors: ['#556ee6'],
        stroke: { width: 2, curve: 'smooth' },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.05 } },
        xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], labels: { style: { colors: tc, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: tc, fontSize: '11px' } } },
        grid: { borderColor: gc, strokeDashArray: 4 },
        tooltip: { theme: isDark ? 'dark' : 'light' },
        dataLabels: { enabled: false },
      });
      chart.render();
      charts.push(chart);
    }

    const browserEl = document.getElementById('browserChart');
    if (browserEl) {
      const chart = new ApexCharts(browserEl, {
        chart: { type: 'donut', height: 180, background: 'transparent' },
        series: [52, 28, 12, 8],
        labels: ['Chrome', 'Safari', 'Firefox', 'Other'],
        colors: ['#556ee6', '#34c38f', '#f1b44c', '#74788d'],
        plotOptions: { pie: { donut: { size: '60%' } } },
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: tc }, markers: { radius: 8 } },
        stroke: { width: 0 },
        dataLabels: { enabled: false },
      });
      chart.render();
      charts.push(chart);
    }
  });
}
