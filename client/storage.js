const Storage = {
    // Basic local storage wrapper for state
    saveState: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getState: (key) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },

    // Data management (offline-first)
    saveData: (table, data) => {
        const existing = Storage.getData(table, true); // Get all including deleted
        const index = existing.findIndex(item => item.id === data.id);

        data.updated_at = new Date().toISOString();
        data.synced = 0;
        data.deleted = 0;

        if (index > -1) {
            existing[index] = data;
        } else {
            data.created_at = data.created_at || new Date().toISOString();
            existing.push(data);
        }

        localStorage.setItem(`lifeos_${table}`, JSON.stringify(existing));
        if (typeof Notifications !== 'undefined') Notifications.show(`Saved to ${table}`);
    },

    getData: (table, includeDeleted = false) => {
        const val = localStorage.getItem(`lifeos_${table}`);
        const data = val ? JSON.parse(val) : [];
        return includeDeleted ? data : data.filter(item => item.deleted !== 1);
    },

    deleteData: (table, id) => {
        const existing = Storage.getData(table, true);
        const index = existing.findIndex(item => item.id === id);
        if (index > -1) {
            existing[index].deleted = 1;
            existing[index].updated_at = new Date().toISOString();
            existing[index].synced = 0;
            localStorage.setItem(`lifeos_${table}`, JSON.stringify(existing));
            if (typeof Notifications !== 'undefined') Notifications.show(`Deleted from ${table}`, 'error');
        }
    },

    getAllForSync: () => {
        const tables = ['income', 'bills', 'loans', 'notes', 'experience', 'tasks', 'wifi_clients', 'wifi_payments', 'billing_types', 'categories', 'bill_categories', 'bill_category_fields', 'budgets'];
        const allData = {};
        tables.forEach(t => {
            const unsynced = Storage.getData(t, true).filter(item => item.synced === 0);
            if (unsynced.length > 0) allData[t] = unsynced;
        });
        return allData;
    },

    markSynced: (results) => {
        // results is { income: { updated: 5 }, notes: { updated: 1 }, ... }
        Object.keys(results).forEach(table => {
            const existing = Storage.getData(table, true);
            existing.forEach(item => {
                if (item.synced === 0) item.synced = 1;
            });
            localStorage.setItem(`lifeos_${table}`, JSON.stringify(existing));
        });
    },

    mergeFromPull: (table, serverData) => {
        const localData = Storage.getData(table, true);
        serverData.forEach(sItem => {
            const lIndex = localData.findIndex(lItem => lItem.id === sItem.id);
            if (lIndex > -1) {
                // Latest wins
                if (new Date(sItem.updated_at) > new Date(localData[lIndex].updated_at)) {
                    localData[lIndex] = { ...sItem, synced: 1 };
                }
            } else {
                localData.push({ ...sItem, synced: 1 });
            }
        });
        localStorage.setItem(`lifeos_${table}`, JSON.stringify(localData));
    }
};
