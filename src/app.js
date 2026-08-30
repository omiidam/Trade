// ═══════════════════════════════════════════════════════════════
// VELTRIX DASHBOARD — Core Application
// SPA Router, State Management, App Shell
// ═══════════════════════════════════════════════════════════════

import { storage } from './services/storage.js';
import { showToast } from './services/toast.js';

// ─── State ─────────────────────────────────────────────────
const state = {
  user: null,
  isAuthenticated: false,
  theme: storage.get('theme') || 'light',
  language: storage.get('language') || 'en',
  sidebarOpen: false,
  currentRoute: '',
};

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setState(patch) { Object.assign(state, patch); listeners.forEach(fn => fn(state)); }
export function getState() { return state; }

// ─── Router ────────────────────────────────────────────────
const routes = {};
function route(path, handler) { routes[path] = handler; }

export function navigate(path) {
  window.location.hash = path;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const parts = hash.split('/').filter(Boolean);
  const path = '/' + (parts[0] || 'dashboard');
  const params = parts.slice(1);

  state.currentRoute = path;
  setState({ currentRoute: path, sidebarOpen: false });

  const app = document.getElementById('app');
  const isAuthenticated = state.isAuthenticated;

  // Auth guard
  if (!isAuthenticated && path !== '/login' && path !== '/register' && path !== '/forgot-password') {
    navigate('/login');
    return;
  }

  // Auth pages — no shell
  if (path === '/login' || path === '/register' || path === '/forgot-password') {
    if (routes[path]) routes[path](app, params);
    return;
  }

  // Main app shell
  renderShell(app, path, params);
}

function renderShell(container, activeRoute, params) {
  const lang = state.language;
  const isTablet = window.innerWidth >= 768;
  const isActive = (r) => activeRoute === r ? 'active' : '';

  container.innerHTML = `
    <div class="sidebar ${state.sidebarOpen ? 'open' : ''}" id="sidebar">
      <div class="sidebar-brand">Veltri<span>x</span></div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${lang === 'fa' ? 'اصلی' : 'Main'}</div>
        <div class="sidebar-link ${isActive('/dashboard')}" onclick="window.location.hash='/dashboard'"><i class="bi bi-grid-1x2"></i>${lang === 'fa' ? 'داشبورد' : 'Dashboard'}</div>
        <div class="sidebar-link ${isActive('/analytics')}" onclick="window.location.hash='/analytics'"><i class="bi bi-bar-chart-line"></i>${lang === 'fa' ? 'آنالیتیکس' : 'Analytics'}</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${lang === 'fa' ? 'برنامه‌ها' : 'Applications'}</div>
        <div class="sidebar-link ${isActive('/calendar')}" onclick="window.location.hash='/calendar'"><i class="bi bi-calendar3"></i>${lang === 'fa' ? 'تقویم' : 'Calendar'}</div>
        <div class="sidebar-link ${isActive('/users')}" onclick="window.location.hash='/users'"><i class="bi bi-people"></i>${lang === 'fa' ? 'کاربران' : 'Users'}</div>
        <div class="sidebar-link ${isActive('/notifications')}" onclick="window.location.hash='/notifications'"><i class="bi bi-bell"></i>${lang === 'fa' ? 'اعلان‌ها' : 'Notifications'}</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${lang === 'fa' ? 'اجزاء' : 'Components'}</div>
        <div class="sidebar-link ${isActive('/forms')}" onclick="window.location.hash='/forms'"><i class="bi bi-pencil-square"></i>${lang === 'fa' ? 'فرم‌ها' : 'Forms'}</div>
        <div class="sidebar-link ${isActive('/tables')}" onclick="window.location.hash='/tables'"><i class="bi bi-table"></i>${lang === 'fa' ? 'جدول‌ها' : 'Tables'}</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${lang === 'fa' ? 'حساب کاربری' : 'Account'}</div>
        <div class="sidebar-link ${isActive('/profile')}" onclick="window.location.hash='/profile'"><i class="bi bi-person-circle"></i>${lang === 'fa' ? 'پروفایل' : 'Profile'}</div>
        <div class="sidebar-link ${isActive('/settings')}" onclick="window.location.hash='/settings'"><i class="bi bi-gear"></i>${lang === 'fa' ? 'تنظیمات' : 'Settings'}</div>
        <div class="sidebar-link" onclick="logout()"><i class="bi bi-box-arrow-left"></i>${lang === 'fa' ? 'خروج' : 'Logout'}</div>
      </div>
    </div>
    <div class="drawer-overlay ${state.sidebarOpen ? 'visible' : ''}" id="drawerOverlay" onclick="closeSidebar()"></div>

    <div class="app-content ${isTablet ? 'app-with-sidebar' : ''}">
      <div id="page-content"></div>
    </div>

    ${!isTablet ? `
    <nav class="bottom-nav">
      <button class="nav-item ${isActive('/dashboard')}" onclick="navigate('/dashboard')"><i class="bi bi-grid-1x2"></i><span>${lang === 'fa' ? 'خانه' : 'Home'}</span></button>
      <button class="nav-item ${isActive('/analytics')}" onclick="navigate('/analytics')"><i class="bi bi-bar-chart-line"></i><span>${lang === 'fa' ? 'تحلیل' : 'Analytics'}</span></button>
      <button class="nav-item ${isActive('/calendar')}" onclick="navigate('/calendar')"><i class="bi bi-calendar3"></i><span>${lang === 'fa' ? 'تقویم' : 'Calendar'}</span></button>
      <button class="nav-item ${isActive('/users')}" onclick="navigate('/users')"><i class="bi bi-people"></i><span>${lang === 'fa' ? 'کاربران' : 'Users'}</span></button>
      <button class="nav-item ${isActive('/settings')}" onclick="navigate('/settings')"><i class="bi bi-three-dots"></i><span>${lang === 'fa' ? 'بیشتر' : 'More'}</span></button>
    </nav>` : ''}
  `;

  // Render the active page into #page-content
  const pageEl = document.getElementById('page-content');
  if (pageEl && routes[activeRoute]) {
    routes[activeRoute](pageEl, params);
  } else if (pageEl) {
    pageEl.innerHTML = `<div class="page-container"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><h3>Page not found</h3><p>This page doesn't exist yet.</p></div></div>`;
  }
}

// ─── Theme ─────────────────────────────────────────────────
export function applyTheme(theme) {
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  storage.set('theme', theme);
  setState({ theme });
}

// ─── Language/RTL ──────────────────────────────────────────
export function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  storage.set('language', lang);
  setState({ language: lang });
}

// ─── Global helpers ────────────────────────────────────────
window.navigate = navigate;
window.closeSidebar = () => {
  setState({ sidebarOpen: false });
  const overlay = document.getElementById('drawerOverlay');
  if (overlay) overlay.classList.remove('visible');
};
window.openSidebar = () => {
  setState({ sidebarOpen: true });
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.add('open');
  const overlay = document.getElementById('drawerOverlay');
  if (overlay) overlay.classList.add('visible');
};

function logout() {
  storage.remove('auth_token');
  storage.remove('user');
  setState({ user: null, isAuthenticated: false });
  navigate('/login');
  showToast(state.language === 'fa' ? 'با موفقیت خارج شدید' : 'Logged out successfully', 'success');
}
window.logout = logout;

// ─── Auth ──────────────────────────────────────────────────
export function login(email, password) {
  // Mock authentication
  if (email && password) {
    const user = {
      id: 1,
      name: 'Alex Morgan',
      email,
      role: 'Administrator',
      avatar: null,
      phone: '+1 (555) 123-4567',
      status: 'Active',
      joinedDate: '2024-01-15',
    };
    storage.set('auth_token', 'mock_token_' + Date.now());
    storage.set('user', JSON.stringify(user));
    setState({ user, isAuthenticated: true });
    return { success: true, user };
  }
  return { success: false, error: 'Invalid credentials' };
}

// ─── Register routes ───────────────────────────────────────
import { loginPage, registerPage, forgotPasswordPage } from './pages/auth.js';
import { dashboardPage } from './pages/dashboard.js';
import { analyticsPage } from './pages/analytics.js';
import { calendarPage } from './pages/calendar.js';
import { usersPage } from './pages/users.js';
import { formsPage } from './pages/forms.js';
import { tablesPage } from './pages/tables.js';
import { notificationsPage } from './pages/notifications.js';
import { profilePage } from './pages/profile.js';
import { settingsPage } from './pages/settings.js';

route('/login', loginPage);
route('/register', registerPage);
route('/forgot-password', forgotPasswordPage);
route('/dashboard', dashboardPage);
route('/analytics', analyticsPage);
route('/calendar', calendarPage);
route('/users', usersPage);
route('/forms', formsPage);
route('/tables', tablesPage);
route('/notifications', notificationsPage);
route('/profile', profilePage);
route('/settings', settingsPage);

// ─── Init ──────────────────────────────────────────────────
export function initApp() {
  // Restore auth state
  const token = storage.get('auth_token');
  const userStr = storage.get('user');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      setState({ user, isAuthenticated: true });
    } catch { /* ignore */ }
  }

  // Apply theme + language
  applyTheme(state.theme);
  applyLanguage(state.language);

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Handle back button
  window.addEventListener('popstate', handleRoute);

  // Responsive sidebar
  window.addEventListener('resize', () => {
    const isTablet = window.innerWidth >= 768;
    if (isTablet) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.add('open');
      const overlay = document.getElementById('drawerOverlay');
      if (overlay) overlay.classList.remove('visible');
    }
  });
}

export { route, state as appState };
