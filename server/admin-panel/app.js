let token = localStorage.getItem('adminToken');
if (token) {
  showAdmin();
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok && data.user.role === 'admin') {
    token = data.token;
    localStorage.setItem('adminToken', token);
    showAdmin();
  } else {
    alert(data.message || 'Login failed or not an admin');
  }
}

function showAdmin() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'block';
  loadUsers();
}

function logout() {
  localStorage.removeItem('adminToken');
  location.reload();
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

async function loadUsers() {
  const res = await fetch('/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const users = await res.json();
  const list = document.getElementById('users-list');
  list.innerHTML = users.map(u => `
    <div class="user-item">
      <span>${u.username} (${u.role})</span>
      <button class="delete-btn" onclick="deleteUser(${u.id})">Delete</button>
    </div>
  `).join('');
}

async function createUser() {
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;

  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ username, password, role })
  });

  if (res.ok) {
    alert('User created');
    loadUsers();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure?')) return;
  const res = await fetch(`/api/admin/user/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) loadUsers();
}

async function checkUpdate() {
  const res = await fetch('/api/update/check', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  const info = document.getElementById('update-info');
  info.innerHTML = `
    <div style="padding:1rem; background:rgba(255,255,255,0.05); border-radius:8px; margin-bottom:1rem;">
      <p>Latest Version: ${data.version}</p>
      <p>Message: ${data.message}</p>
      <p>Type: ${data.type}</p>
    </div>
  `;
}

async function updateServer() {
  const res = await fetch('/api/update/server', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById('update-log').textContent = JSON.stringify(data, null, 2);
}

function saveSysSettings() {
  const name = document.getElementById('sys-name').value;
  const maint = document.getElementById('sys-maint').value;
  alert(`Settings Saved!\nName: ${name}\nMaintenance: ${maint}`);
  // In a real app, this would be a PUT /api/admin/settings
}
