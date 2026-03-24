const SettingsComponent = {
    render: () => {
        const syncFreq = localStorage.getItem('lifeos_sync_freq') || '30000';
        const serverUrl = localStorage.getItem('lifeos_server_url') || '';
        const user = JSON.parse(localStorage.getItem('lifeos_user')) || {};

        const isLocal = localStorage.getItem('lifeos_mode') === 'local';

        return `
            <div class="glass-card">
                <h1>⚙️ App Settings</h1>

                ${isLocal ? `
                <div class="card">
                    <h3>Switch to Cloud Mode</h3>
                    <p>Current: Local Mode (Offline Only)</p>
                    <button onclick="showServerView()" style="background:var(--primary)">Connect to Cloud</button>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Security (Local)</h3>
                    <p>Change your offline access password.</p>
                    <input type="password" id="new-local-pass" placeholder="New Local Password">
                    <button onclick="SettingsComponent.saveLocalPass()">Update Local Password</button>
                </div>
                ` : ''}

                <div class="card" style="margin-top: 2rem;">
                    <h3>Display Settings</h3>
                    <p>Primary Currency</p>
                    <select id="setting-currency">
                        <option value="USD" ${localStorage.getItem('lifeos_currency') === 'USD' ? 'selected' : ''}>USD ($)</option>
                        <option value="PKR" ${localStorage.getItem('lifeos_currency') === 'PKR' ? 'selected' : ''}>PKR (Rs.)</option>
                        <option value="EUR" ${localStorage.getItem('lifeos_currency') === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                        <option value="GBP" ${localStorage.getItem('lifeos_currency') === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                    </select>
                    <button onclick="SettingsComponent.saveCurrency()">Save Currency Preference</button>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Sync Settings</h3>
                    <p>Current Sync Frequency: ${syncFreq / 1000}s</p>
                    <select id="setting-sync-freq">
                        <option value="15000" ${syncFreq === '15000' ? 'selected' : ''}>15s (Aggressive)</option>
                        <option value="30000" ${syncFreq === '30000' ? 'selected' : ''}>30s (Default)</option>
                        <option value="60000" ${syncFreq === '60000' ? 'selected' : ''}>1m (Economy)</option>
                    </select>
                    <button onclick="SettingsComponent.saveSyncFreq()">Save Sync Frequency</button>
                    <button onclick="Sync.performSync()" style="background:var(--accent)">Trigger Manual Sync</button>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Storage Management</h3>
                    <p>Local Cache Usage: ~${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</p>
                    <button onclick="SettingsComponent.clearLocalCache()" style="background:var(--danger)">Clear Local Cache (Except Auth)</button>
                    <p style="color:var(--danger); font-size: 0.8rem;">* This will not delete data from the server.</p>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Connection Settings</h3>
                    <p>Server URL: ${serverUrl}</p>
                    <input type="text" id="setting-server-url" value="${serverUrl}">
                    <button onclick="SettingsComponent.saveServerUrl()">Update Server URL</button>
                </div>
            </div>
        `;
    },
    saveCurrency: () => {
        const val = document.getElementById('setting-currency').value;
        localStorage.setItem('lifeos_currency', val);
        alert('Currency preference saved.');
        renderCurrentSection();
    },
    saveLocalPass: () => {
        const val = document.getElementById('new-local-pass').value;
        if (!val) return alert('Please enter a password');
        localStorage.setItem('lifeos_local_password', val);
        alert('Local password updated.');
    },
    saveSyncFreq: () => {
        const val = document.getElementById('setting-sync-freq').value;
        localStorage.setItem('lifeos_sync_freq', val);
        alert('Sync frequency updated. Restarting sync...');
        Sync.initAutoSync();
        renderCurrentSection();
    },
    saveServerUrl: () => {
        const val = document.getElementById('setting-server-url').value;
        localStorage.setItem('lifeos_server_url', val);
        alert('Server URL updated. Log in again to apply.');
        logout();
    },
    clearLocalCache: () => {
        if (!confirm('Clear all local data? This will re-pull everything from the server.')) return;
        const tables = ['income', 'bills', 'loans', 'notes', 'experience'];
        tables.forEach(t => localStorage.removeItem(`lifeos_${t}`));
        localStorage.removeItem('lifeos_last_sync_time');
        alert('Cache cleared.');
        location.reload();
    }
};
