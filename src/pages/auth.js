import { login, applyLanguage, getState } from '../app';
import { showToast } from '../services/toast';

function lang(en, fa) { return getState().language === 'fa' ? fa : en; }

export function loginPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="d-flex justify-content-end mb-3">
        <button class="v-btn v-btn-sm v-btn-outline" onclick="toggleLang()"><i class="bi bi-translate"></i> ${getState().language === 'fa' ? 'EN' : 'فارسی'}</button>
      </div>
      <div class="auth-card">
        <div class="auth-logo"><h1>Trade<span>Finex</span></h1><p>${lang('AI-Powered Market Research','تحقیقات بازار با هوش مصنوعی')}</p></div>
        <form onsubmit="handleLogin(event)">
          <div class="v-input-group"><label class="v-label">Email</label><input type="email" class="v-input" id="loginEmail" value="admin@tradefinex.com" required /></div>
          <div class="v-input-group"><label class="v-label">${lang('Password','رمز عبور')}</label><input type="password" class="v-input" id="loginPassword" value="password" required /></div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <label class="v-checkbox"><input type="checkbox" checked /> ${lang('Remember me','مرا به خاطر بسپار')}</label>
            <a href="#/login" style="font-size:13px;">${lang('Forgot Password?','فراموشی رمز؟')}</a>
          </div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang('Sign In','ورود')}</button>
        </form>
        <div class="auth-footer">${lang("Don't have an account?", 'حساب ندارید؟')} <a href="#/register">${lang('Sign Up','ثبت نام')}</a></div>
      </div>
    </div>`;
}

window.handleLogin = (e) => {
  e.preventDefault();
  const r = login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
  if (r.success) { showToast(lang('Welcome!','خوش آمدید!'), 'success'); window.location.hash = '/dashboard'; }
  else showToast(lang('Invalid credentials','نامعتبر'), 'error');
};

export function registerPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo"><h1>Trade<span>Finex</span></h1><p>${lang('Create account','ساخت حساب')}</p></div>
        <form onsubmit="e.preventDefault(); showToast('${lang('Account created!','حساب ساخته شد!')}','success'); location.hash='/login';">
          <div class="v-input-group"><label class="v-label">${lang('Full Name','نام کامل')}</label><input class="v-input" required /></div>
          <div class="v-input-group"><label class="v-label">Email</label><input type="email" class="v-input" required /></div>
          <div class="v-input-group"><label class="v-label">${lang('Password','رمز عبور')}</label><input type="password" class="v-input" required /></div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang('Create Account','ساخت حساب')}</button>
        </form>
        <div class="auth-footer">${lang('Already have an account?','حساب دارید؟')} <a href="#/login">${lang('Sign In','ورود')}</a></div>
      </div>
    </div>`;
}

window.toggleLang = () => { applyLanguage(getState().language === 'en' ? 'fa' : 'en'); window.dispatchEvent(new HashChangeEvent('hashchange')); };
