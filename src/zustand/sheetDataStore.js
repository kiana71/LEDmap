// Updated useSheetDataStore with structured receptacle box placement
// Added limits to prevent boxes from being pushed outside the boundary

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
  
isEditMode: false,
setIsEditMode: (val) => set(old => ({ ...old, isEditMode: val })),

  // Receptacle box settings
  bottomDistance: 0,
  leftDistance: 0,
  boxGap: 0,
  
  // Calculate maximum allowed values for box parameters to prevent pushing boxes outside boundary
  calculateMaxValues: () => {
    const state = get();
    const { BOUNDARY, BOX_WIDTH, BOX_HEIGHT, boxCount } = state;
    
    // Calculate maximum allowable values based on current box count and boundary dimensions
    const SCALE_FACTOR = 10;
    const boxWidthPx = BOX_WIDTH * SCALE_FACTOR;
    const boxHeightPx = BOX_HEIGHT * SCALE_FACTOR;
    
    // Get raw screen dimensions
    const screenWidth = BOUNDARY.width;
    const screenHeight = BOUNDARY.height;
    
    // First, determine how many boxes can fit horizontally with current gap and left distance
    // This helps ensure we properly constrain the gap increase
    const currentGapPx = state.boxGap * SCALE_FACTOR;
    const leftDistancePx = state.leftDistance * SCALE_FACTOR;
    
    // Calculate available width for boxes
    const availableWidth = screenWidth - leftDistancePx;
    
    // Calculate how many boxes fit in one row with current settings
    // Use Math.max to avoid division by zero
    const maxBoxesPerRow = Math.max(1, Math.floor(
      (availableWidth + currentGapPx) / (boxWidthPx + currentGapPx)
    ));
    
    // Calculate rows needed for current box count
    const rowsNeeded = Math.ceil(boxCount / maxBoxesPerRow);
    
    // Calculate maximum bottom distance
    const totalRowHeight = (rowsNeeded * boxHeightPx) + ((rowsNeeded - 1) * currentGapPx);
    const maxBottomDistance = Math.max(0, (screenHeight - totalRowHeight) / SCALE_FACTOR);
    
    // For the maximum gap, we need to ensure all current boxes still fit
    // First, calculate how much horizontal space is available
    const usableWidth = screenWidth - leftDistancePx;
    
    // Calculate max gap that would still fit all boxes in the first row
    // We take the minimum of boxCount and maxBoxesPerRow to consider only the boxes in the first row
    const boxesInFirstRow = Math.min(boxCount, maxBoxesPerRow);
    
    let maxBoxGap = state.boxGap; // Default to current value
    
    if (boxesInFirstRow > 1) {
      // Calculate available space between boxes
      const availableGapSpace = usableWidth - (boxesInFirstRow * boxWidthPx);
      
      // Calculate maximum gap that allows all boxes to fit
      const maxGapValue = availableGapSpace / (boxesInFirstRow - 1) / SCALE_FACTOR;
      
      maxBoxGap = Math.max(0, maxGapValue);
    }
    
    // For left distance, calculate the maximum that would still allow all boxes in the first row to fit
    const spaceNeededForBoxes = (boxesInFirstRow * boxWidthPx) + ((boxesInFirstRow - 1) * currentGapPx);
    const maxLeftDistance = Math.max(0, (screenWidth - spaceNeededForBoxes) / SCALE_FACTOR);
    
    // Calculate if we're at max values
    const isAtMaxBottomDistance = state.bottomDistance >= maxBottomDistance - 0.1; // Add small tolerance
    const isAtMaxLeftDistance = state.leftDistance >= maxLeftDistance - 0.1;
    const isAtMaxBoxGap = state.boxGap >= maxBoxGap - 0.1;
    
    return {
      maxBottomDistance,
      maxLeftDistance,
      maxBoxGap,
      isAtMaxBottomDistance,
      isAtMaxLeftDistance,
      isAtMaxBoxGap
    };
  },
  
  // Flags to indicate if we've reached maximum values
  isAtMaxBottomDistance: false,
  isAtMaxLeftDistance: false,  
  isAtMaxBoxGap: false,
  
  // Set bottom distance with limit check
  setBottomDistance: (val) => set(state => {
    const newVal = Math.max(0, parseFloat(val) || 0);
    
    // Calculate max allowed value based on current configuration
    const { maxBottomDistance, isAtMaxBottomDistance } = state.calculateMaxValues();
    
    // Use the smaller of the requested value or the maximum allowed
    const limitedValue = Math.min(newVal, maxBottomDistance);
    
    return { 
      ...state, 
      bottomDistance: limitedValue,
      isAtMaxBottomDistance: limitedValue >= maxBottomDistance
    };
  }),
  
  // Set left distance with limit check
  setLeftDistance: (val) => set(state => {
    const newVal = Math.max(0, parseFloat(val) || 0);
    
    // Calculate max allowed value based on current configuration
    const { maxLeftDistance, isAtMaxLeftDistance } = state.calculateMaxValues();
    
    // Use the smaller of the requested value or the maximum allowed
    const limitedValue = Math.min(newVal, maxLeftDistance);
    
    return { 
      ...state, 
      leftDistance: limitedValue,
      isAtMaxLeftDistance: limitedValue >= maxLeftDistance
    };
  }),
  
  // Set box gap with limit check
  setBoxGap: (val) => set(state => {
    const newVal = Math.max(0, parseFloat(val) || 0);
    
    // Calculate max allowed value based on current configuration
    const { maxBoxGap, isAtMaxBoxGap } = state.calculateMaxValues();
    
    // Use the smaller of the requested value or the maximum allowed
    const limitedValue = Math.min(newVal, maxBoxGap);
    
    return { 
      ...state, 
      boxGap: limitedValue,
      isAtMaxBoxGap: limitedValue >= maxBoxGap
    };
  }),
  
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
  updateBoundary: (newBoundary) => set(state => {
    // Update boundary
    const updatedState = {
      ...state,
      BOUNDARY: newBoundary
    };
    
    // After updating boundary, adjust box parameters if needed
    const { maxBottomDistance, maxLeftDistance, maxBoxGap } = updatedState.calculateMaxValues();
    
    return {
      ...updatedState,
      bottomDistance: Math.min(updatedState.bottomDistance, maxBottomDistance),
      leftDistance: Math.min(updatedState.leftDistance, maxLeftDistance),
      boxGap: Math.min(updatedState.boxGap, maxBoxGap)
    };
  }),
  
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
      leftDistance, bottomDistance, boxGap,
      boxCount 
    } = state;
    
    // Convert inches to pixels based on diagram scale
    const SCALE_FACTOR = 10; // Assuming 10px = 1 inch
    
    const boxWidthPx = BOX_WIDTH * SCALE_FACTOR;
    const boxHeightPx = BOX_HEIGHT * SCALE_FACTOR;
    const leftDistancePx = leftDistance * SCALE_FACTOR;
    const bottomDistancePx = bottomDistance * SCALE_FACTOR;
    const boxGapPx = boxGap * SCALE_FACTOR;
    
    // Calculate usable dimensions
    const usableWidth = BOUNDARY.width - leftDistancePx;
    const usableHeight = BOUNDARY.height - bottomDistancePx;
    
    // Calculate how many boxes can fit per row with current gap
    const boxesPerRow = Math.max(1, Math.floor(
      (usableWidth + boxGapPx) / (boxWidthPx + boxGapPx)
    ));
    
    // Calculate how many rows can fit
    const maxRows = Math.max(1, Math.floor(
      (usableHeight + boxGapPx) / (boxHeightPx + boxGapPx)
    ));
    
    // Maximum possible boxes
    const maxBoxes = boxesPerRow * maxRows;
    
    // Create array of positions
    const positions = [];
    
    // Calculate how many rows we actually need based on current box count
    const rowsNeeded = Math.ceil(Math.min(boxCount, maxBoxes) / boxesPerRow);
    
    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < boxesPerRow; col++) {
        // Calculate position (x, y is top-left corner)
        const x = BOUNDARY.x + leftDistancePx + col * (boxWidthPx + boxGapPx);
        
        // Y starts from bottom and goes up
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
          
          // If we have enough positions for the current box count, we can stop
          if (positions.length >= boxCount) {
            break;
          }
        }
      }
      
      // Check if we have enough positions
      if (positions.length >= boxCount) {
        break;
      }
    }
    
    return {
      positions: positions,
      maxBoxes: maxBoxes
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
      calculateBoxPositions,
      BOUNDARY,
      BOX_WIDTH,
      BOX_HEIGHT,
      leftDistance,
      bottomDistance,
      boxGap
    } = state;
    
    // First get positions based on current settings
    const { positions, maxBoxes } = calculateBoxPositions();
    
    // If we don't have enough positions for all boxes, we need to adjust
    // settings to maintain the current box count
    if (boxCount > positions.length && boxCount > 0) {
      // We have more boxes than positions - try to adjust settings
      const SCALE_FACTOR = 10;
      const boxWidthPx = BOX_WIDTH * SCALE_FACTOR;
      const boxHeightPx = BOX_HEIGHT * SCALE_FACTOR;
      
      // Calculate how many boxes should fit per row to accommodate all boxes
      const screenWidth = BOUNDARY.width;
      const screenHeight = BOUNDARY.height;
      
      // Estimate ideal number of columns
      const idealCols = Math.ceil(Math.sqrt(boxCount));
      const idealRows = Math.ceil(boxCount / idealCols);
      
      // Calculate maximum viable settings
      const adjustedGap = Math.max(0, (screenWidth - (idealCols * boxWidthPx) - (leftDistance * SCALE_FACTOR)) / Math.max(1, idealCols - 1) / SCALE_FACTOR);
      const adjustedBottomDistance = Math.max(0, (screenHeight - (idealRows * boxHeightPx) - ((idealRows - 1) * boxGap * SCALE_FACTOR)) / SCALE_FACTOR);
      const adjustedLeftDistance = Math.max(0, (screenWidth - (idealCols * boxWidthPx) - ((idealCols - 1) * boxGap * SCALE_FACTOR)) / SCALE_FACTOR);
      
      // Update settings with adjusted values to maintain box count
      // (This will trigger another updateBoxPositions call)
      return {
        ...state,
        boxGap: Math.min(boxGap, adjustedGap),
        bottomDistance: Math.min(bottomDistance, adjustedBottomDistance),
        leftDistance: Math.min(leftDistance, adjustedLeftDistance)
      };
    }
    
    // For safety, determine the desired box count
    const desiredBoxCount = Math.min(boxCount, positions.length);
    
    // Create array for updated boxes
    const updatedBoxes = [];
    
    // Use existing boxes where possible, create new ones if needed
    for (let i = 0; i < desiredBoxCount; i++) {
      const existingBox = state.receptacleBoxes[i] || { id: Date.now() + i };
      const position = positions[i];
      
      // Skip if position is undefined (shouldn't happen, but for safety)
      if (!position) continue;
      
      updatedBoxes.push({
        ...existingBox,
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height
      });
    }
    
    return {
      ...state,
      receptacleBoxes: updatedBoxes,
      boxCount: updatedBoxes.length,
      maxBoxesReached: desiredBoxCount >= maxBoxes
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

