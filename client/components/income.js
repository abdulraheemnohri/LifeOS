const IncomeComponent = {
    render: () => {
        const data = Storage.getData('income');
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>💰 Income</h1>
                    <button onclick="IncomeComponent.add()" style="width: auto;">+ Add Income</button>
                </div>
                <div id="inc-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="inc-name" placeholder="Source Name">
                    <input type="number" id="inc-amount" placeholder="Amount">
                    <input type="date" id="inc-date" value="${new Date().toISOString().split('T')[0]}">
                    <button onclick="IncomeComponent.save()">Save Income</button>
                    <button onclick="document.getElementById('inc-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card">
                            <h3>${item.name}</h3>
                            <p style="font-size: 1.5rem; color: var(--primary)">$${parseFloat(item.amount).toFixed(2)}</p>
                            <small>${item.date}</small>
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
        const date = document.getElementById('inc-date').value;
        if (name && amount) {
            Storage.saveData('income', { id: 'inc-' + Date.now(), name, amount, date });
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
