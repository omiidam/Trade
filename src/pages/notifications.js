import { getState } from '../app';
import { notifications as mockNotifs } from '../services/mockData';
import { showToast } from '../services/toast';

let notifs = [...mockNotifs];

export function notificationsPage(container) {
  const lang = getState().language;
  const unread = notifs.filter(n => !n.read).length;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="history.back()"><i class="bi bi-arrow-left"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'اعلان‌ها' : 'Notifications'}</div>
      ${unread > 0 ? `<button class="v-btn v-btn-sm v-btn-ghost" onclick="markAllRead()">${lang === 'fa' ? 'خواندن همه' : 'Mark All Read'}</button>` : ''}
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${lang === 'fa' ? 'مرکز اعلان‌ها' : 'Notification Center'}</h1><p>${unread > 0 ? `${unread} ${lang === 'fa' ? 'خوانده نشده' : 'unread'}` : (lang === 'fa' ? 'همه خوانده شده' : 'All caught up!')}</p></div>
      <div id="notifList"></div>
    </div>`;

  renderNotifs();
}

function renderNotifs() {
  const lang = getState().language;
  const el = document.getElementById('notifList');
  if (!el) return;

  const iconMap = { order: 'bi-cart3', payment: 'bi-credit-card', user: 'bi-person-plus', alert: 'bi-exclamation-triangle', system: 'bi-gear', comment: 'bi-chat-dots' };
  const colorMap = { order: '#556ee6', payment: '#34c38f', user: '#50a5f1', alert: '#f46a6a', system: '#74788d', comment: '#f1b44c' };

  el.innerHTML = notifs.map(n => `
    <div style="display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--v-border-light);${n.read ? 'opacity:0.6;' : ''}">
      <div class="v-avatar v-avatar-sm" style="background:${colorMap[n.type] || '#74788d'}"><i class="bi ${iconMap[n.type] || 'bi-bell'}" style="font-size:14px;"></i></div>
      <div style="flex:1;">
        <div class="fw-600" style="font-size:14px;">${n.title}</div>
        <div style="font-size:12px;color:var(--v-text-secondary);margin-top:2px;">${n.message}</div>
        <div style="font-size:11px;color:var(--v-text-muted);margin-top:4px;">${n.time}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        ${!n.read ? `<button class="v-btn v-btn-sm v-btn-ghost" onclick="markRead(${n.id})" title="Mark read"><i class="bi bi-check-lg"></i></button>` : ''}
        <button class="v-btn v-btn-sm v-btn-ghost" style="color:var(--v-danger);" onclick="deleteNotif(${n.id})" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('') || `<div class="empty-state"><i class="bi bi-bell-slash"></i><h3>${lang === 'fa' ? 'اعلانی نیست' : 'No notifications'}</h3></div>`;
}

window.markRead = (id) => { notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n); renderNotifs(); };
window.markAllRead = () => { notifs = notifs.map(n => ({ ...n, read: true })); renderNotifs(); showToast(getState().language === 'fa' ? 'همه خوانده شد' : 'All marked as read', 'success'); };
window.deleteNotif = (id) => { notifs = notifs.filter(n => n.id !== id); renderNotifs(); };
