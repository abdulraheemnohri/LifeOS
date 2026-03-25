const ExperienceComponent = {
    render: () => {
        const data = Storage.getData('experience').sort((a,b) => new Date(b.date) - new Date(a.date));
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>📘 Experience & Timeline</h1>
                    <button onclick="ExperienceComponent.add()" style="width: auto;">+ New Entry</button>
                </div>
                <div id="exp-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <input type="text" id="exp-title" placeholder="Title/Event Name">
                    <textarea id="exp-desc" placeholder="Description" style="width:100%; height:80px; background:transparent; color:white; border:1px solid rgba(255,255,255,0.1); padding:0.5rem; border-radius:8px; margin-bottom:0.5rem;"></textarea>

                    <div class="grid" style="grid-template-columns: 1fr 1fr; gap:0.5rem;">
                        <input type="text" id="exp-location" placeholder="Location">
                        <input type="text" id="exp-media" placeholder="Image URL (optional)">
                    </div>

                    <div style="margin: 1rem 0; display:flex; align-items:center; gap:1rem;">
                        <label>Rating:</label>
                        <select id="exp-rating" style="width:auto;">
                            <option value="5">⭐⭐⭐⭐⭐</option>
                            <option value="4">⭐⭐⭐⭐</option>
                            <option value="3">⭐⭐⭐</option>
                            <option value="2">⭐⭐</option>
                            <option value="1">⭐</option>
                        </select>
                        <input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" style="flex:1">
                    </div>

                    <input type="text" id="exp-tags" placeholder="Tags (comma separated)">

                    <button onclick="ExperienceComponent.save()">Save Entry</button>
                    <button onclick="document.getElementById('exp-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>
                <div class="timeline-container">
                    ${data.map(item => `
                        <div class="timeline-item">
                            <div class="card">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                    <div>
                                        <h3 style="margin-bottom:0.2rem;">${item.title}</h3>
                                        <div style="font-size:0.8rem; color:var(--accent); margin-bottom:0.5rem;">
                                            ${'⭐'.repeat(item.rating || 5)} | ${item.location || 'Unknown Location'}
                                        </div>
                                    </div>
                                    <small style="opacity:0.6;">${item.date}</small>
                                </div>

                                ${item.media_url ? `<img src="${item.media_url}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin:0.5rem 0;" onerror="this.style.display='none'">` : ''}

                                <p style="white-space: pre-wrap;">${item.description}</p>

                                <div style="margin-top:0.8rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
                                    ${(item.tags || '').split(',').filter(t => t.trim()).map(t => `<span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-size:0.7rem;">#${t.trim()}</span>`).join('')}
                                </div>

                                <button onclick="ExperienceComponent.delete('${item.id}')" class="delete-btn" style="width:auto; margin-top:1.5rem; font-size:0.8rem;">Delete</button>
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
        const location = document.getElementById('exp-location').value;
        const media_url = document.getElementById('exp-media').value;
        const rating = parseInt(document.getElementById('exp-rating').value);
        const tags = document.getElementById('exp-tags').value;
        const date = document.getElementById('exp-date').value;

        if (title && description) {
            Storage.saveData('experience', {
                id: 'exp-' + Date.now(),
                title,
                description,
                location,
                media_url,
                rating,
                tags,
                date
            });
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
