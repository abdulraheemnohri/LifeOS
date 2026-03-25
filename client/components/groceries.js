const GroceryComponent = {
    render: () => {
        const groceries = Storage.getData('groceries');
        const categories = [...new Set(groceries.map(g => g.category || 'Uncategorized'))];

        let html = `
            <div class="glass-card section-header animate-fade-in">
                <div class="header-flex">
                    <h2>🛒 Grocery List</h2>
                    <button onclick="GroceryComponent.add()" class="btn-primary">+ Add Item</button>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="label">Total Items</span>
                        <span class="value">${groceries.length}</span>
                    </div>
                    <div class="stat-card">
                        <span class="label">To Buy</span>
                        <span class="value">${groceries.filter(g => !g.bought).length}</span>
                    </div>
                </div>
            </div>

            <div class="search-filter glass-card animate-fade-in">
                <input type="text" id="grocery-search" placeholder="Search groceries..." oninput="GroceryComponent.filter()">
                <select id="grocery-cat-filter" onchange="GroceryComponent.filter()">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>

            <div id="grocery-list" class="grocery-grid animate-fade-in">
                ${GroceryComponent.renderItems(groceries)}
            </div>
        `;
        return html;
    },

    renderItems: (items) => {
        if (items.length === 0) return '<div class="glass-card"><p>No items found.</p></div>';

        // Group by category
        const groups = items.reduce((acc, item) => {
            const cat = item.category || 'Uncategorized';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});

        return Object.keys(groups).map(cat => `
            <div class="grocery-category-group">
                <h3>${cat}</h3>
                <div class="grocery-items">
                    ${groups[cat].map(item => `
                        <div class="glass-card grocery-item ${item.bought ? 'bought' : ''}">
                            <div class="item-info" onclick="GroceryComponent.toggleBought('${item.id}')">
                                <div class="checkbox ${item.bought ? 'checked' : ''}"></div>
                                <div>
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-meta">${item.quantity || ''} ${item.unit || ''} ${item.price ? '• ' + formatCurrency(item.price) : ''}</div>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button onclick="GroceryComponent.edit('${item.id}')" class="btn-icon">✏️</button>
                                <button onclick="GroceryComponent.delete('${item.id}')" class="btn-icon danger">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    filter: () => {
        const search = document.getElementById('grocery-search').value.toLowerCase();
        const cat = document.getElementById('grocery-cat-filter').value;
        const allItems = Storage.getData('groceries');

        const filtered = allItems.filter(i => {
            const matchesSearch = i.name.toLowerCase().includes(search);
            const matchesCat = !cat || i.category === cat;
            return matchesSearch && matchesCat;
        });

        document.getElementById('grocery-list').innerHTML = GroceryComponent.renderItems(filtered);
    },

    add: () => {
        GroceryComponent.showModal();
    },

    edit: (id) => {
        const item = Storage.getData('groceries').find(i => i.id === id);
        if (item) GroceryComponent.showModal(item);
    },

    toggleBought: (id) => {
        const groceries = Storage.getData('groceries');
        const item = groceries.find(i => i.id === id);
        if (item) {
            item.bought = item.bought ? 0 : 1;
            Storage.saveData('groceries', item);
            renderCurrentSection();
        }
    },

    delete: (id) => {
        if (confirm('Delete this item?')) {
            Storage.deleteData('groceries', id);
            renderCurrentSection();
        }
    },

    showModal: (item = null) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="glass-card modal-content">
                <h2>${item ? 'Edit Item' : 'Add Item'}</h2>
                <form id="grocery-form">
                    <input type="text" id="g-name" placeholder="Item Name" value="${item ? item.name : ''}" required>
                    <input type="text" id="g-cat" placeholder="Category (e.g. Dairy, Fruits)" value="${item ? item.category || '' : ''}" list="grocery-cats">
                    <datalist id="grocery-cats">
                        <option value="Produce">
                        <option value="Dairy">
                        <option value="Meat">
                        <option value="Frozen">
                        <option value="Bakery">
                        <option value="Pantry">
                        <option value="Household">
                    </datalist>
                    <div class="form-row">
                        <input type="text" id="g-qty" placeholder="Qty" value="${item ? item.quantity || '' : ''}">
                        <input type="text" id="g-unit" placeholder="Unit (kg, pc)" value="${item ? item.unit || '' : ''}">
                    </div>
                    <input type="number" id="g-price" placeholder="Est. Price" step="0.01" value="${item ? item.price || '' : ''}">
                    <label class="checkbox-container">
                        <input type="checkbox" id="g-rec" ${item && item.recurring ? 'checked' : ''}> Always in stock (Recurring)
                    </label>
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
                id: item ? item.id : 'grc-' + Date.now(),
                name: document.getElementById('g-name').value,
                category: document.getElementById('g-cat').value,
                quantity: document.getElementById('g-qty').value,
                unit: document.getElementById('g-unit').value,
                price: parseFloat(document.getElementById('g-price').value) || 0,
                recurring: document.getElementById('g-rec').checked ? 1 : 0,
                bought: item ? item.bought : 0
            };
            Storage.saveData('groceries', newData);
            modal.remove();
            renderCurrentSection();
        };
    }
};
