import { create } from 'zustand';
import api from '../api/axios';

export interface User {
    id: number;
    email: string;
    name: string;
    wallet?: {
        balance: number;
        last_support_claim: string | null;
    };
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login/', { email, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            set({ isAuthenticated: true });
            await get().fetchProfile();
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.detail || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    signup: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/users/signup/', { name, email, password });
            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.email?.[0] || 'Signup failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            set({ isAuthenticated: true });
            try {
                await get().fetchProfile();
            } catch (err) {
                localStorage.removeItem('access_token');
                set({ isAuthenticated: false, user: null });
            }
        }
    },

    fetchProfile: async () => {
        try {
            const response = await api.get('/users/me/');
            set({ user: response.data });
        } catch (err) {
            console.error("Fetch profile failed", err);
            throw err;
        }
    }
}));
