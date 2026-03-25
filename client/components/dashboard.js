const DashboardComponent = {
    render: () => {
        // Fetch values from local storage (synced)
        const incomeItems = Storage.getData('income');
        const expenseItems = Storage.getData('bills');
        const loans = Storage.getData('loans');

        const income = incomeItems.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const expense = expenseItems.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        const balance = income - expense;

        // Net Worth: Assets (Income - Expense) + (Loans Given) - (Loans Taken)
        const loansGiven = loans.filter(l => l.type === 'given' && l.status !== 'Returned').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
        const loansTaken = loans.filter(l => l.type === 'taken' && l.status !== 'Returned').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
        const netWorth = balance + loansGiven - loansTaken;

        setTimeout(() => {
            // Main Overview Chart
            const ctx = document.getElementById('dashboardChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Income', 'Expense', 'Loans Taken'],
                    datasets: [{
                        data: [income, expense, loansTaken],
                        backgroundColor: ['#22c55e', '#f43f5e', '#38bdf8'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { color: 'white', padding: 20 } } }
                }
            });

            // Category Distribution Chart
            const catCtx = document.getElementById('categoryChart').getContext('2d');
            const catData = {};
            expenseItems.forEach(item => {
                const cat = item.category || 'General';
                catData[cat] = (catData[cat] || 0) + (parseFloat(item.amount) || 0);
            });

            new Chart(catCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(catData),
                    datasets: [{
                        data: Object.values(catData),
                        backgroundColor: ['#38bdf8', '#a855f7', '#fbbf24', '#f43f5e', '#22c55e'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
                }
            });
        }, 100);

        const budgets = Storage.getData('budgets');

        const user = JSON.parse(localStorage.getItem('lifeos_user')) || {};
        const recentNotes = Storage.getData('notes').slice(-3).reverse();
        const recentExp = Storage.getData('experience').slice(-3).reverse();
        const totalNotes = Storage.getData('notes').length;
        const totalExp = Storage.getData('experience').length;

        const currentMonth = new Date().toISOString().substring(0, 7);
        const wifiPayments = Storage.getData('wifi_payments').filter(p => p.month === currentMonth);
        const wifiCollected = wifiPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const wifiPending = wifiPayments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        // Upcoming Bills (Unpaid bills in current month or older)
        const unpaidBills = expenseItems.filter(b => {
            const billMonth = (b.date || "").substring(0, 7);
            return billMonth <= currentMonth; // Simple heuristic
        }).slice(-3);

        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Dashboard</h1>
                    <div style="text-align:right;">
                        <span style="opacity: 0.7">Welcome back, <strong>${user.username}</strong></span><br>
                        <span style="font-size:0.8rem; color:var(--accent)">Net Worth: ${formatCurrency(netWorth)}</span>
                    </div>
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
                    <div class="quick-action-btn" onclick="showSection('wifi'); setTimeout(() => WiFiComponent.addClient(), 100)">
                        <svg viewBox="0 0 24 24"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/></svg>
                        <span>Add Billing</span>
                    </div>
                    <div class="quick-action-btn" onclick="Sync.performSync()">
                        <svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
                        <span>Sync Now</span>
                    </div>
                </div>

                <div class="grid" style="margin-top: 2rem;">
                    <div class="card" style="background: linear-gradient(135deg, #22c55e22, transparent); border-left: 5px solid var(--primary)">
                        <h3>Net Worth</h3>
                        <p style="font-size: 2rem; color:var(--primary)">${formatCurrency(netWorth)}</p>
                        <small style="opacity:0.6">Assets + Loans Given - Loans Taken</small>
                    </div>
                    <div class="card" style="background: linear-gradient(135deg, #38bdf822, transparent); border-left: 5px solid var(--accent)">
                        <h3>Monthly Progress</h3>
                        <p style="font-size: 2rem;">${((expense / (income || 1)) * 100).toFixed(0)}%</p>
                        <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; margin-top:0.5rem;">
                            <div style="width:${Math.min((expense / (income || 1)) * 100, 100)}%; height:100%; background:var(--danger); border-radius:4px;"></div>
                        </div>
                        <small style="opacity:0.6">Expense vs Total Income</small>
                    </div>
                </div>

                <h3 style="margin: 3rem 0 1rem;">Service Billing Summary (${currentMonth})</h3>
                <div class="grid">
                    <div class="card" style="border-left: 5px solid var(--primary)">
                        <h3>Collected</h3>
                        <p style="font-size: 1.5rem;">${formatCurrency(wifiCollected)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--danger)">
                        <h3>Pending</h3>
                        <p style="font-size: 1.5rem;">${formatCurrency(wifiPending)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--accent)">
                        <h3>System Stats</h3>
                        <div style="display:flex; gap:1rem; margin-top:0.5rem;">
                            <div><small>Notes:</small> <strong>${totalNotes}</strong></div>
                            <div><small>Exp:</small> <strong>${totalExp}</strong></div>
                        </div>
                    </div>
                </div>

                <h3 style="margin: 3rem 0 1rem;">Unpaid Bills / Recent Expenses</h3>
                <div class="card" style="padding:0; overflow:hidden;">
                    ${unpaidBills.length ? unpaidBills.map(b => `
                        <div style="display:flex; justify-content:space-between; padding:1rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                            <span>${b.name}</span>
                            <span style="color:var(--danger)">${formatCurrency(b.amount)}</span>
                        </div>
                    `).join('') : '<p style="padding:1rem; opacity:0.5;">No recent unpaid bills found.</p>'}
                    <button onclick="showSection('bills')" style="width:100%; background:transparent; border-top:1px solid rgba(255,255,255,0.05); font-size:0.8rem; padding:0.5rem;">View All Bills</button>
                </div>

                <h3 style="margin: 3rem 0 1rem;">Personal Financial Overview</h3>
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
                <div class="grid" style="margin-top: 3rem;">
                    <div class="card">
                        <h3 style="text-align:center; margin-bottom:1rem;">Overview</h3>
                        <canvas id="dashboardChart"></canvas>
                    </div>
                    <div class="card">
                        <h3 style="text-align:center; margin-bottom:1rem;">Expense by Category</h3>
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="card" style="margin-top: 3rem;">
                    <h3>Monthly Budget vs Actual</h3>
                    ${budgets.length ? budgets.map(b => {
                        const actual = expenseItems.filter(e => e.category === b.category).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
                        const percent = Math.min((actual / (b.amount || 1)) * 100, 100);
                        return `
                            <div style="margin-bottom:1.5rem;">
                                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.4rem;">
                                    <span>${b.category}</span>
                                    <span>${formatCurrency(actual)} / ${formatCurrency(b.amount)}</span>
                                </div>
                                <div style="width:100%; height:10px; background:rgba(255,255,255,0.05); border-radius:5px; overflow:hidden;">
                                    <div style="width:${percent}%; height:100%; background:${percent > 90 ? 'var(--danger)' : (percent > 70 ? '#fbbf24' : 'var(--primary)')}; border-radius:5px; transition:width 1s ease-out;"></div>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p style="opacity:0.5;">No budgets set. Go to Settings to define them.</p>'}
                </div>

                <div class="card" style="margin-top: 2rem; background: linear-gradient(135deg, #fbbf2422, transparent); border-left: 5px solid #fbbf24;">
                    <h3>Savings Goal</h3>
                    <p>Target: ${formatCurrency(100000)}</p>
                    <div style="width:100%; height:12px; background:rgba(255,255,255,0.1); border-radius:6px; margin-top:0.8rem;">
                        <div style="width:${Math.min((netWorth / 100000) * 100, 100)}%; height:100%; background:#fbbf24; border-radius:6px; box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);"></div>
                    </div>
                    <p style="text-align:right; font-size:0.8rem; margin-top:0.5rem;">${((netWorth / 100000) * 100).toFixed(1)}% Achieved</p>
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
