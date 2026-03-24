let currentSection = 'dashboard';

let appMode = localStorage.getItem('lifeos_mode') || 'cloud'; // 'cloud' or 'local'

document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for automatic updates
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New update available, user notified via checkUpdate UI
                            console.log('New content is available; please refresh.');
                        }
                    }
                };
            };
        });
    }

    const serverIp = localStorage.getItem('lifeos_server_url');
    const token = localStorage.getItem('lifeos_token');
    const isLocal = localStorage.getItem('lifeos_mode') === 'local';

    if (isLocal && token) {
        showMainApp();
    } else if (!isLocal && serverIp && token) {
        showMainApp();
    } else {
        showModeView();
    }

    // Check for updates every hour
    setInterval(checkUpdate, 3600000);
    // checkUpdate(); // Disable auto-check on load for verification ease
});

function showLoading(show) {
    document.getElementById('loading-spinner').style.display = show ? 'flex' : 'none';
}

function showModeView() {
    document.getElementById('mode-view').style.display = 'block';
    document.getElementById('server-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'none';
}

function showServerView() {
    appMode = 'cloud';
    localStorage.setItem('lifeos_mode', 'cloud');
    document.getElementById('mode-view').style.display = 'none';
    document.getElementById('server-view').style.display = 'block';
    document.getElementById('login-view').style.display = 'none';
}

function useLocally() {
    appMode = 'local';
    localStorage.setItem('lifeos_mode', 'local');
    // Ensure local password exists
    if (!localStorage.getItem('lifeos_local_password')) {
        localStorage.setItem('lifeos_local_password', 'lifeos');
    }
    showLoginView();
}

function showLoginView() {
    document.getElementById('mode-view').style.display = 'none';
    document.getElementById('server-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'block';

    const cloudFields = document.getElementById('cloud-login-fields');
    const title = document.getElementById('login-title');
    const desc = document.getElementById('login-desc');

    if (appMode === 'cloud') {
        cloudFields.style.display = 'block';
        title.innerText = 'Cloud Login';
        desc.innerText = 'Login to your enterprise account';
    } else {
        cloudFields.style.display = 'none';
        title.innerText = 'Local Access';
        desc.innerText = 'Enter your offline password (default: lifeos)';
    }
}

function connectServer() {
    const serverIp = document.getElementById('server-ip').value;
    if (!serverIp) return alert('Please enter server address');

    showLoading(true);
    // Simulate connection check
    setTimeout(() => {
        localStorage.setItem('lifeos_server_url', serverIp);
        showLoading(false);
        showLoginView();
    }, 1000);
}

function handleLogin() {
    if (appMode === 'cloud') {
        login();
    } else {
        loginLocally();
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const serverIp = localStorage.getItem('lifeos_server_url');

    showLoading(true);
    try {
        const data = await API.login(username, password, serverIp);
        showLoading(false);
        if (data.token) {
            if (rememberMe) {
                localStorage.setItem('lifeos_token', data.token);
                localStorage.setItem('lifeos_user', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('lifeos_token', data.token);
                localStorage.setItem('lifeos_user', JSON.stringify(data.user));
            }
            showMainApp();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (e) {
        showLoading(false);
        console.error(e);
        alert('Server not found or connection error');
    }
}

function loginLocally() {
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const localPass = localStorage.getItem('lifeos_local_password') || 'lifeos';

    if (password === localPass) {
        const token = 'local-session-' + Date.now();
        const user = { username: 'Local User', role: 'user', isLocal: true };

        if (rememberMe) {
            localStorage.setItem('lifeos_token', token);
            localStorage.setItem('lifeos_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('lifeos_token', token);
            localStorage.setItem('lifeos_user', JSON.stringify(user));
        }
        showMainApp();
    } else {
        alert('Incorrect local password');
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
    sessionStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    localStorage.removeItem('lifeos_last_sync_time');

    // Keep server URL and mode for convenience, but clear if requested in settings
    location.reload();
}

function showSection(section) {
    currentSection = section;

    // Update active state in bottom nav
    document.querySelectorAll('.mobile-bottom-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`nav-${section}`);
    if (activeBtn) activeBtn.classList.add('active');

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
        document.getElementById('update-version').innerText = `New Version: ${update.version}`;
        document.getElementById('update-message').innerText = update.message;
        document.getElementById('update-modal').style.display = 'flex';

        const btn = document.getElementById('update-btn');
        btn.innerText = "Install & Refresh";
        btn.onclick = () => {
            showLoading(true);
            // If service worker is supported, tell it to skip waiting
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage('skipWaiting');
            }

            // In a real PWA/Update scenario, we refresh the page to load new assets
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
        };
    }
}

function closeUpdateModal() {
    document.getElementById('update-modal').style.display = 'none';
}
