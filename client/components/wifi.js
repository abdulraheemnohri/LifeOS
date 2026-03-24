const WiFiComponent = {
    render: () => {
        const billingTypes = Storage.getData('billing_types');
        const clients = Storage.getData('wifi_clients');
        const payments = Storage.getData('wifi_payments');
        const currentMonth = new Date().toISOString().substring(0, 7);

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>📡 Client Billing System</h1>
                    <div style="display:flex; gap:0.5rem;">
                        <button onclick="WiFiComponent.addType()" style="background:var(--accent)">+ Add Service Type</button>
                        <button onclick="WiFiComponent.addClient()">+ Add Client</button>
                    </div>
                </div>

                <!-- Service Type Form -->
                <div id="type-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <h3>Add New Service (e.g., Milk, WiFi)</h3>
                    <input type="text" id="type-name" placeholder="Service Name (e.g. Milk)">
                    <select id="type-mode">
                        <option value="Fixed">Fixed Monthly Amount</option>
                        <option value="Variable">Variable (Manual Entry)</option>
                    </select>
                    <input type="number" id="type-amount" placeholder="Default Amount">
                    <button onclick="WiFiComponent.saveType()">Save Service</button>
                    <button onclick="document.getElementById('type-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>

                <div id="wifi-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <h3>New Client Entry</h3>
                    <select id="wifi-type-select">
                        ${billingTypes.map(t => `<option value="${t.id}">${t.name} (${t.type})</option>`).join('')}
                    </select>
                    <input type="text" id="wifi-name" placeholder="Client Name">
                    <input type="text" id="wifi-mobile" placeholder="Mobile Number">
                    <input type="text" id="wifi-imei" placeholder="Device IMEI (optional)">
                    <input type="number" id="wifi-rate" placeholder="Rate for this client">
                    <input type="text" id="wifi-note" placeholder="Note (optional)">
                    <button onclick="WiFiComponent.saveClient()">Save Client</button>
                    <button onclick="document.getElementById('wifi-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>

                <div class="grid">
                    ${clients.map(client => {
                        const clientPayments = payments.filter(p => p.client_id === client.id);
                        const unpaidMonths = clientPayments.filter(p => p.status === 'Pending').length;
                        const currentStatus = clientPayments.find(p => p.month === currentMonth)?.status || 'N/A';

                        const type = billingTypes.find(t => t.id === client.type_id);
                        return `
                            <div class="card">
                                <div style="display:flex; justify-content:space-between;">
                                    <h3>${client.name}</h3>
                                    <span class="badge ${currentStatus === 'Paid' ? 'bg-success' : 'bg-danger'}">${currentStatus}</span>
                                </div>
                                <p style="color:var(--accent); font-weight:bold;">${type?.name || 'WiFi'}</p>
                                <p>📱 ${client.mobile}</p>
                                ${client.imei ? `<p>🆔 IMEI: ${client.imei}</p>` : ''}
                                <p>💰 Rate: ${formatCurrency(client.monthly_rate)} ${type?.type === 'Variable' ? '(Base)' : ''}</p>
                                <p>📅 Pending: <strong>${unpaidMonths} bill(s)</strong></p>

                                <div style="margin-top:1rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
                                    ${type?.type === 'Variable' ?
                                        `<button onclick="WiFiComponent.addManualBill('${client.id}')" style="background:var(--accent); width:auto; font-size:0.8rem;">+ Bill</button>` :
                                        `<button onclick="WiFiComponent.markPaid('${client.id}', '${currentMonth}')" style="background:var(--primary); width:auto; font-size:0.8rem;">Pay ${currentMonth}</button>`
                                    }
                                    <button onclick="WiFiComponent.removeClient('${client.id}')" class="delete-btn" style="width:auto; font-size:0.8rem;">Remove</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <h2 style="margin-top: 3rem;">Payment History</h2>
                <div class="card" style="overflow-x: auto;">
                    <table style="width:100%; text-align:left; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1)">
                                <th style="padding:1rem;">Client</th>
                                <th style="padding:1rem;">Month</th>
                                <th style="padding:1rem;">Amount</th>
                                <th style="padding:1rem;">Status</th>
                                <th style="padding:1rem;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.sort((a,b) => b.month.localeCompare(a.month)).map(p => {
                                const client = clients.find(c => c.id === p.client_id);
                                return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05)">
                                        <td style="padding:1rem;">${client ? client.name : 'Unknown'}</td>
                                        <td style="padding:1rem;">${p.month}</td>
                                        <td style="padding:1rem;">${formatCurrency(p.amount)}</td>
                                        <td style="padding:1rem;">
                                            <span style="color: ${p.status === 'Paid' ? 'var(--primary)' : 'var(--danger)'}">${p.status}</span>
                                        </td>
                                        <td style="padding:1rem;">
                                            ${p.status === 'Pending' ? `<button onclick="WiFiComponent.markPaidById('${p.id}')" style="padding:0.3rem 0.6rem; width:auto; font-size:0.8rem;">Pay</button>` : '✅'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    addType: () => {
        document.getElementById('type-form').style.display = 'block';
    },
    saveType: () => {
        const name = document.getElementById('type-name').value;
        const type = document.getElementById('type-mode').value;
        const amount = document.getElementById('type-amount').value;
        if (name) {
            Storage.saveData('billing_types', { id: 'type-' + Date.now(), name, type, default_amount: amount });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    addClient: () => {
        const types = Storage.getData('billing_types');
        if (types.length === 0) return alert('Please add a Service Type first');
        document.getElementById('wifi-form').style.display = 'block';
    },
    saveClient: () => {
        const type_id = document.getElementById('wifi-type-select').value;
        const name = document.getElementById('wifi-name').value;
        const mobile = document.getElementById('wifi-mobile').value;
        const imei = document.getElementById('wifi-imei').value;
        const rate = document.getElementById('wifi-rate').value;
        const note = document.getElementById('wifi-note').value;

        if (name && mobile) {
            const clientId = 'wifi-' + Date.now();
            Storage.saveData('wifi_clients', { id: clientId, type_id, name, mobile, imei, monthly_rate: rate, note });

            // Trigger bill generation for new client
            Sync.generateMonthlyBills();

            renderCurrentSection();
            Sync.performSync();
        }
    },
    removeClient: (id) => {
        if (confirm('Are you sure you want to remove this client? History will be kept.')) {
            Storage.deleteData('wifi_clients', id);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    markPaid: (clientId, month) => {
        const payments = Storage.getData('wifi_payments', true);
        const p = payments.find(pay => pay.client_id === clientId && pay.month === month);
        if (p) {
            p.status = 'Paid';
            p.date_paid = new Date().toISOString();
            Storage.saveData('wifi_payments', p);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    markPaidById: (id) => {
        const payments = Storage.getData('wifi_payments', true);
        const p = payments.find(pay => pay.id === id);
        if (p) {
            p.status = 'Paid';
            p.date_paid = new Date().toISOString();
            Storage.saveData('wifi_payments', p);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    addManualBill: (clientId) => {
        const amount = prompt('Enter bill amount:');
        const month = prompt('Enter month (YYYY-MM):', new Date().toISOString().substring(0, 7));
        if (amount && month) {
            Storage.saveData('wifi_payments', {
                id: `pay-${clientId}-${Date.now()}`,
                client_id: clientId,
                month: month,
                amount: parseFloat(amount),
                status: 'Pending',
                date_paid: ''
            });
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
