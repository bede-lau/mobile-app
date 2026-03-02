import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Language, OnboardingData } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  setOnboardingData: (data: OnboardingData) => void;
  setLanguage: (language: Language) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      setLoading: (isLoading) => set({ isLoading }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setOnboardingData: (data) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferred_language: data.language,
                style_preferences: data.style_preferences,
                height_cm: data.height_cm,
                onboarding_completed: true,
              }
            : null,
        })),

      setLanguage: (language) =>
        set((state) => ({
          user: state.user ? { ...state.user, preferred_language: language } : null,
        })),

      clearUser: () =>
        set({ user: null, session: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'olvon-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist session - it's handled by Supabase's own storage
      partialize: (state) => ({ user: state.user }),
    }
  )
);
