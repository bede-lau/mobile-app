import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BodyMeasurements, ScanStatus } from '@/types';

interface AvatarState {
  avatarUrl: string | null;
  glbUrl: string | null;
  scanId: string | null;
  scanStatus: ScanStatus;
  scanProgress: number; // 0–12 frames captured
  measurements: BodyMeasurements | null;
  capturedImages: string[];

  setAvatarUrl: (url: string | null) => void;
  setGlbUrl: (url: string | null) => void;
  setScanId: (id: string | null) => void;
  setScanStatus: (status: ScanStatus) => void;
  setScanProgress: (progress: number) => void;
  setMeasurements: (measurements: BodyMeasurements | null) => void;
  addCapturedImage: (uri: string) => void;
  clearCapturedImages: () => void;
  startProcessing: () => void;
  resetScan: () => void;
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      avatarUrl: null,
      glbUrl: null,
      scanId: null,
      scanStatus: 'idle',
      scanProgress: 0,
      measurements: null,
      capturedImages: [],

      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      setGlbUrl: (glbUrl) => set({ glbUrl }),
      setScanId: (scanId) => set({ scanId }),
      setScanStatus: (scanStatus) => set({ scanStatus }),
      setScanProgress: (scanProgress) => set({ scanProgress }),
      setMeasurements: (measurements) => set({ measurements }),

      addCapturedImage: (uri) =>
        set((state) => ({
          capturedImages: [...state.capturedImages, uri],
          scanProgress: state.capturedImages.length + 1,
        })),

      clearCapturedImages: () => set({ capturedImages: [], scanProgress: 0 }),

      startProcessing: () => {
        const { capturedImages } = get();
        if (capturedImages.length === 0) return;
        set({ scanStatus: 'processing' });
        // TODO: Upload images to backend for 3D reconstruction
        // This will be handled by the GPU worker service
      },

      resetScan: () =>
        set({
          scanId: null,
          scanStatus: 'idle',
          scanProgress: 0,
          capturedImages: [],
        }),
    }),
    {
      name: 'olvon-avatar-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        avatarUrl: state.avatarUrl,
        glbUrl: state.glbUrl,
        measurements: state.measurements,
      }),
    }
  )
);
