import { login, applyLanguage, getState } from '../app.js';
import { showToast } from '../services/toast.js';
import { storage } from '../services/storage.js';

function renderHeader() {
  const lang = getState().language;
  return `
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-sm btn-outline-secondary" onclick="toggleLang()">
        <i class="bi bi-translate"></i> ${lang === 'fa' ? 'EN' : 'فارسی'}
      </button>
    </div>`;
}

window.toggleLang = () => {
  const lang = getState().language;
  applyLanguage(lang === 'en' ? 'fa' : 'en');
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

export function loginPage(container) {
  const lang = getState().language;
  container.innerHTML = `
    <div class="auth-page">
      ${renderHeader()}
      <div class="auth-card">
        <div class="auth-logo">
          <h1>Veltri<span>x</span></h1>
          <p>${lang === 'fa' ? 'به پنل مدیریت خوش آمدید' : 'Sign in to your admin dashboard'}</p>
        </div>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'ایمیل' : 'Email Address'}</label>
            <input type="email" class="v-input" id="loginEmail" placeholder="${lang === 'fa' ? 'ایمیل خود را وارد کنید' : 'Enter your email'}" value="admin@veltrix.com" required />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'رمز عبور' : 'Password'}</label>
            <input type="password" class="v-input" id="loginPassword" placeholder="${lang === 'fa' ? 'رمز عبور خود را وارد کنید' : 'Enter your password'}" value="password" required />
          </div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <label class="v-checkbox"><input type="checkbox" checked /> ${lang === 'fa' ? 'مرا به خاطر بسپار' : 'Remember me'}</label>
            <a href="#/forgot-password" style="font-size:13px;">${lang === 'fa' ? 'فراموشی رمز عبور؟' : 'Forgot Password?'}</a>
          </div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang === 'fa' ? 'ورود' : 'Sign In'}</button>
        </form>
        <div class="auth-footer">
          ${lang === 'fa' ? 'حساب کاربری ندارید؟' : "Don't have an account?"}
          <a href="#/register">${lang === 'fa' ? 'ثبت نام کنید' : 'Sign Up'}</a>
        </div>
      </div>
    </div>`;
}

window.handleLogin = (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const result = login(email, password);
  if (result.success) {
    showToast(getState().language === 'fa' ? 'با موفقیت وارد شدید' : 'Welcome back!', 'success');
    window.location.hash = '/dashboard';
  } else {
    showToast(getState().language === 'fa' ? 'ایمیل یا رمز عبور اشتباه است' : 'Invalid email or password', 'error');
  }
};

export function registerPage(container) {
  const lang = getState().language;
  container.innerHTML = `
    <div class="auth-page">
      ${renderHeader()}
      <div class="auth-card">
        <div class="auth-logo">
          <h1>Veltri<span>x</span></h1>
          <p>${lang === 'fa' ? 'حساب کاربری جدید بسازید' : 'Create your account'}</p>
        </div>
        <form id="registerForm" onsubmit="handleRegister(event)">
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'نام کامل' : 'Full Name'}</label>
            <input type="text" class="v-input" placeholder="${lang === 'fa' ? 'نام کامل خود را وارد کنید' : 'Enter your full name'}" required />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'ایمیل' : 'Email Address'}</label>
            <input type="email" class="v-input" placeholder="${lang === 'fa' ? 'ایمیل خود را وارد کنید' : 'Enter your email'}" required />
          </div>
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'رمز عبور' : 'Password'}</label>
            <input type="password" class="v-input" placeholder="${lang === 'fa' ? 'حداقل ۸ کاراکتر' : 'Minimum 8 characters'}" required />
          </div>
          <div class="v-input-group">
            <label class="v-input-group">
              <label class="v-checkbox"><input type="checkbox" required /> ${lang === 'fa' ? 'شرایط استفاده را می‌پذیرم' : 'I agree to the Terms of Service'}</label>
            </label>
          </div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang === 'fa' ? 'ثبت نام' : 'Create Account'}</button>
        </form>
        <div class="auth-footer">
          ${lang === 'fa' ? 'قبلا ثبت نام کرده‌اید؟' : 'Already have an account?'}
          <a href="#/login">${lang === 'fa' ? 'ورود' : 'Sign In'}</a>
        </div>
      </div>
    </div>`;
}

window.handleRegister = (e) => {
  e.preventDefault();
  showToast(getState().language === 'fa' ? 'ثبت نام با موفقیت انجام شد' : 'Account created! Please sign in.', 'success');
  window.location.hash = '/login';
};

export function forgotPasswordPage(container) {
  const lang = getState().language;
  container.innerHTML = `
    <div class="auth-page">
      ${renderHeader()}
      <div class="auth-card">
        <div class="auth-logo">
          <h1>Veltri<span>x</span></h1>
          <p>${lang === 'fa' ? 'بازیابی رمز عبور' : 'Reset your password'}</p>
        </div>
        <form onsubmit="handleForgotPassword(event)">
          <div class="v-input-group">
            <label class="v-label">${lang === 'fa' ? 'ایمیل' : 'Email Address'}</label>
            <input type="email" class="v-input" placeholder="${lang === 'fa' ? 'ایمیل ثبت‌نام شده را وارد کنید' : 'Enter your registered email'}" required />
          </div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang === 'fa' ? 'ارسال لینک بازیابی' : 'Send Reset Link'}</button>
        </form>
        <div class="auth-footer">
          <a href="#/login"><i class="bi bi-arrow-left"></i> ${lang === 'fa' ? 'بازگشت به ورود' : 'Back to Login'}</a>
        </div>
      </div>
    </div>`;
}

window.handleForgotPassword = (e) => {
  e.preventDefault();
  showToast(getState().language === 'fa' ? 'لینک بازیابی ارسال شد' : 'Password reset link sent!', 'success');
  window.location.hash = '/login';
};
