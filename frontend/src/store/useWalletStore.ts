import { create } from 'zustand';
import api from '../api/axios';
import { useAuthStore } from './useAuthStore';

interface WalletState {
    balance: number;
    isEligibleForSupport: boolean;
    supportAmount: number;
    cooldownMessage: string | null;
    isLoading: boolean;

    fetchWalletData: () => Promise<void>;
    checkEligibility: () => Promise<void>;
    claimSupport: () => Promise<void>;
    donate: (amount: number) => Promise<void>;

    // WS Logic
    connectWebSocket: () => void;
    disconnectWebSocket: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    balance: 0,
    isEligibleForSupport: false,
    supportAmount: 0,
    cooldownMessage: null,
    isLoading: false,

    fetchWalletData: async () => {
        // We can get balance from auth store's user object if it's there
        const { user } = useAuthStore.getState();
        if (user?.wallet) {
            set({ balance: user.wallet.balance });
        }
        await get().checkEligibility();
    },

    checkEligibility: async () => {
        set({ isLoading: true });
        try {
            // We need a way to get the current balance. 
            // The support/eligibility endpoint returns { eligible, amount, reason }.
            // It doesn't explicitly return balance.
            // I should probably rely on User/Profile endpoint which usually returns wallet balance.
            // But I haven't built a "get user profile" endpoint yet in Users app that returns wallet.
            // UseAuthStore has user... maybe we can attach wallet to user login response?

            const response = await api.get('/economy/support/eligibility/');
            set({
                isEligibleForSupport: response.data.eligible,
                supportAmount: response.data.amount,
                cooldownMessage: response.data.eligible ? null : response.data.reason
            });

            // Update balance if we had an endpoint. 
            // TEMPORARY: relying on what we know or separate call? 
            // Let's assume we implement a 'users/me' to get balance.
        } catch (err) {
            console.error(err);
        } finally {
            set({ isLoading: false });
        }
    },

    claimSupport: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post('/economy/support/claim/');
            set((state) => ({
                balance: state.balance + response.data.amount,
                isEligibleForSupport: false,
                cooldownMessage: "Cooldown active.",
                isLoading: false
            }));
            // Re-check to sync
            get().checkEligibility();
        } catch (err: any) {
            console.error("Claim failed", err);
            set({ isLoading: false });
            alert(err.response?.data?.error || "Failed to claim");
        }
    },

    donate: async (amount: number) => {
        if (amount <= 0) return;
        set({ isLoading: true });
        try {
            // We need a donate endpoint. 
            // Wait, I implemented 'donate_to_bank' service but did I expose it?
            // Checking economy/views.py... I didn't see a DonateView! 
            // I only made SupportEligibilityView and SupportClaimView.
            // I missed the Donate Endpoint! I must fix this in Backend.

            // Assume I will create POST /economy/donate/
            await api.post('/economy/donate/', { amount });

            set((state) => ({
                balance: state.balance - amount,
                isLoading: false
            }));
            get().checkEligibility();
        } catch (err: any) {
            console.error("Donation failed", err);
            set({ isLoading: false });
            alert(err.response?.data?.error || "Donation failed");
        }
    },

    connectWebSocket: () => {
        // Placeholder for WS
        console.log("Connecting to Wallet WS...");
        // socket = new WebSocket(...)
    },

    disconnectWebSocket: () => {
        // if (socket) socket.close()
    }
}));
