const ExperienceComponent = {
    render: () => {
        const data = Storage.getData('experience').sort((a,b) => new Date(b.date) - new Date(a.date));
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>📘 Experience</h1>
                    <button onclick="ExperienceComponent.add()" style="width: auto;">+ New Entry</button>
                </div>
                <div id="exp-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="exp-title" placeholder="Title">
                    <textarea id="exp-desc" placeholder="Description" style="width:100%; background:transparent; color:white; border:1px solid rgba(255,255,255,0.1); padding:0.5rem; border-radius:8px;"></textarea>
                    <input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}">
                    <button onclick="ExperienceComponent.save()">Save Entry</button>
                    <button onclick="document.getElementById('exp-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="timeline-container">
                    ${data.map(item => `
                        <div class="timeline-item">
                            <div class="card">
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                                <small>${item.date}</small>
                                <button onclick="ExperienceComponent.delete('${item.id}')" class="delete-btn" style="width:auto; margin-top:1rem;">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('exp-form').style.display = 'block';
    },
    save: () => {
        const title = document.getElementById('exp-title').value;
        const description = document.getElementById('exp-desc').value;
        const date = document.getElementById('exp-date').value;
        if (title && description) {
            Storage.saveData('experience', { id: 'exp-' + Date.now(), title, description, date });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete?')) {
            Storage.deleteData('experience', id);
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
