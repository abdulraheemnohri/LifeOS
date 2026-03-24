const SettingsComponent = {
    render: () => {
        const syncFreq = localStorage.getItem('lifeos_sync_freq') || '30000';
        const serverUrl = localStorage.getItem('lifeos_server_url') || '';
        const user = JSON.parse(localStorage.getItem('lifeos_user')) || {};

        const isLocal = localStorage.getItem('lifeos_mode') === 'local';
        const billingEnabled = localStorage.getItem('lifeos_billing_enabled') === 'true';
        const categories = Storage.getData('categories');

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
                    <h3>System Features</h3>
                    <div style="display:flex; align-items:center; gap:1rem;">
                        <label>Client Billing System</label>
                        <button onclick="SettingsComponent.toggleBilling()" style="width:auto; background:${billingEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}">
                            ${billingEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Category Management</h3>
                    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <h4>Income Categories</h4>
                            <div id="cat-income-list">
                                ${categories.filter(c => c.type === 'income').map(c => `
                                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem; border-radius:5px;">
                                        <span>${c.name}</span>
                                        <button onclick="SettingsComponent.deleteCat('${c.id}')" style="background:var(--danger); width:auto; padding:2px 8px;">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            <input type="text" id="new-cat-income" placeholder="New Income Cat" style="margin-top:0.5rem;">
                            <button onclick="SettingsComponent.addCat('income')" style="padding:5px;">Add</button>
                        </div>
                        <div>
                            <h4>Expense Categories</h4>
                            <div id="cat-expense-list">
                                ${categories.filter(c => c.type === 'expense').map(c => `
                                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem; border-radius:5px;">
                                        <span>${c.name}</span>
                                        <button onclick="SettingsComponent.deleteCat('${c.id}')" style="background:var(--danger); width:auto; padding:2px 8px;">×</button>
                                    </div>
                                `).join('')}
                            </div>
                            <input type="text" id="new-cat-expense" placeholder="New Expense Cat" style="margin-top:0.5rem;">
                            <button onclick="SettingsComponent.addCat('expense')" style="padding:5px;">Add</button>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Dynamic Bill Categories</h3>
                    <p>Create categories with custom fields for detailed bill tracking.</p>
                    <div id="bill-cat-list">
                        ${Storage.getData('bill_categories').map(bc => {
                            const fields = Storage.getData('bill_category_fields')
                                .filter(f => f.category_id === bc.id)
                                .sort((a,b) => a.field_order - b.field_order);
                            return `
                                <div class="card" style="background:rgba(255,255,255,0.03); margin-bottom:1rem;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <h4>${bc.name}</h4>
                                        <button onclick="SettingsComponent.deleteBillCat('${bc.id}')" style="background:var(--danger); width:auto; padding:2px 8px;">Delete Category</button>
                                    </div>
                                    <div style="margin-top:1rem;">
                                        <h5>Fields:</h5>
                                        ${fields.map((f, index) => `
                                            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem; background:rgba(255,255,255,0.05); padding:0.3rem; border-radius:4px;">
                                                <span style="flex:1">${f.field_name} (${f.field_type})</span>
                                                <button onclick="SettingsComponent.moveField('${f.id}', 'up')" style="width:auto; padding:2px 5px; font-size:0.7rem;">↑</button>
                                                <button onclick="SettingsComponent.moveField('${f.id}', 'down')" style="width:auto; padding:2px 5px; font-size:0.7rem;">↓</button>
                                                <button onclick="SettingsComponent.deleteField('${f.id}')" style="background:var(--danger); width:auto; padding:2px 5px; font-size:0.7rem;">×</button>
                                            </div>
                                        `).join('')}
                                        <div style="display:flex; gap:0.3rem; margin-top:0.5rem;">
                                            <input type="text" id="new-field-name-${bc.id}" placeholder="Field Name" style="font-size:0.8rem; padding:4px;">
                                            <select id="new-field-type-${bc.id}" style="font-size:0.8rem; padding:4px;">
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                            </select>
                                            <button onclick="SettingsComponent.addField('${bc.id}')" style="padding:4px 8px; width:auto; font-size:0.8rem;">Add Field</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                        <input type="text" id="new-bill-cat-name" placeholder="New Category Name">
                        <button onclick="SettingsComponent.addBillCat()" style="width:auto;">Add Category</button>
                    </div>
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
    toggleBilling: () => {
        const current = localStorage.getItem('lifeos_billing_enabled') === 'true';
        localStorage.setItem('lifeos_billing_enabled', !current);
        alert('Billing System ' + (!current ? 'Enabled' : 'Disabled'));
        renderCurrentSection();
        // Update nav visibility
        location.reload();
    },
    addCat: (type) => {
        const inputId = type === 'Income' ? 'new-cat-income' : 'new-cat-expense';
        const name = document.getElementById(inputId).value;
        if (!name) return;
        Storage.saveData('categories', { id: 'cat-' + Date.now(), name, type });
        renderCurrentSection();
        Sync.performSync();
    },
    deleteCat: (id) => {
        if (!confirm('Delete category?')) return;
        Storage.deleteData('categories', id);
        renderCurrentSection();
        Sync.performSync();
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
        const tables = ['income', 'bills', 'loans', 'notes', 'experience', 'wifi_clients', 'wifi_payments', 'billing_types', 'categories', 'bill_categories', 'bill_category_fields'];
        tables.forEach(t => localStorage.removeItem(`lifeos_${t}`));
        localStorage.removeItem('lifeos_last_sync_time');
        alert('Cache cleared.');
        location.reload();
    },
    addBillCat: () => {
        const name = document.getElementById('new-bill-cat-name').value;
        if (!name) return;
        Storage.saveData('bill_categories', { id: 'bc-' + Date.now(), name });
        renderCurrentSection();
        Sync.performSync();
    },
    deleteBillCat: (id) => {
        if (!confirm('Delete this bill category and all its fields?')) return;
        Storage.deleteData('bill_categories', id);
        // Also delete associated fields
        const fields = Storage.getData('bill_category_fields', true).filter(f => f.category_id === id);
        fields.forEach(f => Storage.deleteData('bill_category_fields', f.id));
        renderCurrentSection();
        Sync.performSync();
    },
    addField: (catId) => {
        const name = document.getElementById(`new-field-name-${catId}`).value;
        const type = document.getElementById(`new-field-type-${catId}`).value;
        if (!name) return;

        const existingFields = Storage.getData('bill_category_fields').filter(f => f.category_id === catId);
        const order = existingFields.length;

        Storage.saveData('bill_category_fields', {
            id: 'f-' + Date.now(),
            category_id: catId,
            field_name: name,
            field_type: type,
            field_order: order
        });
        renderCurrentSection();
        Sync.performSync();
    },
    deleteField: (id) => {
        Storage.deleteData('bill_category_fields', id);
        renderCurrentSection();
        Sync.performSync();
    },
    moveField: (id, direction) => {
        const fields = Storage.getData('bill_category_fields', true);
        const field = fields.find(f => f.id === id);
        if (!field) return;

        const catFields = fields
            .filter(f => f.category_id === field.category_id && f.deleted === 0)
            .sort((a,b) => a.field_order - b.field_order);

        const index = catFields.findIndex(f => f.id === id);

        if (direction === 'up' && index > 0) {
            const prev = catFields[index - 1];
            const tempOrder = field.field_order;
            field.field_order = prev.field_order;
            prev.field_order = tempOrder;
            Storage.saveData('bill_category_fields', field);
            Storage.saveData('bill_category_fields', prev);
        } else if (direction === 'down' && index < catFields.length - 1) {
            const next = catFields[index + 1];
            const tempOrder = field.field_order;
            field.field_order = next.field_order;
            next.field_order = tempOrder;
            Storage.saveData('bill_category_fields', field);
            Storage.saveData('bill_category_fields', next);
        }
        renderCurrentSection();
        Sync.performSync();
    }
};
