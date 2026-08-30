import { storage } from './services/storage';
import { showToast } from './services/toast';

const state = {
  user: null, isAuthenticated: false,
  theme: storage.get('theme') || 'dark',
  language: storage.get('language') || 'en',
  sidebarOpen: false, currentRoute: '',
};

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function setState(patch) { Object.assign(state, patch); listeners.forEach(fn => fn(state)); }
export function getState() { return state; }

const routes = {};
function route(path, handler) { routes[path] = handler; }
export function navigate(path) { window.location.hash = path; }

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const parts = hash.split('/').filter(Boolean);
  const path = '/' + (parts[0] || 'dashboard');
  const params = parts.slice(1);
  state.currentRoute = path;
  setState({ currentRoute: path, sidebarOpen: false });

  const app = document.getElementById('app');
  if (!state.isAuthenticated && !['/login','/register'].includes(path)) { navigate('/login'); return; }
  if (['/login','/register'].includes(path)) { routes[path]?.(app, params); return; }
  renderShell(app, path, params);
}

function renderShell(container, activeRoute, params) {
  const lang = state.language;
  const isTablet = window.innerWidth >= 768;
  const isActive = (r) => activeRoute === r ? 'active' : '';
  const t = (en, fa) => lang === 'fa' ? fa : en;

  container.innerHTML = `
    <div class="sidebar ${state.sidebarOpen ? 'open' : ''}" id="sidebar">
      <div class="sidebar-brand">Trade<span>Finex</span></div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${t('Main','اصلی')}</div>
        <div class="sidebar-link ${isActive('/dashboard')}" onclick="navigate('/dashboard')"><i class="bi bi-grid-1x2"></i>${t('Overview','نمای کلی')}</div>
        <div class="sidebar-link ${isActive('/markets')}" onclick="navigate('/markets')"><i class="bi bi-currency-bitcoin"></i>${t('Markets','بازارها')}</div>
        <div class="sidebar-link ${isActive('/chart')}" onclick="navigate('/chart')"><i class="bi bi-bar-chart-line"></i>${t('Chart','نمودار')}</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${t('Analysis','تحلیل')}</div>
        <div class="sidebar-link ${isActive('/history')}" onclick="navigate('/history')"><i class="bi bi-clock-history"></i>${t('History','تاریخچه')}</div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-section-title">${t('Account','حساب کاربری')}</div>
        <div class="sidebar-link ${isActive('/settings')}" onclick="navigate('/settings')"><i class="bi bi-gear"></i>${t('Settings','تنظیمات')}</div>
        <div class="sidebar-link" onclick="logout()"><i class="bi bi-box-arrow-left"></i>${t('Logout','خروج')}</div>
      </div>
    </div>
    <div class="drawer-overlay ${state.sidebarOpen ? 'visible' : ''}" id="drawerOverlay" onclick="closeSidebar()"></div>
    <div class="app-content ${isTablet ? 'app-with-sidebar' : ''}">
      <div id="page-content"></div>
    </div>
    ${!isTablet ? `
    <nav class="bottom-nav">
      <button class="nav-item ${isActive('/dashboard')}" onclick="navigate('/dashboard')"><i class="bi bi-grid-1x2"></i><span>${t('Home','خانه')}</span></button>
      <button class="nav-item ${isActive('/markets')}" onclick="navigate('/markets')"><i class="bi bi-currency-bitcoin"></i><span>${t('Markets','بازار')}</span></button>
      <button class="nav-item ${isActive('/chart')}" onclick="navigate('/chart')"><i class="bi bi-bar-chart-line"></i><span>${t('Chart','نمودار')}</span></button>
      <button class="nav-item ${isActive('/history')}" onclick="navigate('/history')"><i class="bi bi-clock-history"></i><span>${t('History','تاریخچه')}</span></button>
      <button class="nav-item ${isActive('/settings')}" onclick="navigate('/settings')"><i class="bi bi-gear"></i><span>${t('More','بیشتر')}</span></button>
    </nav>` : ''}
  `;

  const pageEl = document.getElementById('page-content');
  if (pageEl && routes[activeRoute]) routes[activeRoute](pageEl, params);
  else if (pageEl) pageEl.innerHTML = `<div class="page-container"><div class="empty-state"><i class="bi bi-exclamation-circle"></i><h3>Page not found</h3></div></div>`;
}

export function applyTheme(theme) {
  if (theme === 'system') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  storage.set('theme', theme);
  setState({ theme });
}

export function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  storage.set('language', lang);
  setState({ language: lang });
}

window.navigate = navigate;
window.closeSidebar = () => { setState({ sidebarOpen: false }); document.getElementById('drawerOverlay')?.classList.remove('visible'); };
window.openSidebar = () => { setState({ sidebarOpen: true }); document.getElementById('sidebar')?.classList.add('open'); document.getElementById('drawerOverlay')?.classList.add('visible'); };

function logout() {
  storage.remove('auth_token'); storage.remove('user');
  setState({ user: null, isAuthenticated: false });
  navigate('/login');
  showToast(state.language === 'fa' ? 'خارج شدید' : 'Logged out', 'success');
}
window.logout = logout;

export function login(email, password) {
  if (email && password) {
    const user = { id:1, name:'Alex Morgan', email, role:'Admin', avatar:null };
    storage.set('auth_token', 'mock_' + Date.now());
    storage.set('user', JSON.stringify(user));
    setState({ user, isAuthenticated: true });
    return { success: true, user };
  }
  return { success: false, error: 'Invalid credentials' };
}

// Register routes
import { loginPage, registerPage } from './pages/auth';
import { dashboardPage } from './pages/dashboard';
import { marketsPage } from './pages/markets';
import { chartPage } from './pages/chart';
import { historyPage } from './pages/history';
import { settingsPage } from './pages/settings';

route('/login', loginPage);
route('/register', registerPage);
route('/dashboard', dashboardPage);
route('/markets', marketsPage);
route('/chart', chartPage);
route('/history', historyPage);
route('/settings', settingsPage);

export function initApp() {
  const token = storage.get('auth_token');
  const userStr = storage.get('user');
  if (token && userStr) { try { setState({ user: JSON.parse(userStr), isAuthenticated: true }); } catch {} }
  applyTheme(state.theme);
  applyLanguage(state.language);
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { document.getElementById('sidebar')?.classList.add('open'); document.getElementById('drawerOverlay')?.classList.remove('visible'); }
  });
}

export { route, state as appState };
