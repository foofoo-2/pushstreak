const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (res: Response) => {
    if (res.status === 401) {
        // If unauthorized, clear token and redirect (or let context handle it)
        // For now, simpler to just clear here to be safe and throw.
        localStorage.removeItem('auth_token');
        // We could dispatch a custom event here if needed, but for now throwing is ok.
        window.location.reload(); // Simple brute force redirect to login
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'API Request Failed' }));
        throw new Error(err.error || 'API Request Failed');
    }
    return res.json();
};

export const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    post: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    put: async (endpoint: string, body: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};
