// Updated useSheetDataStore with structured receptacle box placement

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
  
  // Screen and wall settings
  variantDepth: 0,
  setVariantDepth: (val) => 
    set(old => ({ ...old, variantDepth: parseFloat(val) || 0 })),

  wallWidth: 4, 
  wallHeight: 3, 
  setWallWidth: (val) => 
    set(old => ({ ...old, wallWidth: Math.min(40, Math.max(2, parseFloat(val) || 0)) })),
  
  setWallHeight: (val) => 
    set(old => ({ ...old, wallHeight: Math.min(40, Math.max(2, parseFloat(val) || 0)) })),

  floorDistance: 20,
  setFloorDistance: (val) =>
    set(old => ({ ...old, floorDistance: parseFloat(val) || 0 })),
  
  // Receptacle box settings
  bottomDistance: 0, // Default 5 inches from bottom of LED
  setBottomDistance: (val) =>
    set(old => ({ ...old, bottomDistance: Math.max(0, parseFloat(val) || "") })),

  leftDistance: 0, // Default 1 inches from left of LED
  setLeftDistance: (val) =>
    set(old => ({ ...old, leftDistance: Math.max(0, parseFloat(val) || "") })),

  boxGap: 0, // Default 1 inches gap between boxes
  setBoxGap: (val) =>
    set(old => ({ ...old, boxGap: Math.max(0, parseFloat(val) || "") })),
  
  // Initialize with one box instead of empty array
  receptacleBoxes: [], // Will be populated in initializer function
  boxCount: 1, // Start with 1 box instead of 0
  maxBoxesReached: false, // Flag to indicate if max boxes reached
  activeBoxId: null,
  startPoint: { x: 0, y: 0 },
  startBoxPosition: { x: 0, y: 0 },
  
  // Box dimensions in inches (scaled to pixels in the diagram)
  BOX_WIDTH: 6, // 6 inches wide
  BOX_HEIGHT: 6, // 6 inches tall
  
  // Boundary for dragging
  BOUNDARY: {
    x: 150,
    y: 150,
    width: 500,
    height: 300
  },
  
  // Update boundary based on screen dimensions
  updateBoundary: (newBoundary) => set(state => ({
    ...state,
    BOUNDARY: newBoundary
  })),
  
  // Reposition boxes that are outside boundary
  repositionBoxes: () => set(state => {
    const { BOUNDARY, receptacleBoxes } = state;
    
    const updatedBoxes = receptacleBoxes.map(box => {
      // Check if box is outside boundary
      if (
        box.x < BOUNDARY.x || 
        box.y < BOUNDARY.y || 
        box.x + box.width > BOUNDARY.x + BOUNDARY.width || 
        box.y + box.height > BOUNDARY.y + BOUNDARY.height
      ) {
        // Calculate safe position within boundary
        const safeX = Math.max(
          BOUNDARY.x, 
          Math.min(BOUNDARY.x + BOUNDARY.width - box.width, box.x)
        );
        const safeY = Math.max(
          BOUNDARY.y, 
          Math.min(BOUNDARY.y + BOUNDARY.height - box.height, box.y)
        );
        
        return {
          ...box,
          x: safeX,
          y: safeY
        };
      }
      return box;
    });
    
    return {
      ...state,
      receptacleBoxes: updatedBoxes
    };
  }),
  
  // Calculate possible box positions based on current settings
  calculateBoxPositions: () => {
    const state = get();
    const { 
      BOUNDARY, BOX_WIDTH, BOX_HEIGHT, 
      leftDistance, bottomDistance, boxGap 
    } = state;
    
    // Convert inches to pixels based on diagram scale
    // Note: In your diagram, make sure to use the same scale factor
    const SCALE_FACTOR = 10; // Assuming 10px = 1 inch
    
    const boxWidthPx = BOX_WIDTH * SCALE_FACTOR;
    const boxHeightPx = BOX_HEIGHT * SCALE_FACTOR;
    const leftDistancePx = leftDistance * SCALE_FACTOR;
    const bottomDistancePx = bottomDistance * SCALE_FACTOR;
    const boxGapPx = boxGap * SCALE_FACTOR;
    
    // Calculate usable dimensions
   // Calculate usable dimensions, ensuring we never go outside the boundary
   const usableWidth = BOUNDARY.width - leftDistancePx;
   const usableHeight = BOUNDARY.height - bottomDistancePx;
   
   // Calculate how many complete boxes can fit in a row
  const boxesPerRow = Math.floor(
    usableWidth / (boxWidthPx + boxGapPx)
  );
  
  // Calculate how many complete rows can fit
  const maxRows = Math.floor(
    usableHeight / (boxHeightPx + boxGapPx)
  );
  // Calculate maximum possible boxes
  const maxBoxes = boxesPerRow * maxRows;
  
    // Create array of possible positions
    const positions = [];
  
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < boxesPerRow; col++) {
      // Calculate position (x, y is top-left corner)
      const x = BOUNDARY.x + leftDistancePx + col * (boxWidthPx + boxGapPx);
      
      // Y starts from bottom and goes up
      // FIXED: Ensure the box is completely within the boundary
      const y = (BOUNDARY.y + BOUNDARY.height) - bottomDistancePx - boxHeightPx - row * (boxHeightPx + boxGapPx);
      
      // Verify the box is completely within bounds
      if (
        x >= BOUNDARY.x && 
        y >= BOUNDARY.y && 
        x + boxWidthPx <= BOUNDARY.x + BOUNDARY.width && 
        y + boxHeightPx <= BOUNDARY.y + BOUNDARY.height
      ) {
        positions.push({
          x: x,
          y: y,
          width: boxWidthPx,
          height: boxHeightPx
        });
      }
    }
  }
  
  return {
    positions: positions,
    maxBoxes: positions.length
  };
},
  // Add a box at the next calculated position
  incrementBoxCount: () => set(state => {
    const { boxCount, receptacleBoxes } = state;
    const { positions, maxBoxes } = state.calculateBoxPositions();
    
    // Check if we've reached the maximum number of boxes
    if (boxCount >= maxBoxes) {
      return {
        ...state,
        maxBoxesReached: true
      };
    }
    
    // Get the next position
    const newPos = positions[boxCount];
    
    const newBox = {
      id: Date.now(),
      ...newPos
    };
    
    return {
      ...state,
      boxCount: boxCount + 1,
      receptacleBoxes: [...receptacleBoxes, newBox],
      maxBoxesReached: boxCount + 1 >= maxBoxes
    };
  }),
  
  // Remove the last box
  decrementBoxCount: () => set(state => {
    if (state.boxCount <= 1) return state; // Changed from 0 to 1 to always keep at least one box
    
    const newCount = state.boxCount - 1;
    return {
      ...state,
      boxCount: newCount,
      receptacleBoxes: state.receptacleBoxes.slice(0, newCount),
      maxBoxesReached: false
    };
  }),
  
  // Update box positions when screen or settings change
  updateBoxPositions: () => set(state => {
    const { 
      boxCount, 
      calculateBoxPositions 
    } = state;
    
    const { positions, maxBoxes } = calculateBoxPositions();
    
    // Update positions of existing boxes
    const updatedBoxes = state.receptacleBoxes.map((box, index) => {
      if (index < positions.length) {
        return {
          ...box,
          x: positions[index].x,
          y: positions[index].y,
          width: positions[index].width,
          height: positions[index].height
        };
      }
      return box;
    }).slice(0, Math.min(boxCount, maxBoxes));
    
    return {
      ...state,
      receptacleBoxes: updatedBoxes,
      boxCount: updatedBoxes.length,
      maxBoxesReached: boxCount >= maxBoxes
    };
  }),
  
  // Dragging functionality
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
    newX = Math.max(state.BOUNDARY.x, Math.min(state.BOUNDARY.x + state.BOUNDARY.width - state.BOX_WIDTH * 10, newX));
    newY = Math.max(state.BOUNDARY.y, Math.min(state.BOUNDARY.y + state.BOUNDARY.height - state.BOX_HEIGHT * 10, newY));
    
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

// Initialize the store with one box
const store = useSheetDataStore.getState();
const { positions } = store.calculateBoxPositions();

// Only add a box if positions are available
if (positions && positions.length > 0) {
  const firstPosition = positions[0];
  const initialBox = {
    id: Date.now(),
    ...firstPosition
  };
  
  useSheetDataStore.setState({
    receptacleBoxes: [initialBox]
  });
}