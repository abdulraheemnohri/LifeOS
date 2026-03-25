const TasksComponent = {
    render: () => {
        const data = Storage.getData('tasks').sort((a,b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            const priorityMap = { 'High': 1, 'Med': 2, 'Low': 3 };
            return (priorityMap[a.priority] || 4) - (priorityMap[b.priority] || 4);
        });

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>✅ Task Management</h1>
                    <button onclick="TasksComponent.add()" style="width: auto;">+ New Task</button>
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
                    ${data.map(item => `
                        <div class="card" style="border-left: 5px solid ${item.priority === 'High' ? 'var(--danger)' : (item.priority === 'Med' ? 'var(--accent)' : 'var(--primary)')}; opacity: ${item.completed ? 0.6 : 1}">
                            <div style="display:flex; align-items:flex-start; gap:0.8rem;">
                                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="TasksComponent.toggleComplete('${item.id}')" style="width:20px; height:20px; margin:0; cursor:pointer;">
                                <div style="flex:1;">
                                    <h3 style="margin:0; text-decoration: ${item.completed ? 'line-through' : 'none'}">${item.title}</h3>
                                    <p style="font-size:0.8rem; margin-top:0.3rem; opacity:0.7;">Due: ${item.due_date || 'No date'} | Priority: ${item.priority}</p>
                                </div>
                                <button onclick="TasksComponent.delete('${item.id}')" class="delete-btn" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center;">×</button>
                            </div>
                        </div>
                    `).join('')}
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
    }
};
