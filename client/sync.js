const Sync = {
    isSyncing: false,
    lastSyncTime: localStorage.getItem('lifeos_last_sync_time'),

    performSync: async () => {
        if (Sync.isSyncing || !navigator.onLine) return;
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
            // Refresh current UI view if needed
            if (typeof renderCurrentSection === 'function') renderCurrentSection();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            Sync.isSyncing = false;
        }
    },

    initAutoSync: () => {
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
