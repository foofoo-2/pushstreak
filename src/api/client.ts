const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },
    post: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },
    put: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    }
};
