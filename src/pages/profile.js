import { getState } from '../app';
import { showToast } from '../services/toast';

export function profilePage(container) {
  const lang = getState().language;
  const user = getState().user || {};

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="history.back()"><i class="bi bi-arrow-left"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'پروفایل' : 'Profile'}</div>
    </div>
    <div class="page-container">
      <div class="v-card mb-20" style="text-align:center;padding:28px 20px;">
        <div class="v-avatar v-avatar-lg" style="margin:0 auto 12px;background:${user.avatar || '#556ee6'};">
          <span>${(user.name || 'A').charAt(0)}</span>
        </div>
        <h2 style="font-size:18px;font-weight:700;">${user.name || 'Alex Morgan'}</h2>
        <p style="font-size:13px;color:var(--v-text-muted);">${user.email || 'admin@veltrix.com'}</p>
        <span class="v-badge v-badge-primary mt-8">${user.role || 'Administrator'}</span>
      </div>

      <div class="v-card mb-20">
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'نام' : 'Name'}</div></div><div style="font-size:13px;color:var(--v-text-secondary);">${user.name || 'Alex Morgan'}</div></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-label">Email</div></div><div style="font-size:13px;color:var(--v-text-secondary);">${user.email || 'admin@veltrix.com'}</div></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'تلفن' : 'Phone'}</div></div><div style="font-size:13px;color:var(--v-text-secondary);">${user.phone || '+1 (555) 123-4567'}</div></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'وضعیت' : 'Status'}</div></div><span class="v-badge v-badge-success v-badge-dot">${user.status || 'Active'}</span></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'تاریخ عضویت' : 'Joined'}</div></div><div style="font-size:13px;color:var(--v-text-secondary);">${user.joinedDate || '2024-01-15'}</div></div>
      </div>

      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'فعالیت اخیر' : 'Recent Activity'}</div></div>
        ${[
          { action: lang === 'fa' ? 'پروفایل را به‌روزرسانی کرد' : 'Updated profile picture', time: '2 hours ago' },
          { action: lang === 'fa' ? 'گذرواژه را تغییر داد' : 'Changed password', time: '1 day ago' },
          { action: lang === 'fa' ? 'وارد حساب شد' : 'Signed in from new device', time: '3 days ago' },
        ].map(a => `
          <div class="activity-item">
            <div class="activity-dot" style="background:var(--v-primary)"></div>
            <div style="flex:1"><div class="activity-text">${a.action}</div><div class="activity-time">${a.time}</div></div>
          </div>
        `).join('')}
      </div>

      <button class="v-btn v-btn-outline v-btn-block" onclick="navigate('/settings')"><i class="bi bi-gear"></i> ${lang === 'fa' ? 'تنظیمات حساب' : 'Account Settings'}</button>
    </div>`;
}
