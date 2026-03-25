const IncomeComponent = {
    render: () => {
        const data = Storage.getData('income');
        const categories = Storage.getData('categories').filter(c => c.type === 'income');
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1><svg style="width:24px; vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg> Income</h1>
                    <button onclick="IncomeComponent.add()" style="width: auto;">+ Add Income</button>
                </div>
                <div id="inc-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="inc-name" placeholder="Source Name (e.g. Salary)">
                    <input type="number" id="inc-amount" placeholder="Amount">
                    <select id="inc-category">
                        <option value="">Select Category</option>
                        ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                    <input type="date" id="inc-date" value="${new Date().toISOString().split('T')[0]}">
                    <input type="text" id="inc-note" placeholder="Optional Note">
                    <button onclick="IncomeComponent.save()">Save Income</button>
                    <button onclick="document.getElementById('inc-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card">
                            <div style="display:flex; justify-content:space-between;">
                                <h3>${item.name}</h3>
                                <span class="badge bg-success">${item.category || 'General'}</span>
                            </div>
                            <p style="font-size: 1.5rem; color: var(--primary)">${formatCurrency(item.amount)}</p>
                            <small>${item.date}</small>
                            ${item.note ? `<p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">${item.note}</p>` : ''}
                            <button onclick="IncomeComponent.delete('${item.id}')" class="delete-btn" style="width:auto; margin-top:1rem;">Delete</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('inc-form').style.display = 'block';
    },
    save: () => {
        const name = document.getElementById('inc-name').value;
        const amount = document.getElementById('inc-amount').value;
        const category = document.getElementById('inc-category').value;
        const date = document.getElementById('inc-date').value;
        const note = document.getElementById('inc-note').value;
        if (name && amount) {
            Storage.saveData('income', { id: 'inc-' + Date.now(), name, amount, category, date, note });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete?')) {
            Storage.deleteData('income', id);
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
