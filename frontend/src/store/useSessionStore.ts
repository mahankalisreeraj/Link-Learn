import { create } from 'zustand';

interface SessionState {
    sessionId: string | null;
    isActive: boolean;
    duration: number; // in seconds
    isVideoEnabled: boolean;

    startSession: (id: string) => void;
    endSession: () => void;
    incrementDuration: () => void;
    toggleVideo: () => void;
    setVideoEnabled: (enabled: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    sessionId: null,
    isActive: false,
    duration: 0,
    isVideoEnabled: false, // Default off

    startSession: (id) => set({
        sessionId: id,
        isActive: true,
        duration: 0,
        isVideoEnabled: false
    }),

    endSession: () => set({
        isActive: false,
        sessionId: null
        // We keep duration for summary screen if needed, or reset on start
    }),

    incrementDuration: () => set((state) => ({
        duration: state.duration + 1
    })),

    toggleVideo: () => set((state) => ({
        isVideoEnabled: !state.isVideoEnabled
    })),

    setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled })
}));
