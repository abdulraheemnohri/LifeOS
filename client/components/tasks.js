const TasksComponent = {
    render: () => {
        const query = (localStorage.getItem('lifeos_tasks_search') || '').toLowerCase();
        const selectedIds = JSON.parse(localStorage.getItem('lifeos_tasks_selected') || '[]');
        const showArchived = localStorage.getItem('tasks_show_archived') === 'true';

        let data = Storage.getData('tasks', true).filter(t => t.deleted === 0);

        if (showArchived) {
            data = data.filter(t => t.archived === 1);
        } else {
            data = data.filter(t => t.archived !== 1);
        }

        data = data.filter(t =>
            t.title.toLowerCase().includes(query) || (t.priority || '').toLowerCase().includes(query)
        ).sort((a,b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            const priorityMap = { 'High': 1, 'Med': 2, 'Low': 3 };
            return (priorityMap[a.priority] || 4) - (priorityMap[b.priority] || 4);
        });

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>✅ Task Management</h1>
                    <div style="display:flex; gap:0.5rem;">
                        <button onclick="TasksComponent.toggleArchivedView()" class="btn-secondary" style="width:auto;">
                            ${showArchived ? 'View Active' : 'View Archived'}
                        </button>
                        <button onclick="TasksComponent.add()" style="width: auto;">+ New Task</button>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 2rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px; position: relative;">
                        <input type="text" id="task-search" placeholder="Search tasks..." value="${query}"
                               oninput="TasksComponent.handleSearch(this.value)" style="margin:0; padding-left:2.5rem;">
                        <span style="position:absolute; left:1rem; top:50%; transform:translateY(-50%); opacity:0.5;">🔍</span>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <button onclick="TasksComponent.toggleBulk()" class="btn-secondary" style="padding:0.6rem 1rem; font-size:0.8rem;">
                            ${selectedIds.length > 0 ? `Selected (${selectedIds.length})` : 'Bulk Select'}
                        </button>
                        ${selectedIds.length > 0 ? `
                            <button onclick="TasksComponent.bulkAction('delete')" class="btn-danger" style="padding:0.6rem 1rem; font-size:0.8rem;">Delete</button>
                            <button onclick="TasksComponent.bulkAction('complete')" class="btn-secondary" style="padding:0.6rem 1rem; font-size:0.8rem;">Complete</button>
                            <button onclick="TasksComponent.bulkAction('archive')" class="btn-secondary" style="padding:0.6rem 1rem; font-size:0.8rem;">Archive</button>
                            <button onclick="TasksComponent.clearSelection()" style="background:transparent; padding:0.6rem; font-size:0.8rem;">×</button>
                        ` : ''}
                    </div>
                </div>

                <div id="task-form" class="card" style="display:none; margin-bottom: 2rem;">
                    <h3>Add New Task</h3>
                    <input type="text" id="task-title" placeholder="What needs to be done?">
                    <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
                        <select id="task-priority" style="flex:1">
                            <option value="Low">Low Priority</option>
                            <option value="Med" selected>Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                        <input type="date" id="task-due" style="flex:1" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button onclick="TasksComponent.save()">Save Task</button>
                    <button onclick="document.getElementById('task-form').style.display='none'" style="background:var(--danger)">Cancel</button>
                </div>

                <div class="grid">
                    ${data.map(item => {
                        const isSelected = selectedIds.includes(item.id);
                        return `
                        <div class="card ${isSelected ? 'selected-card' : ''}"
                             style="border-left: 5px solid ${item.priority === 'High' ? 'var(--danger)' : (item.priority === 'Med' ? 'var(--accent)' : 'var(--primary)')};
                                    opacity: ${item.completed ? 0.6 : 1};
                                    ${isSelected ? 'background: rgba(56, 189, 248, 0.1); border-color: var(--accent);' : ''}">
                            <div style="display:flex; align-items:flex-start; gap:0.8rem;">
                                <input type="checkbox" class="bulk-check" ${isSelected ? 'checked' : ''}
                                       onchange="TasksComponent.toggleSelect('${item.id}')"
                                       style="width:20px; height:20px; margin:0; cursor:pointer; display: ${selectedIds.length > 0 || isSelected ? 'block' : 'none'}">
                                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="TasksComponent.toggleComplete('${item.id}')"
                                       style="width:20px; height:20px; margin:0; cursor:pointer; display: ${selectedIds.length > 0 || isSelected ? 'none' : 'block'}">
                                <div style="flex:1;" onclick="${selectedIds.length > 0 ? `TasksComponent.toggleSelect('${item.id}')` : ''}">
                                    <h3 style="margin:0; text-decoration: ${item.completed ? 'line-through' : 'none'}">${item.title}</h3>
                                    <p style="font-size:0.8rem; margin-top:0.3rem; opacity:0.7;">Due: ${item.due_date || 'No date'} | Priority: ${item.priority}</p>
                                </div>
                                <div style="display:flex; gap:0.3rem;">
                                    <button onclick="TasksComponent.toggleArchive('${item.id}')" class="btn-secondary" style="width:30px; height:30px; padding:0;">
                                        ${item.archived ? '📤' : '📥'}
                                    </button>
                                    <button onclick="TasksComponent.delete('${item.id}')" class="btn-danger" style="width:30px; height:30px; padding:0;">×</button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    },
    add: () => {
        document.getElementById('task-form').style.display = 'block';
        document.getElementById('task-title').focus();
    },
    save: () => {
        const title = document.getElementById('task-title').value;
        const priority = document.getElementById('task-priority').value;
        const due_date = document.getElementById('task-due').value;

        if (title) {
            Storage.saveData('tasks', {
                id: 'task-' + Date.now(),
                title,
                priority,
                due_date,
                completed: 0
            });
            renderCurrentSection();
            Sync.performSync();
        }
    },
    toggleComplete: (id) => {
        const tasks = Storage.getData('tasks', true);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = task.completed ? 0 : 1;
            Storage.saveData('tasks', task);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    delete: (id) => {
        if (confirm('Delete task?')) {
            Storage.deleteData('tasks', id);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    handleSearch: (val) => {
        localStorage.setItem('lifeos_tasks_search', val);
        renderCurrentSection();
    },
    toggleSelect: (id) => {
        let selected = JSON.parse(localStorage.getItem('lifeos_tasks_selected') || '[]');
        if (selected.includes(id)) {
            selected = selected.filter(i => i !== id);
        } else {
            selected.push(id);
        }
        localStorage.setItem('lifeos_tasks_selected', JSON.stringify(selected));
        renderCurrentSection();
    },
    clearSelection: () => {
        localStorage.removeItem('lifeos_tasks_selected');
        renderCurrentSection();
    },
    toggleBulk: () => {
        const selected = JSON.parse(localStorage.getItem('lifeos_tasks_selected') || '[]');
        if (selected.length > 0) {
            TasksComponent.clearSelection();
        } else {
            // Select first item as entry to bulk mode
            const first = Storage.getData('tasks')[0];
            if (first) TasksComponent.toggleSelect(first.id);
        }
    },
    bulkAction: (action) => {
        const selectedIds = JSON.parse(localStorage.getItem('lifeos_tasks_selected') || '[]');
        if (selectedIds.length === 0) return;

        const allTasks = Storage.getData('tasks', true);
        if (action === 'delete') {
            if (!confirm(`Delete ${selectedIds.length} tasks?`)) return;
            selectedIds.forEach(id => Storage.deleteData('tasks', id));
        } else if (action === 'complete') {
            selectedIds.forEach(id => {
                const task = allTasks.find(t => t.id === id);
                if (task) {
                    task.completed = 1;
                    Storage.saveData('tasks', task);
                }
            });
        } else if (action === 'archive') {
            selectedIds.forEach(id => {
                const task = allTasks.find(t => t.id === id);
                if (task) {
                    task.archived = 1;
                    Storage.saveData('tasks', task);
                }
            });
        }

        TasksComponent.clearSelection();
        Sync.performSync();
        renderCurrentSection();
    },
    toggleArchive: (id) => {
        const tasks = Storage.getData('tasks', true);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.archived = task.archived ? 0 : 1;
            Storage.saveData('tasks', task);
            renderCurrentSection();
            Sync.performSync();
        }
    },
    toggleArchivedView: () => {
        const current = localStorage.getItem('tasks_show_archived') === 'true';
        localStorage.setItem('tasks_show_archived', !current);
        renderCurrentSection();
    }
};
