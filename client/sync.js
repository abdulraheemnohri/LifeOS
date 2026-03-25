const Sync = {
    isSyncing: false,
    lastSyncTime: localStorage.getItem('lifeos_last_sync_time'),

    generateMonthlyBills: () => {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const lastGenerated = localStorage.getItem('lifeos_recurring_last_gen');

        if (lastGenerated !== currentMonth) {
            // Clone recurring income
            const incomes = Storage.getData('income');
            incomes.filter(i => i.is_recurring && i.date.substring(0, 7) < currentMonth).forEach(i => {
                const newId = 'inc-' + Date.now() + Math.random();
                Storage.saveData('income', { ...i, id: newId, date: currentMonth + i.date.substring(7) });
            });

            // Clone recurring bills
            const bills = Storage.getData('bills');
            bills.filter(b => b.is_recurring && b.date.substring(0, 7) < currentMonth).forEach(b => {
                const newId = 'bill-' + Date.now() + Math.random();
                Storage.saveData('bills', { ...b, id: newId, date: currentMonth + b.date.substring(7) });
            });

            localStorage.setItem('lifeos_recurring_last_gen', currentMonth);
        }

        const billingTypes = Storage.getData('billing_types');
        const clients = Storage.getData('wifi_clients');
        const wifiLastGenerated = localStorage.getItem('lifeos_wifi_last_gen');

        if (wifiLastGenerated === currentMonth) return;

        clients.forEach(client => {
            const type = billingTypes.find(t => t.id === client.type_id);
            if (type && type.type === 'Variable') return; // Don't auto-gen variable bills

            const payments = Storage.getData('wifi_payments');
            const exists = payments.find(p => p.client_id === client.id && p.month === currentMonth);

            if (!exists) {
                Storage.saveData('wifi_payments', {
                    id: `pay-${client.id}-${currentMonth}`,
                    client_id: client.id,
                    month: currentMonth,
                    amount: client.monthly_rate,
                    status: 'Pending',
                    date_paid: ''
                });
            }
        });

        localStorage.setItem('lifeos_wifi_last_gen', currentMonth);
    },

    performSync: async () => {
        const isLocal = localStorage.getItem('lifeos_mode') === 'local';
        const serverUrl = localStorage.getItem('lifeos_server_url');

        if (isLocal || !serverUrl || Sync.isSyncing || !navigator.onLine) return;

        Sync.isSyncing = true;
        console.log('Syncing starting...');

        try {
            // Step 1: Push local changes to server
            const localData = Storage.getAllForSync();
            if (Object.keys(localData).length > 0) {
                const pushResult = await API.pushSync(localData);
                if (pushResult.results) {
                    Storage.markSynced(pushResult.results);
                }
            }

            // Step 2: Pull latest data from server
            const pullResult = await API.pullSync(Sync.lastSyncTime);
            if (pullResult.data) {
                Object.keys(pullResult.data).forEach(table => {
                    Storage.mergeFromPull(table, pullResult.data[table]);
                });
                Sync.lastSyncTime = pullResult.lastSync;
                localStorage.setItem('lifeos_last_sync_time', Sync.lastSyncTime);
            }

            console.log('Sync completed successfully.');
            if (typeof Notifications !== 'undefined') Notifications.show('Data Synced', 'info');
            // Refresh current UI view if needed
            if (typeof renderCurrentSection === 'function') renderCurrentSection();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            Sync.isSyncing = false;
        }
    },

    initAutoSync: () => {
        Sync.generateMonthlyBills();

        // Clear any existing sync interval
        if (Sync.syncInterval) clearInterval(Sync.syncInterval);

        const freq = parseInt(localStorage.getItem('lifeos_sync_freq') || '30000');

        // Set new interval
        Sync.syncInterval = setInterval(Sync.performSync, freq);

        // When coming online
        window.addEventListener('online', Sync.performSync);

        // Trigger initial sync
        Sync.performSync();
    }
};
