import { create } from 'zustand';

interface CameraScannerStore {
  isActive: boolean;
  setActive: (active: boolean) => void;
}

export const useCameraScannerStore = create<CameraScannerStore>((set) => ({
  isActive: false,
  setActive: (active) => set({ isActive: active }),
}));
