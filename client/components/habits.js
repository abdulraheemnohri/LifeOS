const HabitsComponent = {
    render: () => {
        const habits = Storage.getData('habits');
        const today = new Date().toISOString().substring(0, 10);
        const logs = Storage.getData('habit_logs').filter(l => l.date === today);

        let html = `
            <div class="glass-card section-header animate-fade-in">
                <div class="header-flex">
                    <h2>🔥 Habit Tracker</h2>
                    <button onclick="HabitsComponent.add()" class="btn-primary">+ New Habit</button>
                </div>
            </div>

            <div class="habit-grid animate-fade-in">
                ${habits.length ? habits.map(h => {
                    const log = logs.find(l => l.habit_id === h.id);
                    const isDone = log && (h.type === 'Yes/No' ? log.status === 'Completed' : log.value >= h.goal_value);
                    const progress = log ? (h.type === 'Numeric' ? (log.value / h.goal_value) * 100 : 100) : 0;

                    return `
                        <div class="glass-card habit-card ${isDone ? 'completed' : ''}" style="border-left-color: ${h.color || 'var(--primary)'}">
                            <div class="habit-header">
                                <div class="habit-icon-circle" style="background: ${h.color || 'var(--primary)'}22; color: ${h.color || 'var(--primary)'}">${h.icon || '✨'}</div>
                                <div class="habit-info">
                                    <h3>${h.name}</h3>
                                    <span class="habit-goal">${h.type === 'Numeric' ? `${log ? log.value : 0} / ${h.goal_value} ${h.unit}` : 'Daily Goal'}</span>
                                </div>
                                <button onclick="HabitsComponent.toggle('${h.id}', '${today}')" class="habit-check-btn ${isDone ? 'checked' : ''}">
                                    ${isDone ? '✓' : '+'}
                                </button>
                            </div>
                            <div class="habit-progress-bg">
                                <div class="habit-progress-bar" style="width: ${Math.min(progress, 100)}%; background: ${h.color || 'var(--primary)'}"></div>
                            </div>
                            <div class="habit-footer">
                                <span class="streak">🔥 0 day streak</span>
                                <div class="actions">
                                    <button onclick="HabitsComponent.edit('${h.id}')" class="btn-icon">✏️</button>
                                    <button onclick="HabitsComponent.delete('${h.id}')" class="btn-icon danger">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="glass-card"><p>No habits tracked. Build better habits by tracking them daily.</p></div>'}
            </div>
        `;
        return html;
    },

    toggle: (id, date) => {
        const habits = Storage.getData('habits');
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const logs = Storage.getData('habit_logs', true);
        let logIndex = logs.findIndex(l => l.habit_id === id && l.date === date);

        if (habit.type === 'Yes/No') {
            if (logIndex > -1) {
                const log = logs[logIndex];
                log.status = log.status === 'Completed' ? 'Pending' : 'Completed';
                log.updated_at = new Date().toISOString();
                log.synced = 0;
                Storage.saveData('habit_logs', log);
            } else {
                Storage.saveData('habit_logs', {
                    id: 'hlog-' + Date.now(),
                    habit_id: id,
                    date: date,
                    status: 'Completed',
                    value: 1
                });
            }
        } else {
            // Numeric toggle (increment by 1 or goal/10)
            const inc = habit.goal_value / 5 || 1;
            if (logIndex > -1) {
                const log = logs[logIndex];
                log.value = (log.value || 0) + inc;
                if (log.value > habit.goal_value) log.value = 0; // Reset cycle
                log.updated_at = new Date().toISOString();
                log.synced = 0;
                Storage.saveData('habit_logs', log);
            } else {
                Storage.saveData('habit_logs', {
                    id: 'hlog-' + Date.now(),
                    habit_id: id,
                    date: date,
                    value: inc,
                    status: 'Partial'
                });
            }
        }
        renderCurrentSection();
    },

    add: () => HabitsComponent.showModal(),
    edit: (id) => {
        const item = Storage.getData('habits').find(h => h.id === id);
        if (item) HabitsComponent.showModal(item);
    },

    delete: (id) => {
        if (confirm('Delete this habit and all its logs?')) {
            Storage.deleteData('habits', id);
            renderCurrentSection();
        }
    },

    showModal: (item = null) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="glass-card modal-content">
                <h2>${item ? 'Edit Habit' : 'New Habit'}</h2>
                <form id="habit-form">
                    <input type="text" id="h-name" placeholder="Habit Name (e.g. Read Books)" value="${item ? item.name : ''}" required>
                    <div class="form-row">
                        <input type="text" id="h-icon" placeholder="Icon (Emoji)" value="${item ? item.icon : '✨'}">
                        <input type="color" id="h-color" value="${item ? item.color : '#22c55e'}" style="height: 45px; padding: 2px;">
                    </div>
                    <select id="h-type" onchange="HabitsComponent.toggleGoalFields()">
                        <option value="Yes/No" ${item && item.type === 'Yes/No' ? 'selected' : ''}>Checkmark (Yes/No)</option>
                        <option value="Numeric" ${item && item.type === 'Numeric' ? 'selected' : ''}>Counter (Number)</option>
                    </select>
                    <div id="goal-fields" style="display: ${item && item.type === 'Numeric' ? 'block' : 'none'}">
                        <div class="form-row">
                            <input type="number" id="h-goal" placeholder="Goal Value" value="${item ? item.goal_value : '1'}">
                            <input type="text" id="h-unit" placeholder="Unit (pages, glass)" value="${item ? item.unit : ''}">
                        </div>
                    </div>

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
                id: item ? item.id : 'hab-' + Date.now(),
                name: document.getElementById('h-name').value,
                icon: document.getElementById('h-icon').value,
                color: document.getElementById('h-color').value,
                type: document.getElementById('h-type').value,
                goal_value: parseFloat(document.getElementById('h-goal').value) || 1,
                unit: document.getElementById('h-unit').value,
                target_days: 'MTWTFSS'
            };
            Storage.saveData('habits', newData);
            modal.remove();
            renderCurrentSection();
        };
    },

    toggleGoalFields: () => {
        const type = document.getElementById('h-type').value;
        document.getElementById('goal-fields').style.display = type === 'Numeric' ? 'block' : 'none';
    }
};
