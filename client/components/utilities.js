const UtilityComponent = {
    render: () => {
        const utilities = Storage.getData('utilities');

        let html = `
            <div class="glass-card section-header animate-fade-in">
                <div class="header-flex">
                    <h2>🔌 Utilities & Services</h2>
                    <button onclick="UtilityComponent.add()" class="btn-primary">+ Add Utility</button>
                </div>
            </div>

            <div class="grid animate-fade-in">
                ${utilities.length ? utilities.map(u => `
                    <div class="glass-card utility-card">
                        <div class="card-header">
                            <h3>${u.name}</h3>
                            <span class="badge">${u.provider}</span>
                        </div>
                        <div class="utility-content">
                            <div class="detail">
                                <span class="label">Account #</span>
                                <span class="value">${u.account_no || 'N/A'}</span>
                            </div>
                            <div class="detail">
                                <span class="label">Last Reading</span>
                                <span class="value">${u.meter_reading || '0'} ${u.unit || ''}</span>
                            </div>
                            ${u.last_bill_date ? `
                                <div class="detail">
                                    <span class="label">Last Bill</span>
                                    <span class="value">${u.last_bill_date}</span>
                                </div>
                            ` : ''}
                        </div>
                        ${u.note ? `<p class="utility-note">${u.note}</p>` : ''}
                        <div class="card-actions">
                            <button onclick="UtilityComponent.edit('${u.id}')" class="btn-secondary">Update</button>
                            <button onclick="UtilityComponent.delete('${u.id}')" class="btn-secondary danger">Delete</button>
                        </div>
                    </div>
                `).join('') : '<div class="glass-card"><p>No utilities tracked. Track your electricity, water, gas or internet accounts here.</p></div>'}
            </div>
        `;
        return html;
    },

    add: () => UtilityComponent.showModal(),
    edit: (id) => {
        const item = Storage.getData('utilities').find(u => u.id === id);
        if (item) UtilityComponent.showModal(item);
    },

    delete: (id) => {
        if (confirm('Delete this utility entry?')) {
            Storage.deleteData('utilities', id);
            renderCurrentSection();
        }
    },

    showModal: (item = null) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="glass-card modal-content">
                <h2>${item ? 'Update Utility' : 'Add Utility'}</h2>
                <form id="utility-form">
                    <input type="text" id="u-name" placeholder="Service Name (e.g. Electricity)" value="${item ? item.name : ''}" required>
                    <input type="text" id="u-prov" placeholder="Provider Name" value="${item ? item.provider || '' : ''}">
                    <input type="text" id="u-acc" placeholder="Account / Connection Number" value="${item ? item.account_no || '' : ''}">
                    <div class="form-row">
                        <input type="number" id="u-read" placeholder="Current Reading" step="0.01" value="${item ? item.meter_reading || '' : ''}">
                        <input type="text" id="u-unit" placeholder="Unit (kWh, m³)" value="${item ? item.unit || '' : ''}">
                    </div>
                    <label>Last Bill Date</label>
                    <input type="date" id="u-date" value="${item ? item.last_bill_date || '' : ''}">
                    <textarea id="u-note" placeholder="Notes (login details, contact, etc.)">${item ? item.note || '' : ''}</textarea>

                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Save</button>
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('form').onsubmit = (e) => {
            e.preventDefault();
            const newData = {
                id: item ? item.id : 'util-' + Date.now(),
                name: document.getElementById('u-name').value,
                provider: document.getElementById('u-prov').value,
                account_no: document.getElementById('u-acc').value,
                meter_reading: parseFloat(document.getElementById('u-read').value) || 0,
                unit: document.getElementById('u-unit').value,
                last_bill_date: document.getElementById('u-date').value,
                note: document.getElementById('u-note').value
            };
            Storage.saveData('utilities', newData);
            modal.remove();
            renderCurrentSection();
        };
    }
};
