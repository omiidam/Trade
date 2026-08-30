// ─── Toast Notification Service ─────────────────────────────
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = {
    success: 'bi-check-circle-fill',
    error: 'bi-exclamation-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    info: 'bi-info-circle-fill',
  };
  const colorMap = {
    success: 'var(--v-success)',
    error: 'var(--v-danger)',
    warning: 'var(--v-warning)',
    info: 'var(--v-info)',
  };

  const toast = document.createElement('div');
  toast.className = 'v-toast';
  toast.innerHTML = `
    <i class="bi ${iconMap[type] || iconMap.info} v-toast-icon" style="color:${colorMap[type] || colorMap.info}"></i>
    <span class="v-toast-message">${message}</span>
    <button class="v-toast-close" onclick="this.closest('.v-toast').remove()"><i class="bi bi-x"></i></button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
