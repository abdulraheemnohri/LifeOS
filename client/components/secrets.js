const SecretsComponent = {
    render: () => {
        const secrets = Storage.getData('secrets');

        let html = `
            <div class="glass-card section-header animate-fade-in">
                <div class="header-flex">
                    <h2>🔐 Secrets Safe</h2>
                    <button onclick="SecretsComponent.add()" class="btn-primary">+ Add Secret</button>
                </div>
                <p class="subtitle">Securely store passwords, keys, and private data locally.</p>
            </div>

            <div class="grid animate-fade-in">
                ${secrets.length ? secrets.map(s => `
                    <div class="glass-card secret-card" id="secret-${s.id}">
                        <div class="card-header">
                            <span class="icon">${s.icon || '🔑'}</span>
                            <h3>${s.title}</h3>
                        </div>
                        <div class="secret-body">
                            <div class="detail">
                                <span class="label">Username</span>
                                <span class="value">${s.username || '---'}</span>
                            </div>
                            <div class="detail hidden-content">
                                <span class="label">Content</span>
                                <span class="value starred">••••••••</span>
                                <span class="value actual" style="display:none;">${s.encrypted_content}</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button onclick="SecretsComponent.toggleVisibility('${s.id}')" class="btn-secondary view-btn">View</button>
                            <button onclick="SecretsComponent.copy('${s.id}')" class="btn-secondary">Copy</button>
                            <button onclick="SecretsComponent.edit('${s.id}')" class="btn-secondary">Edit</button>
                            <button onclick="SecretsComponent.delete('${s.id}')" class="btn-secondary danger">Delete</button>
                        </div>
                    </div>
                `).join('') : '<div class="glass-card"><p>No secrets stored. Keep your passwords and keys safe.</p></div>'}
            </div>
        `;
        return html;
    },

    toggleVisibility: (id) => {
        const card = document.getElementById(`secret-${id}`);
        const starred = card.querySelector('.starred');
        const actual = card.querySelector('.actual');
        const btn = card.querySelector('.view-btn');

        if (actual.style.display === 'none') {
            actual.style.display = 'inline';
            starred.style.display = 'none';
            btn.innerText = 'Hide';
        } else {
            actual.style.display = 'none';
            starred.style.display = 'inline';
            btn.innerText = 'View';
        }
    },

    copy: (id) => {
        const secret = Storage.getData('secrets').find(s => s.id === id);
        if (secret) {
            navigator.clipboard.writeText(secret.encrypted_content);
            Notifications.show('Secret copied to clipboard', 'info');
        }
    },

    add: () => SecretsComponent.showModal(),
    edit: (id) => {
        const item = Storage.getData('secrets').find(s => s.id === id);
        if (item) SecretsComponent.showModal(item);
    },

    delete: (id) => {
        if (confirm('Delete this secret? This action cannot be undone.')) {
            Storage.deleteData('secrets', id);
            renderCurrentSection();
        }
    },

    showModal: (item = null) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="glass-card modal-content">
                <h2>${item ? 'Edit Secret' : 'Add New Secret'}</h2>
                <form id="secret-form">
                    <input type="text" id="s-title" placeholder="Title (e.g. Gmail Password)" value="${item ? item.title : ''}" required>
                    <input type="text" id="s-user" placeholder="Username / Email" value="${item ? item.username || '' : ''}">
                    <textarea id="s-content" placeholder="Sensitive Content (Password, API Key, etc.)" required>${item ? item.encrypted_content : ''}</textarea>

                    <div class="form-row">
                        <input type="text" id="s-cat" placeholder="Category" value="${item ? item.category || '' : ''}">
                        <input type="text" id="s-icon" placeholder="Icon (Emoji)" value="${item ? item.icon || '🔑' : '🔑'}">
                    </div>

                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Save Securely</button>
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('form').onsubmit = (e) => {
            e.preventDefault();
            const newData = {
                id: item ? item.id : 'sec-' + Date.now(),
                title: document.getElementById('s-title').value,
                username: document.getElementById('s-user').value,
                encrypted_content: document.getElementById('s-content').value,
                category: document.getElementById('s-cat').value,
                icon: document.getElementById('s-icon').value
            };
            Storage.saveData('secrets', newData);
            modal.remove();
            renderCurrentSection();
        };
    }
};
