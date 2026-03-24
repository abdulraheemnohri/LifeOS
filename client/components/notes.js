const NotesComponent = {
    render: () => {
        const data = Storage.getData('notes').sort((a, b) => (b.pinned || 0) - (a.pinned || 0));
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1><svg style="width:24px; vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/></svg> Notes</h1>
                    <button onclick="NotesComponent.add()" style="width: auto;">+ New Note</button>
                </div>
                <div id="note-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="note-title" placeholder="Title">
                    <textarea id="note-content" placeholder="Content" style="width:100%; background:transparent; color:white; border:1px solid rgba(255,255,255,0.1); padding:0.5rem; border-radius:8px;"></textarea>
                    <input type="color" id="note-color" value="#1e293b" style="height:40px; padding:0;">
                    <button onclick="NotesComponent.save()">Save Note</button>
                    <button onclick="document.getElementById('note-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card" style="background: ${item.color || 'rgba(30, 41, 59, 0.7)'}; border: ${item.pinned ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)'}">
                            <h3>${item.pinned ? '📌 ' : ''}${item.title}</h3>
                            <p>${item.content}</p>
                            <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                                <button onclick="NotesComponent.togglePin('${item.id}')" style="background:rgba(255,255,255,0.1); width:auto;">${item.pinned ? 'Unpin' : 'Pin'}</button>
                                <button onclick="NotesComponent.delete('${item.id}')" class="delete-btn" style="width:auto;">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('note-form').style.display = 'block';
    },
    save: () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const color = document.getElementById('note-color').value;
        if (title && content) {
            Storage.saveData('notes', { id: 'note-' + Date.now(), title, content, color });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    togglePin: (id) => {
        const notes = Storage.getData('notes', true);
        const note = notes.find(n => n.id === id);
        if (note) {
            note.pinned = note.pinned ? 0 : 1;
            Storage.saveData('notes', note);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete?')) {
            Storage.deleteData('notes', id);
            renderCurrentSection();
            Sync.performSync();
        }
    }
};
