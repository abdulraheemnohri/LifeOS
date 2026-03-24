let currentSection = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('lifeos_token');
    if (token) {
        showMainApp();
    }

    // Check for updates every hour
    setInterval(checkUpdate, 3600000);
    checkUpdate();
});

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const serverIp = document.getElementById('server-ip').value || 'http://localhost:3000';

    try {
        const data = await API.login(username, password, serverIp);
        if (data.token) {
            localStorage.setItem('lifeos_token', data.token);
            localStorage.setItem('lifeos_user', JSON.stringify(data.user));
            localStorage.setItem('lifeos_server_url', serverIp);
            showMainApp();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (e) {
        console.error(e);
        alert('Server not found or connection error');
    }
}

function showMainApp() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    Sync.initAutoSync();
    showSection('dashboard');
}

function logout() {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    localStorage.removeItem('lifeos_last_sync_time');
    location.reload();
}

function showSection(section) {
    currentSection = section;
    renderCurrentSection();
}

function renderCurrentSection() {
    const area = document.getElementById('content-area');
    switch (currentSection) {
        case 'dashboard': area.innerHTML = DashboardComponent.render(); break;
        case 'income': area.innerHTML = IncomeComponent.render(); break;
        case 'bills': area.innerHTML = BillsComponent.render(); break;
        case 'loans': area.innerHTML = LoansComponent.render(); break;
        case 'notes': area.innerHTML = NotesComponent.render(); break;
        case 'experience': area.innerHTML = ExperienceComponent.render(); break;
        case 'profile': area.innerHTML = ProfileComponent.render(); break;
        case 'settings': area.innerHTML = SettingsComponent.render(); break;
    }
}

async function checkUpdate() {
    const update = await API.checkUpdate();
    if (update) {
        document.getElementById('update-version').innerText = `Version: ${update.version}`;
        document.getElementById('update-message').innerText = update.message;
        document.getElementById('update-modal').style.display = 'flex';
        document.getElementById('update-btn').onclick = () => {
            window.location.href = update.download_url || '#';
        };
    }
}

function closeUpdateModal() {
    document.getElementById('update-modal').style.display = 'none';
}
