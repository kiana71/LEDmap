import { create } from "zustand";

export const useSheetDataStore = create((set) => ({
  selectedScreen: {},
  selectedMediaPlayer: {},
  selectedMount: {},
  selectedReceptacleBox: {},
  setSelectedScreen: (value) =>    set((old) => ({ ...old, selectedScreen: value })),
  setSelectedMediaPlayer: (value) =>    set((old) => ({ ...old, selectedMediaPlayer: value })),
  setSelectedMount: (value) => set((old) => ({ ...old, selectedMount: value })),
  setSelectedReceptacleBox: (value) =>    set((old) => ({ ...old, selectedReceptacleBox: value })),

  isHorizontal: true,
  isNiche: true,

  toggleIsHorizontal: ()=>set(old=>({...old, isHorizontal: !old.isHorizontal})),
  toggleIsNiche: ()=>set(old=>({...old, isNiche: !old.isNiche})),

  variantDepth: 0,
  setVarientDepth: (val)=>set(old=>({...old, variantDepth: val})),

  
}));
