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
        return `
            <div class="glass-card">
                <div class="section-header">
                    <h1>Dashboard</h1>
                    <span>Welcome, ${user.username}</span>
                </div>
                <div class="grid">
                    <div class="card" style="border-left: 5px solid var(--primary)">
                        <h3>Income</h3>
                        <p style="font-size: 2rem;">$${income.toFixed(2)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--danger)">
                        <h3>Expense</h3>
                        <p style="font-size: 2rem;">$${expense.toFixed(2)}</p>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--accent)">
                        <h3>Balance</h3>
                        <p style="font-size: 2rem;">$${balance.toFixed(2)}</p>
                    </div>
                </div>
                <div style="max-width: 300px; margin: 2rem auto;">
                    <canvas id="dashboardChart"></canvas>
                </div>
            </div>
        `;
    }
};
