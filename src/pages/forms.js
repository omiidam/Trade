import { getState } from '../app';
import { showToast } from '../services/toast';

export function formsPage(container) {
  const lang = getState().language;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'فرم‌ها' : 'Forms'}</div>
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${lang === 'fa' ? 'فرم‌ها' : 'Forms'}</h1><p>${lang === 'fa' ? 'فرم‌های پایه و پیشرفته' : 'Basic and advanced form elements'}</p></div>

      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'فرم پایه' : 'Basic Form'}</div></div>
        <form onsubmit="handleBasicForm(event)">
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'نام کامل' : 'Full Name'}</label><input class="v-input" id="fName" placeholder="${lang === 'fa' ? 'نام خود را وارد کنید' : 'Enter your name'}" required /></div>
          <div class="v-input-group"><label class="v-label">Email</label><input class="v-input" id="fEmail" type="email" placeholder="email@example.com" required /></div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'تلفن' : 'Phone'}</label><input class="v-input" type="tel" placeholder="+1 (555) 000-0000" /></div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'رمز عبور' : 'Password'}</label><input class="v-input" type="password" placeholder="${lang === 'fa' ? 'حداقل ۸ کاراکتر' : 'Min 8 characters'}" /></div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block">${lang === 'fa' ? 'ارسال' : 'Submit'}</button>
        </form>
      </div>

      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title">${lang === 'fa' ? 'فرم پیشرفته' : 'Advanced Form'}</div></div>
        <form onsubmit="handleAdvancedForm(event)">
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'دسته‌بندی' : 'Category'}</label>
            <select class="v-input"><option>Enterprise</option><option>Business</option><option>Personal</option></select>
          </div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'تاریخ شروع' : 'Start Date'}</label><input class="v-input" type="date" /></div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'زمان' : 'Time'}</label><input class="v-input" type="time" /></div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'توضیحات' : 'Description'}</label><textarea class="v-input" rows="3" placeholder="${lang === 'fa' ? 'توضیحات خود را بنویسید...' : 'Write your description...'}"></textarea></div>
          <div class="v-input-group">
            <label class="v-checkbox"><input type="checkbox" /> ${lang === 'fa' ? 'من شرایط استفاده را می‌پذیرم' : 'I agree to the terms and conditions'}</label>
          </div>
          <div class="v-input-group">
            <label class="v-checkbox"><input type="checkbox" checked /> ${lang === 'fa' ? 'دریافت خبرنامه' : 'Subscribe to newsletter'}</label>
          </div>
          <div class="mb-16" style="display:flex;gap:16px;">
            <label class="v-checkbox"><input type="radio" name="plan" value="free" checked /> Free</label>
            <label class="v-checkbox"><input type="radio" name="plan" value="pro" /> Pro</label>
            <label class="v-checkbox"><input type="radio" name="plan" value="enterprise" /> Enterprise</label>
          </div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'آپلود فایل' : 'File Upload'}</label><input class="v-input" type="file" /></div>
          <div style="margin-top:8px;" class="settings-row">
            <div class="settings-row-info"><div class="settings-row-label">${lang === 'fa' ? 'وضعیت فعال' : 'Enable Feature'}</div></div>
            <label class="v-switch"><input type="checkbox" checked /><span class="v-switch-slider"></span></label>
          </div>
          <button type="submit" class="v-btn v-btn-primary v-btn-block" style="margin-top:16px;">${lang === 'fa' ? 'ارسال پیشرفته' : 'Submit Advanced'}</button>
        </form>
      </div>
    </div>`;
}

window.handleBasicForm = (e) => {
  e.preventDefault();
  showToast(getState().language === 'fa' ? 'فرم پایه با موفقیت ارسال شد' : 'Basic form submitted!', 'success');
};

window.handleAdvancedForm = (e) => {
  e.preventDefault();
  showToast(getState().language === 'fa' ? 'فرم پیشرفته با موفقیت ارسال شد' : 'Advanced form submitted!', 'success');
};
