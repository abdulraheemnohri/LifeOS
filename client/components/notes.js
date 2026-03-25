const NotesComponent = {
    render: () => {
        const searchQuery = localStorage.getItem('notes_search') || '';
        const showArchived = localStorage.getItem('notes_show_archived') === 'true';

        let data = Storage.getData('notes')
            .filter(n => (showArchived ? n.archived === 1 : !n.archived))
            .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => (b.pinned || 0) - (a.pinned || 0));

        const colors = ['#1e293b', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'];

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1><svg style="width:24px; vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/></svg> Notes</h1>
                    <div style="display:flex; gap:0.5rem;">
                        <button onclick="NotesComponent.toggleArchivedView()" style="width:auto; background:var(--accent);">${showArchived ? 'Show Active' : 'Show Archived'}</button>
                        <button onclick="NotesComponent.add()" style="width: auto;">+ New Note</button>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 2rem;">
                    <input type="text" id="note-search" placeholder="Search notes..." value="${searchQuery}" oninput="NotesComponent.search(this.value)" style="margin-bottom:0;">
                </div>

                <div id="note-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="note-title" placeholder="Title">
                    <textarea id="note-content" placeholder="Content" style="width:100%; height:120px; background:transparent; color:white; border:1px solid rgba(255,255,255,0.1); padding:0.5rem; border-radius:8px;"></textarea>

                    <div style="margin: 1rem 0;">
                        <label style="display:block; margin-bottom:0.5rem; font-size:0.8rem;">Select Color</label>
                        <div style="display:flex; gap:0.5rem;">
                            ${colors.map(c => `
                                <div onclick="document.getElementById('note-color').value='${c}'; document.querySelectorAll('.color-opt').forEach(o=>o.style.border='none'); this.style.border='2px solid white';"
                                     class="color-opt"
                                     style="width:30px; height:30px; border-radius:50%; background:${c}; cursor:pointer; ${c === '#1e293b' ? 'border:2px solid white' : ''}">
                                </div>
                            `).join('')}
                        </div>
                        <input type="hidden" id="note-color" value="#1e293b">
                    </div>

                    <button onclick="NotesComponent.save()">Save Note</button>
                    <button onclick="document.getElementById('note-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="grid">
                    ${data.map(item => `
                        <div class="card" style="background: ${item.color || 'rgba(30, 41, 59, 0.7)'}; border: ${item.pinned ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)'}; transition: transform 0.2s;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <h3 style="margin:0;">${item.pinned ? '📌 ' : ''}${item.title}</h3>
                                <div style="display:flex; gap:0.3rem;">
                                    <button onclick="NotesComponent.togglePin('${item.id}')" style="background:rgba(255,255,255,0.2); width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">${item.pinned ? '📍' : '📌'}</button>
                                </div>
                            </div>
                            <p style="margin-top:1rem; white-space: pre-wrap;">${item.content}</p>
                            <div style="display:flex; gap:0.5rem; margin-top:2rem;">
                                <button onclick="NotesComponent.archive('${item.id}')" style="background:rgba(255,255,255,0.1); width:auto; font-size:0.8rem;">${item.archived ? 'Restore' : 'Archive'}</button>
                                <button onclick="NotesComponent.delete('${item.id}')" class="delete-btn" style="width:auto; font-size:0.8rem;">Delete</button>
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
            Storage.saveData('notes', { id: 'note-' + Date.now(), title, content, color, archived: 0 });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    search: (val) => {
        localStorage.setItem('notes_search', val);
        renderCurrentSection();
    },
    toggleArchivedView: () => {
        const current = localStorage.getItem('notes_show_archived') === 'true';
        localStorage.setItem('notes_show_archived', !current);
        renderCurrentSection();
    },
    archive: (id) => {
        const notes = Storage.getData('notes', true);
        const note = notes.find(n => n.id === id);
        if (note) {
            note.archived = note.archived ? 0 : 1;
            Storage.saveData('notes', note);
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
