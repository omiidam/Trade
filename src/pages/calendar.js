import { getState } from '../app.js';
import { calendarEvents } from '../services/mockData.js';
import { showToast } from '../services/toast.js';

let currentDate = new Date();
let events = [...calendarEvents];
let selectedDate = null;

export function calendarPage(container) {
  const lang = getState().language;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'تقویم' : 'Calendar'}</div>
      <button class="topbar-action" onclick="openEventModal()"><i class="bi bi-plus-lg"></i></button>
    </div>
    <div class="page-container">
      <div class="page-header">
        <h1>${lang === 'fa' ? 'تقویم' : 'Calendar'}</h1>
      </div>
      <div class="v-card mb-20">
        <div class="d-flex justify-between items-center mb-16">
          <button class="v-btn v-btn-sm v-btn-ghost" onclick="calendarNav(-1)"><i class="bi bi-chevron-left"></i></button>
          <h3 id="calendarTitle" style="font-size:16px;font-weight:600;"></h3>
          <button class="v-btn v-btn-sm v-btn-ghost" onclick="calendarNav(1)"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div id="calendarGrid" class="calendar-grid"></div>
      </div>
      <div id="dayEvents" class="v-card" style="display:none;">
        <div class="v-card-header">
          <div class="v-card-title" id="dayEventsTitle"></div>
        </div>
        <div id="dayEventsList"></div>
      </div>
    </div>
    <div id="eventModalRoot"></div>`;

  renderCalendar();
}

function renderCalendar() {
  const lang = getState().language;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = lang === 'fa' ? ['ش','ی','د','س','چ','پ','ج'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const title = document.getElementById('calendarTitle');
  if (title) title.textContent = `${monthNames[month]} ${year}`;

  const grid = document.getElementById('calendarGrid');
  if (!grid) return;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();

  let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month">${daysInPrev - i}</div>`;
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSelected = selectedDate === dateStr;
    const hasEvent = events.some(e => e.date === dateStr);
    const classes = ['calendar-day'];
    if (isToday) classes.push('today');
    if (isSelected) classes.push('selected');
    if (hasEvent) classes.push('has-event');
    html += `<div class="${classes.join(' ')}" onclick="selectDate('${dateStr}')">${d}</div>`;
  }

  // Next month padding
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="calendar-day other-month">${i}</div>`;
  }

  grid.innerHTML = html;
}

window.calendarNav = (dir) => {
  currentDate.setMonth(currentDate.getMonth() + dir);
  renderCalendar();
};

window.selectDate = (dateStr) => {
  selectedDate = dateStr;
  renderCalendar();
  showDayEvents(dateStr);
};

function showDayEvents(dateStr) {
  const lang = getState().language;
  const dayEvents = events.filter(e => e.date === dateStr);
  const container = document.getElementById('dayEvents');
  const titleEl = document.getElementById('dayEventsTitle');
  const listEl = document.getElementById('dayEventsList');
  if (!container || !titleEl || !listEl) return;

  container.style.display = 'block';
  const d = new Date(dateStr + 'T00:00:00');
  titleEl.textContent = d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (dayEvents.length === 0) {
    listEl.innerHTML = `<div class="empty-state" style="padding:24px;"><p style="font-size:13px;color:var(--v-text-muted);">${lang === 'fa' ? 'رویدادی ثبت نشده' : 'No events for this day'}</p></div>`;
  } else {
    listEl.innerHTML = dayEvents.map(e => `
      <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--v-border-light);align-items:flex-start;">
        <div style="width:4px;height:40px;border-radius:4px;background:${e.color};flex-shrink:0;margin-top:2px;"></div>
        <div style="flex:1;">
          <div class="fw-600" style="font-size:14px;">${e.title}</div>
          <div style="font-size:12px;color:var(--v-text-muted);">${e.time} • ${e.description}</div>
        </div>
        <button class="v-btn v-btn-sm v-btn-ghost" style="color:var(--v-danger);" onclick="deleteEvent(${e.id})"><i class="bi bi-trash3"></i></button>
      </div>
    `).join('');
  }
}

window.openEventModal = () => {
  const lang = getState().language;
  const root = document.getElementById('eventModalRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="v-modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="v-modal">
        <div class="v-modal-header">
          <div class="v-modal-title">${lang === 'fa' ? 'رویداد جدید' : 'New Event'}</div>
          <button class="v-modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="v-modal-body">
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'عنوان' : 'Title'}</label>
            <input type="text" class="v-input" id="eventTitle" placeholder="${lang === 'fa' ? 'عنوان رویداد' : 'Event title'}" />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'تاریخ' : 'Date'}</label>
            <input type="date" class="v-input" id="eventDate" value="${selectedDate || new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'زمان' : 'Time'}</label>
            <input type="time" class="v-input" id="eventTime" value="09:00" />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'توضیحات' : 'Description'}</label>
            <textarea class="v-input" id="eventDesc" placeholder="${lang === 'fa' ? 'توضیحات رویداد' : 'Event description'}"></textarea>
          </div>
        </div>
        <div class="v-modal-footer">
          <button class="v-btn v-btn-outline" onclick="closeModal()">${lang === 'fa' ? 'لغو' : 'Cancel'}</button>
          <button class="v-btn v-btn-primary" onclick="saveEvent()">${lang === 'fa' ? 'ذخیره' : 'Save Event'}</button>
        </div>
      </div>
    </div>`;
};

window.closeModal = () => {
  const root = document.getElementById('eventModalRoot');
  if (root) root.innerHTML = '';
};

window.saveEvent = () => {
  const title = document.getElementById('eventTitle')?.value;
  const date = document.getElementById('eventDate')?.value;
  const time = document.getElementById('eventTime')?.value;
  const desc = document.getElementById('eventDesc')?.value;
  if (!title || !date) { showToast(getState().language === 'fa' ? 'عنوان و تاریخ الزامی است' : 'Title and date are required', 'warning'); return; }
  events.push({ id: Date.now(), title, date, time: time || '09:00', color: '#556ee6', description: desc || '' });
  closeModal();
  showToast(getState().language === 'fa' ? 'رویداد ذخیره شد' : 'Event saved', 'success');
  renderCalendar();
  if (selectedDate) showDayEvents(selectedDate);
};

window.deleteEvent = (id) => {
  events = events.filter(e => e.id !== id);
  showToast(getState().language === 'fa' ? 'رویداد حذف شد' : 'Event deleted', 'success');
  renderCalendar();
  if (selectedDate) showDayEvents(selectedDate);
};
