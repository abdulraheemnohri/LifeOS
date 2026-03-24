const BillsComponent = {
    render: () => {
        const data = Storage.getData('bills');
        const categories = Storage.getData('categories').filter(c => c.type === 'expense');
        const billCategories = Storage.getData('bill_categories');

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>🧾 Bills & Expenses</h1>
                    <button onclick="BillsComponent.add()" style="width: auto;">+ Add Expense</button>
                </div>
                <div id="bill-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="bill-name" placeholder="Expense Name (e.g. Rent)">
                    <input type="number" id="bill-amount" placeholder="Amount">
                    <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
                        <select id="bill-category" style="flex:1">
                            <option value="">General Expense</option>
                            ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                        </select>
                        <select id="bill-dynamic-category" style="flex:1" onchange="BillsComponent.handleCategoryChange()">
                            <option value="">Dynamic Category (Optional)</option>
                            ${billCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div id="dynamic-fields-area"></div>

                    <input type="date" id="bill-date" value="${new Date().toISOString().split('T')[0]}">
                    <input type="text" id="bill-note" placeholder="Note (optional)">
                    <button onclick="BillsComponent.save()">Save Expense</button>
                    <button onclick="document.getElementById('bill-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => {
                        let dynamicInfo = '';
                        if (item.dynamic_data) {
                            try {
                                const dyn = JSON.parse(item.dynamic_data);
                                dynamicInfo = Object.entries(dyn).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('');
                            } catch(e) {}
                        }
                        return `
                            <div class="card">
                                <div style="display:flex; justify-content:space-between;">
                                    <h3>${item.name}</h3>
                                    <span class="badge bg-danger">${item.category || 'General'}</span>
                                </div>
                                <p style="font-size: 1.5rem; color: var(--danger)">${formatCurrency(item.amount)}</p>
                                <p>${item.date}</p>
                                <div style="font-size: 0.85rem; margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                    ${dynamicInfo || '<em style="opacity:0.5">No dynamic data</em>'}
                                </div>
                                ${item.note ? `<p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">${item.note}</p>` : ''}
                                <button onclick="BillsComponent.delete('${item.id}')" class="delete-btn" style="width:auto; margin-top:1rem;">Delete</button>
                            </div>
                        `;
                    }).join('')}
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
        const category = document.getElementById('bill-category').value;
        const category_id = document.getElementById('bill-dynamic-category').value;
        const date = document.getElementById('bill-date').value;
        const note = document.getElementById('bill-note').value;

        const dynamicData = {};
        if (category_id) {
            const fields = Storage.getData('bill_category_fields').filter(f => f.category_id === category_id);
            fields.forEach(f => {
                const input = document.getElementById(`dyn-field-${f.id}`);
                if (input) dynamicData[f.field_name] = input.value;
            });
        }

        if (name && amount) {
            Storage.saveData('bills', {
                id: 'bill-' + Date.now(),
                name,
                amount,
                category,
                category_id,
                dynamic_data: JSON.stringify(dynamicData),
                date,
                note
            });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    handleCategoryChange: () => {
        const category_id = document.getElementById('bill-dynamic-category').value;
        const area = document.getElementById('dynamic-fields-area');
        area.innerHTML = '';

        if (category_id) {
            const fields = Storage.getData('bill_category_fields')
                .filter(f => f.category_id === category_id)
                .sort((a,b) => a.field_order - b.field_order);

            area.innerHTML = fields.map(f => `
                <div style="margin-bottom:0.8rem;">
                    <label style="display:block; font-size:0.8rem; margin-bottom:0.2rem; opacity:0.8;">${f.field_name}</label>
                    <input type="${f.field_type}" id="dyn-field-${f.id}" placeholder="${f.field_name}">
                </div>
            `).join('');
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
