import { getState, applyTheme, applyLanguage } from '../app.js';
import { showToast } from '../services/toast.js';

export function settingsPage(container) {
  const lang = getState().language;
  const currentTheme = getState().theme;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'تنظیمات' : 'Settings'}</div>
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${lang === 'fa' ? 'تنظیمات' : 'Settings'}</h1></div>

      <!-- Appearance -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-palette" style="margin-right:8px;color:var(--v-primary);"></i>${lang === 'fa' ? 'ظاهر' : 'Appearance'}</div></div>
        <div class="d-flex gap-8" style="flex-wrap:wrap;">
          ${['light','dark','system'].map(t => `
            <button class="v-btn v-btn-sm ${currentTheme === t ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeTheme('${t}')">
              <i class="bi bi-${t === 'light' ? 'sun' : t === 'dark' ? 'moon-stars' : 'circle-half'}"></i>
              ${t === 'light' ? (lang === 'fa' ? 'روشن' : 'Light') : t === 'dark' ? (lang === 'fa' ? 'تاریک' : 'Dark') : (lang === 'fa' ? 'سیستم' : 'System')}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Language -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-translate" style="margin-right:8px;color:var(--v-primary);"></i>${lang === 'fa' ? 'زبان' : 'Language'}</div></div>
        <div class="d-flex gap-8" style="flex-wrap:wrap;">
          <button class="v-btn v-btn-sm ${lang === 'en' ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeLang('en')">
            <span style="font-size:16px;">🇺🇸</span> English
          </button>
          <button class="v-btn v-btn-sm ${lang === 'fa' ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeLang('fa')">
            <span style="font-size:16px;">🇮🇷</span> فارسی
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-bell" style="margin-right:8px;color:var(--v-primary);"></i>${lang === 'fa' ? 'اعلان‌ها' : 'Notifications'}</div></div>
        <div class="settings-row">
          <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'اعلان‌های Push' : 'Push Notifications'}</div><div class="settings-row-desc">${lang === 'fa' ? 'دریافت اعلان روی دستگاه' : 'Receive push notifications'}</div></div>
          <label class="v-switch"><input type="checkbox" checked /><span class="v-switch-slider"></span></label>
        </div>
        <div class="settings-row">
          <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'اعلان ایمیلی' : 'Email Notifications'}</div><div class="settings-row-desc">${lang === 'fa' ? 'دریافت اعلان از طریق ایمیل' : 'Receive email notifications'}</div></div>
          <label class="v-switch"><input type="checkbox" checked /><span class="v-switch-slider"></span></label>
        </div>
        <div class="settings-row">
          <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'اعلان بازاریابی' : 'Marketing Notifications'}</div><div class="settings-row-desc">${lang === 'fa' ? 'دریافت پیشنهادات و تبلیغات' : 'Receive promotional offers'}</div></div>
          <label class="v-switch"><input type="checkbox" /><span class="v-switch-slider"></span></label>
        </div>
      </div>

      <!-- Security -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-shield-lock" style="margin-right:8px;color:var(--v-primary);"></i>${lang === 'fa' ? 'امنیت' : 'Security'}</div></div>
        <div class="settings-row">
          <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'تغییر گذرواژه' : 'Change Password'}</div><div class="settings-row-desc">${lang === 'fa' ? 'آخرین تغییر: ۳ روز پیش' : 'Last changed 3 days ago'}</div></div>
          <button class="v-btn v-btn-sm v-btn-outline" onclick="showToast('${lang === 'fa' ? 'قابلیت تغییر گذرواژه به‌زودی فعال می‌شود' : 'Password change coming soon'}','info')"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div class="settings-row">
          <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'احراز هویت دو مرحله‌ای' : 'Two-Factor Authentication'}</div><div class="settings-row-desc">${lang === 'fa' ? 'غیرفعال' : 'Disabled'}</div></div>
          <label class="v-switch"><input type="checkbox" /><span class="v-switch-slider"></span></label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="v-card" style="border-color:var(--v-danger);">
        <div class="v-card-header"><div class="v-card-title" style="color:var(--v-danger);"><i class="bi bi-exclamation-triangle" style="margin-right:8px;"></i>${lang === 'fa' ? 'منطقه خطر' : 'Danger Zone'}</div></div>
        <button class="v-btn v-btn-danger v-btn-sm v-btn-block" onclick="clearAppData()"><i class="bi bi-trash3"></i> ${lang === 'fa' ? 'پاک کردن تمام داده‌ها' : 'Clear All Data'}</button>
      </div>
    </div>`;
}

window.changeTheme = (t) => { applyTheme(t); window.dispatchEvent(new HashChangeEvent('hashchange')); };
window.changeLang = (l) => { applyLanguage(l); window.dispatchEvent(new HashChangeEvent('hashchange')); };
window.clearAppData = () => {
  const lang = getState().language;
  if (confirm(lang === 'fa' ? 'آیا مطمئن هستید؟' : 'Are you sure?')) {
    localStorage.clear();
    showToast(lang === 'fa' ? 'داده‌ها پاک شد' : 'All data cleared', 'success');
  }
};
