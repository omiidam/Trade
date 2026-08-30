import { getState, applyTheme, applyLanguage, setState } from '../app';
import { storage } from '../services/storage';
import { testLLMConnection } from '../services/llm/llmService';
import { showToast } from '../services/toast';

export function settingsPage(container) {
  const lang = getState().language;
  const t = (en, fa) => lang === 'fa' ? fa : en;
  const currentTheme = getState().theme;
  const llm = getState().llm || { baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', model: 'openai/gpt-4o-mini', temperature: 0.3, maxTokens: 4096 };

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${t('Settings','تنظیمات')}</div>
    </div>
    <div class="page-container">
      <div class="page-header"><h1>${t('Settings','تنظیمات')}</h1></div>

      <!-- LLM Configuration -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-robot" style="margin-right:8px;color:var(--v-primary);"></i>${t('LLM API','تنظیمات هوش مصنوعی')}</div></div>
        <div class="d-flex gap-8 mb-16" style="flex-wrap:wrap;">
          ${[
            { name:'OpenRouter', url:'https://openrouter.ai/api/v1', model:'openai/gpt-4o-mini' },
            { name:'OpenAI', url:'https://api.openai.com/v1', model:'gpt-4o-mini' },
            { name:'Anthropic', url:'https://api.anthropic.com/v1', model:'claude-sonnet-4-20250514' },
            { name:'Local', url:'http://localhost:11434/v1', model:'llama3' },
          ].map(p => `
            <button class="v-btn v-btn-sm ${llm.baseUrl === p.url ? 'v-btn-primary' : 'v-btn-outline'}" onclick="setLLMPreset('${p.url}','${p.model}')">${p.name}</button>
          `).join('')}
        </div>
        <div class="v-input-group"><label class="v-label">API Base URL</label><input class="v-input" id="llmUrl" value="${llm.baseUrl}" /></div>
        <div class="v-input-group"><label class="v-label">API Key</label><input class="v-input" id="llmKey" type="password" value="${llm.apiKey}" placeholder="sk-..." /></div>
        <div class="v-input-group"><label class="v-label">${t('Model','مدل')}</label><input class="v-input" id="llmModel" value="${llm.model}" /></div>
        <div class="v-input-group">
          <label class="v-label">${t('Temperature','دمپریچر')}: <span id="tempVal">${llm.temperature}</span></label>
          <input type="range" min="0" max="2" step="0.1" value="${llm.temperature}" class="v-input" style="padding:4px;" oninput="document.getElementById('tempVal').textContent=this.value" id="llmTemp" />
        </div>
        <div class="v-input-group"><label class="v-label">Max Tokens</label><input type="number" class="v-input" id="llmMaxTokens" value="${llm.maxTokens}" /></div>
        <button class="v-btn v-btn-outline v-btn-block" id="testBtn" onclick="testLLM()"><i class="bi bi-lightning"></i> ${t('Test Connection','تست اتصال')}</button>
        <div id="testResult" style="margin-top:8px;font-size:12px;"></div>
      </div>

      <!-- Appearance -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-palette" style="margin-right:8px;color:var(--v-primary);"></i>${t('Appearance','ظاهر')}</div></div>
        <div class="d-flex gap-8" style="flex-wrap:wrap;">
          ${['light','dark','system'].map(t2 => `
            <button class="v-btn v-btn-sm ${currentTheme === t2 ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeTheme('${t2}')">
              <i class="bi bi-${t2 === 'light' ? 'sun' : t2 === 'dark' ? 'moon-stars' : 'circle-half'}"></i>
              ${t2 === 'light' ? 'Light' : t2 === 'dark' ? 'Dark' : 'System'}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Language -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-translate" style="margin-right:8px;color:var(--v-primary);"></i>${t('Language','زبان')}</div></div>
        <div class="d-flex gap-8">
          <button class="v-btn v-btn-sm ${lang === 'en' ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeLang('en')">🇺🇸 English</button>
          <button class="v-btn v-btn-sm ${lang === 'fa' ? 'v-btn-primary' : 'v-btn-outline'}" onclick="changeLang('fa')">🇮🇷 فارسی</button>
        </div>
      </div>

      <!-- Data -->
      <div class="v-card mb-20">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-database" style="margin-right:8px;color:var(--v-primary);"></i>${t('Data','داده‌ها')}</div></div>
        <button class="v-btn v-btn-outline v-btn-block mb-8" onclick="clearCache()"><i class="bi bi-trash3"></i> ${t('Clear Cache','پاک کردن کش')}</button>
        <button class="v-btn v-btn-outline v-btn-block" style="color:var(--v-danger);border-color:var(--v-danger);" onclick="clearAllData()"><i class="bi bi-trash3"></i> ${t('Clear All Data','پاک کردن همه داده‌ها')}</button>
      </div>

      <!-- About -->
      <div class="v-card">
        <div class="v-card-header"><div class="v-card-title"><i class="bi bi-info-circle" style="margin-right:8px;color:var(--v-primary);"></i>${t('About','درباره')}</div></div>
        <div style="font-size:13px;color:var(--v-text-muted);">
          <p>TradeFinex v1.0.0</p>
          <p style="margin-top:4px;">${t('AI-powered market research and technical analysis','تحقیقات بازار و تحلیل تکنیکال با هوش مصنوعی')}</p>
          <p style="margin-top:8px;font-style:italic;font-size:11px;">${t('This is an analysis tool. Not financial advice.','این ابزار تحلیلی است. توصیه مالی نیست.')}</p>
        </div>
      </div>
    </div>`;
}

window.setLLMPreset = (url, model) => {
  setState({ llm: { ...getState().llm, baseUrl: url, model } });
  storage.setJSON('llm', getState().llm);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

window.changeTheme = (t) => { applyTheme(t); window.dispatchEvent(new HashChangeEvent('hashchange')); };
window.changeLang = (l) => { applyLanguage(l); window.dispatchEvent(new HashChangeEvent('hashchange')); };

window.testLLM = async () => {
  const btn = document.getElementById('testBtn');
  const result = document.getElementById('testResult');
  if (!btn || !result) return;
  (btn).disabled = true;
  result.textContent = 'Testing...';
  result.style.color = 'var(--v-text-muted)';

  const config = {
    baseUrl: (document.getElementById('llmUrl'))?.value || '',
    apiKey: (document.getElementById('llmKey'))?.value || '',
    model: (document.getElementById('llmModel'))?.value || '',
    temperature: parseFloat((document.getElementById('llmTemp'))?.value || '0.3'),
    maxTokens: parseInt((document.getElementById('llmMaxTokens'))?.value || '4096'),
  };

  const res = await testLLMConnection(config);
  result.textContent = res.message;
  result.style.color = res.success ? 'var(--v-success)' : 'var(--v-danger)';
  (btn).disabled = false;

  if (res.success) {
    setState({ llm: config });
    storage.setJSON('llm', config);
  }
};

window.clearCache = () => { localStorage.clear(); showToast(getState().language === 'fa' ? 'کش پاک شد' : 'Cache cleared', 'success'); };
window.clearAllData = () => {
  if (confirm(getState().language === 'fa' ? 'همه داده‌ها پاک شود؟' : 'Clear all data?')) {
    localStorage.clear();
    showToast(getState().language === 'fa' ? 'داده‌ها پاک شد' : 'All data cleared', 'success');
  }
};
