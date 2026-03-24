const BillsComponent = {
    render: () => {
        const data = Storage.getData('bills');
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>🧾 Bills</h1>
                    <button onclick="BillsComponent.add()" style="width: auto;">+ Add Bill</button>
                </div>
                <div id="bill-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="bill-name" placeholder="Bill Name">
                    <input type="number" id="bill-amount" placeholder="Amount">
                    <input type="date" id="bill-date" value="${new Date().toISOString().split('T')[0]}">
                    <input type="text" id="bill-note" placeholder="Note (optional)">
                    <button onclick="BillsComponent.save()">Save Bill</button>
                    <button onclick="document.getElementById('bill-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card">
                            <h3>${item.name}</h3>
                            <p style="font-size: 1.5rem; color: var(--danger)">${formatCurrency(item.amount)}</p>
                            <p>${item.date}</p>
                            <p>${item.note || ''}</p>
                            <button onclick="BillsComponent.delete('${item.id}')" class="delete-btn" style="width:auto; margin-top:1rem;">Delete</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('bill-form').style.display = 'block';
    },
    save: () => {
        const name = document.getElementById('bill-name').value;
        const amount = document.getElementById('bill-amount').value;
        const date = document.getElementById('bill-date').value;
        const note = document.getElementById('bill-note').value;
        if (name && amount) {
            Storage.saveData('bills', { id: 'bill-' + Date.now(), name, amount, date, note });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete?')) {
            Storage.deleteData('bills', id);
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
