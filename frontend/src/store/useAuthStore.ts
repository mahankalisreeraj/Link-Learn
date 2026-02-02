import { create } from 'zustand';
import api from '../api/axios';

interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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

            set({ isAuthenticated: true, isLoading: false });

            // Ideally fetch user profile here if needed, but for now we just set auth
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
            // Auto login after signup not implemented in backend yet or simply require relogin
            // For UX, let's just finish and let component redirect
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

    checkAuth: () => {
        // Simple check for existence of token
        set({ isAuthenticated: !!localStorage.getItem('access_token') });
    }
}));
