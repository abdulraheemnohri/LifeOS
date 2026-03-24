const API = {
    getBaseUrl: () => localStorage.getItem('lifeos_server_url') || '',
    getToken: () => localStorage.getItem('lifeos_token') || sessionStorage.getItem('lifeos_token'),

    request: async (path, options = {}) => {
        const baseUrl = API.getBaseUrl();
        const token = API.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Handle expired token
            logout();
            throw new Error('Unauthorized');
        }

        return response.json();
    },

    login: (username, password, serverIp) => {
        return fetch(`${serverIp}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        }).then(res => res.json());
    },

    getDashboard: () => API.request('/api/dashboard'),

    pushSync: (data) => API.request('/api/sync/push', {
        method: 'POST',
        body: JSON.stringify({ data })
    }),

    pullSync: (lastSync) => API.request(`/api/sync/pull?lastSync=${lastSync || ''}`),

    changePassword: (currentPassword, newPassword) => API.request('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    }),

    updateProfile: (profileData) => API.request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    }),

    checkUpdate: async () => {
        const CURRENT_VERSION = '1.0.0';
        // Configurable GitHub RAW URL for version.json
        const GITHUB_VERSION_URL = 'https://raw.githubusercontent.com/abdulraheemnohri/LifeOS/main/version.json';

        try {
            const response = await fetch(GITHUB_VERSION_URL, { cache: 'no-store' });
            if (!response.ok) return null;
            const res = await response.json();

            if (res.version !== CURRENT_VERSION) {
                return res;
            }
            return null;
        } catch (e) {
            console.warn('Update check failed:', e);
            return null;
        }
    }
};
