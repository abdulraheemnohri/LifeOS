const LoansComponent = {
    render: () => {
        const data = Storage.getData('loans');
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>🤝 Loans</h1>
                    <button onclick="LoansComponent.add()" style="width: auto;">+ Add Loan</button>
                </div>
                <div id="loan-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="loan-person" placeholder="Person">
                    <input type="number" id="loan-amount" placeholder="Amount">
                    <select id="loan-type">
                        <option value="Given">Given</option>
                        <option value="Taken">Taken</option>
                    </select>
                    <input type="date" id="loan-date" value="${new Date().toISOString().split('T')[0]}">
                    <button onclick="LoansComponent.save()">Save Loan</button>
                    <button onclick="document.getElementById('loan-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card">
                            <h3 style="color: ${item.type === 'Given' ? 'var(--primary)' : 'var(--danger)'}">${item.person}</h3>
                            <p style="font-size: 1.5rem;">${formatCurrency(item.amount)}</p>
                            <p>${item.type}</p>
                            <p>${item.date}</p>
                            <p>Status: ${item.status}</p>
                            <button onclick="LoansComponent.delete('${item.id}')" class="delete-btn">Delete</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('loan-form').style.display = 'block';
    },
    save: () => {
        const person = document.getElementById('loan-person').value;
        const amount = document.getElementById('loan-amount').value;
        const type = document.getElementById('loan-type').value;
        const date = document.getElementById('loan-date').value;
        if (person && amount) {
            Storage.saveData('loans', { id: 'loan-' + Date.now(), person, amount, type, date, status: 'Pending' });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete?')) {
            Storage.deleteData('loans', id);
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
