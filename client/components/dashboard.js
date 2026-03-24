const DashboardComponent = {
    render: () => {
        // Fetch values from local storage (synced)
        const income = Storage.getData('income').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const expense = Storage.getData('bills').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const balance = income - expense;

        setTimeout(() => {
            const ctx = document.getElementById('dashboardChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Income', 'Expense'],
                    datasets: [{
                        data: [income, expense],
                        backgroundColor: ['#22c55e', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: 'white' } } }
                }
            });
        }, 100);

        const user = JSON.parse(localStorage.getItem('lifeos_user')) || {};
        const recentNotes = Storage.getData('notes').slice(-3).reverse();
        const recentExp = Storage.getData('experience').slice(-3).reverse();

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Dashboard</h1>
                    <span style="opacity: 0.7">Welcome back, <strong>${user.username}</strong></span>
                </div>

                <h3 style="margin: 2rem 0 1rem;">Quick Actions</h3>
                <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
                    <div class="quick-action-btn" onclick="showSection('income'); setTimeout(() => IncomeComponent.add(), 100)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        <span>Add Income</span>
                    </div>
                    <div class="quick-action-btn" onclick="showSection('notes'); setTimeout(() => NotesComponent.add(), 100)">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        <span>New Note</span>
                    </div>
                    <div class="quick-action-btn" onclick="showSection('experience'); setTimeout(() => ExperienceComponent.add(), 100)">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                        <span>Log Entry</span>
                    </div>
                    <div class="quick-action-btn" onclick="Sync.performSync()">
                        <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                        <span>Sync Now</span>
                    </div>
                </div>

                <h3 style="margin: 3rem 0 1rem;">Financial Overview</h3>
                <div class="grid">
                    <div class="card" style="border-left: 5px solid var(--primary)">
                        <h3>Income</h3>
                        <p style="font-size: 2rem;">${formatCurrency(income)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--danger)">
                        <h3>Expense</h3>
                        <p style="font-size: 2rem;">${formatCurrency(expense)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--accent)">
                        <h3>Balance</h3>
                        <p style="font-size: 2rem;">${formatCurrency(balance)}</p>
                    </div>
                </div>
                <div style="max-width: 300px; margin: 2rem auto;">
                    <canvas id="dashboardChart"></canvas>
                </div>

                <div class="grid" style="margin-top: 3rem;">
                    <div>
                        <h3>Latest Notes</h3>
                        ${recentNotes.length ? recentNotes.map(n => `
                            <div class="card" style="padding: 1rem; margin-bottom: 0.5rem; background: ${n.color}22; border-left: 3px solid ${n.color}">
                                <strong>${n.title}</strong>
                                <p style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.3rem;">${n.content.substring(0, 50)}...</p>
                            </div>
                        `).join('') : '<p style="opacity:0.5">No recent notes.</p>'}
                    </div>
                    <div>
                        <h3>Recent Timeline</h3>
                        ${recentExp.length ? recentExp.map(e => `
                            <div class="card" style="padding: 1rem; margin-bottom: 0.5rem;">
                                <strong>${e.title}</strong>
                                <p style="font-size: 0.8rem; opacity: 0.6;">${e.date}</p>
                            </div>
                        `).join('') : '<p style="opacity:0.5">No recent activity.</p>'}
                    </div>
                </div>
            </div>
        `;
    }
};
