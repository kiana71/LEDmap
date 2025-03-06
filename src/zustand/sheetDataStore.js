import { create } from "zustand";

export const useSheetDataStore = create((set, get) => ({
  selectedScreen: {},
  selectedMediaPlayer: {},
  selectedMount: {},
  selectedReceptacleBox: {},
  
  setSelectedScreen: (value) => 
    set((old) => ({ ...old, selectedScreen: value })),
  setSelectedMediaPlayer: (value) =>
    set((old) => ({ ...old, selectedMediaPlayer: value })),
  setSelectedMount: (value) => 
    set((old) => ({ ...old, selectedMount: value })),
  setSelectedReceptacleBox: (value) =>
    set((old) => ({ ...old, selectedReceptacleBox: value })),

  isHorizontal: true,
  isNiche: true,

  toggleIsHorizontal: () => 
    set(old => ({ ...old, isHorizontal: !old.isHorizontal })),
  toggleIsNiche: () => 
    set(old => ({ ...old, isNiche: !old.isNiche })),

  variantDepth: '',
  setVarientDepth: (val) => 
    set(old => ({ ...old, variantDepth: val })),
floorDistance: '',
setFloorDistance: (val) => 
  set(old => ({ ...old, floorDistance: val })),


  // Receptacle boxes state
  receptacleBoxes: [{
    id: Date.now(),
    x: 205,
    y: 370,
    width: 60,
    height: 60,
  }],
  boxCount: 1,
  activeBoxId: null,
  startPoint: { x: 0, y: 0 },
  startBoxPosition: { x: 0, y: 0 },
  
  // Boundary constants
  BOX_WIDTH: 60,
  BOX_HEIGHT: 60,
  BOX_SPACING: 10,
  INITIAL_X: 205,
  INITIAL_Y: 370,
  BOUNDARY: {
    x: 150,
    y: 150,
    width: 500,
    height: 300
  },
  
  // Methods for receptacle boxes using proper get() access
  incrementBoxCount: () => set(state => {
    if (state.boxCount >= 10) return state; // Maximum 10 boxes
    
    const newCount = state.boxCount + 1;
    const rowCount = Math.floor((newCount - 1) / 10);
    const colCount = (newCount - 1) % 10;
    
    // Calculate position ensuring it's within boundaries
    let x = state.INITIAL_X + (colCount * (state.BOX_WIDTH + state.BOX_SPACING));
    let y = state.INITIAL_Y + (rowCount * (state.BOX_HEIGHT + state.BOX_SPACING));
    
    // Constrain to boundary
    x = Math.max(state.BOUNDARY.x, Math.min(state.BOUNDARY.x + state.BOUNDARY.width - state.BOX_WIDTH, x));
    y = Math.max(state.BOUNDARY.y, Math.min(state.BOUNDARY.y + state.BOUNDARY.height - state.BOX_HEIGHT, y));
    
    const newBox = {
      id: Date.now(),
      x: x,
      y: y,
      width: state.BOX_WIDTH,
      height: state.BOX_HEIGHT
    };
    
    return {
      ...state,
      boxCount: newCount,
      receptacleBoxes: [...state.receptacleBoxes, newBox]
    };
  }),
  
  decrementBoxCount: () => set(state => {
    if (state.boxCount <= 1) return state; // Minimum 1 box
    
    const newCount = state.boxCount - 1;
    return {
      ...state,
      boxCount: newCount,
      receptacleBoxes: state.receptacleBoxes.slice(0, newCount)
    };
  }),
  
  setStartDragInfo: (boxId, startPoint, boxPosition) => set(state => ({
    ...state,
    activeBoxId: boxId,
    startPoint: startPoint,
    startBoxPosition: boxPosition
  })),
  
  updateBoxPosition: (newPoint) => set(state => {
    if (!state.activeBoxId) return state;
    
    const deltaX = newPoint.x - state.startPoint.x;
    const deltaY = newPoint.y - state.startPoint.y;
    
    // Calculate new position
    let newX = state.startBoxPosition.x + deltaX;
    let newY = state.startBoxPosition.y + deltaY;
    
    // Constrain to boundary
    newX = Math.max(state.BOUNDARY.x, Math.min(state.BOUNDARY.x + state.BOUNDARY.width - state.BOX_WIDTH, newX));
    newY = Math.max(state.BOUNDARY.y, Math.min(state.BOUNDARY.y + state.BOUNDARY.height - state.BOX_HEIGHT, newY));
    
    return {
      ...state,
      receptacleBoxes: state.receptacleBoxes.map(box => {
        if (box.id === state.activeBoxId) {
          return {
            ...box,
            x: newX,
            y: newY
          };
        }
        return box;
      })
    };
  }),
  
  endDrag: () => set(state => ({
    ...state,
    activeBoxId: null
  }))
}));