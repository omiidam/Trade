import { getState } from '../app';
import { users as mockUsers } from '../services/mockData';
import { showToast } from '../services/toast';

let userList = [...mockUsers];
let searchQuery = '';
let filterRole = '';

export function usersPage(container) {
  const lang = getState().language;

  container.innerHTML = `
    <div class="topbar">
      <button class="topbar-back" onclick="openSidebar()"><i class="bi bi-list"></i></button>
      <div class="topbar-title">${lang === 'fa' ? 'کاربران' : 'Users'}</div>
      <button class="topbar-action" onclick="openUserModal()"><i class="bi bi-plus-lg"></i></button>
    </div>
    <div class="page-container">
      <div class="page-header">
        <h1>${lang === 'fa' ? 'مدیریت کاربران' : 'User Management'}</h1>
        <p>${lang === 'fa' ? `${userList.length} کاربر ثبت شده` : `${userList.length} registered users`}</p>
      </div>
      <div class="d-flex gap-8 mb-16" style="flex-wrap:wrap;">
        <input type="text" class="v-input" style="flex:1;min-width:160px;" placeholder="${lang === 'fa' ? 'جستجو...' : 'Search users...'}" oninput="filterUsers(this.value)" />
        <select class="v-input" style="width:140px;" onchange="filterUsersByRole(this.value)">
          <option value="">${lang === 'fa' ? 'همه نقش‌ها' : 'All Roles'}</option>
          <option value="Administrator">${lang === 'fa' ? 'مدیر' : 'Admin'}</option>
          <option value="Manager">${lang === 'fa' ? 'مدیر پروژه' : 'Manager'}</option>
          <option value="Editor">${lang === 'fa' ? 'ویرایشگر' : 'Editor'}</option>
          <option value="User">${lang === 'fa' ? 'کاربر' : 'User'}</option>
        </select>
      </div>
      <div id="usersList" class="v-table-card"></div>
    </div>
    <div id="userModalRoot"></div>`;

  renderUsers();
}

function renderUsers() {
  const lang = getState().language;
  const list = document.getElementById('usersList');
  if (!list) return;

  let filtered = userList;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (filterRole) filtered = filtered.filter(u => u.role === filterRole);

  const roleBadge = { Administrator: 'v-badge-primary', Manager: 'v-badge-info', Editor: 'v-badge-warning', User: 'v-badge-success' };
  const statusBadge = { Active: 'v-badge-success', Inactive: 'v-badge-warning', Suspended: 'v-badge-danger' };

  list.innerHTML = filtered.map(u => `
    <div class="v-table-row">
      <div class="v-table-row-header">
        <div class="v-avatar v-avatar-sm" style="background:${u.avatar}">${u.name.charAt(0)}</div>
        <div style="flex:1;">
          <div class="fw-600" style="font-size:14px;">${u.name}</div>
          <div style="font-size:12px;color:var(--v-text-muted);">${u.email}</div>
        </div>
        <span class="v-badge ${statusBadge[u.status] || 'v-badge-primary'} v-badge-dot">${u.status}</span>
      </div>
      <div class="v-table-row-body">
        <div class="v-table-field">
          <span class="v-table-field-label">${lang === 'fa' ? 'نقش' : 'Role'}</span>
          <span class="v-badge ${roleBadge[u.role] || 'v-badge-primary'}">${u.role}</span>
        </div>
        <div class="v-table-field">
          <span class="v-table-field-label">${lang === 'fa' ? 'تاریخ عضویت' : 'Joined'}</span>
          <span class="v-table-field-value">${u.joinedDate}</span>
        </div>
      </div>
      <div class="v-table-row-action">
        <button class="v-btn v-btn-sm v-btn-outline" onclick="editUser(${u.id})"><i class="bi bi-pencil"></i> ${lang === 'fa' ? 'ویرایش' : 'Edit'}</button>
        <button class="v-btn v-btn-sm v-btn-ghost" style="color:var(--v-danger);" onclick="deleteUser(${u.id})"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  `).join('') || `<div class="empty-state"><i class="bi bi-people"></i><h3>${lang === 'fa' ? 'کاربری یافت نشد' : 'No users found'}</h3></div>`;
}

window.filterUsers = (q) => { searchQuery = q; renderUsers(); };
window.filterUsersByRole = (role) => { filterRole = role; renderUsers(); };

window.openUserModal = (user = null) => {
  const lang = getState().language;
  const isEdit = !!user;
  const root = document.getElementById('userModalRoot');
  root.innerHTML = `
    <div class="v-modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="v-modal">
        <div class="v-modal-header">
          <div class="v-modal-title">${isEdit ? (lang === 'fa' ? 'ویرایش کاربر' : 'Edit User') : (lang === 'fa' ? 'کاربر جدید' : 'New User')}</div>
          <button class="v-modal-close" onclick="closeModal()"><i class="bi bi-x-lg"></i></button>
        </div>
        <div class="v-modal-body">
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'نام' : 'Name'}</label><input class="v-input" id="uName" value="${user?.name || ''}" /></div>
          <div class="v-input-group"><label class="v-label">Email</label><input class="v-input" id="uEmail" type="email" value="${user?.email || ''}" /></div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'نقش' : 'Role'}</label>
            <select class="v-input" id="uRole">
              <option value="Administrator" ${user?.role==='Administrator'?'selected':''}>Administrator</option>
              <option value="Manager" ${user?.role==='Manager'?'selected':''}>Manager</option>
              <option value="Editor" ${user?.role==='Editor'?'selected':''}>Editor</option>
              <option value="User" ${user?.role==='User'?'selected':''}>User</option>
            </select>
          </div>
          <div class="v-input-group"><label class="v-label">${lang === 'fa' ? 'وضعیت' : 'Status'}</label>
            <select class="v-input" id="uStatus">
              <option value="Active" ${user?.status==='Active'?'selected':''}>Active</option>
              <option value="Inactive" ${user?.status==='Inactive'?'selected':''}>Inactive</option>
              <option value="Suspended" ${user?.status==='Suspended'?'selected':''}>Suspended</option>
            </select>
          </div>
        </div>
        <div class="v-modal-footer">
          <button class="v-btn v-btn-outline" onclick="closeModal()">${lang === 'fa' ? 'لغو' : 'Cancel'}</button>
          <button class="v-btn v-btn-primary" onclick="saveUser(${user?.id || 'null'})">${lang === 'fa' ? 'ذخیره' : 'Save'}</button>
        </div>
      </div>
    </div>`;
};

window.editUser = (id) => {
  const user = userList.find(u => u.id === id);
  if (user) openUserModal(user);
};

window.saveUser = (id) => {
  const lang = getState().language;
  const name = document.getElementById('uName')?.value;
  const email = document.getElementById('uEmail')?.value;
  const role = document.getElementById('uRole')?.value;
  const status = document.getElementById('uStatus')?.value;
  if (!name || !email) { showToast(lang === 'fa' ? 'نام و ایمیل الزامی است' : 'Name and email are required', 'warning'); return; }
  if (id) {
    const idx = userList.findIndex(u => u.id === id);
    if (idx >= 0) userList[idx] = { ...userList[idx], name, email, role, status };
  } else {
    userList.push({ id: Date.now(), name, email, role, status, phone: '', joinedDate: new Date().toISOString().split('T')[0], avatar: '#556ee6' });
  }
  closeModal();
  showToast(lang === 'fa' ? 'کاربر ذخیره شد' : 'User saved', 'success');
  renderUsers();
};

window.deleteUser = (id) => {
  const lang = getState().language;
  userList = userList.filter(u => u.id !== id);
  showToast(lang === 'fa' ? 'کاربر حذف شد' : 'User deleted', 'success');
  renderUsers();
};
