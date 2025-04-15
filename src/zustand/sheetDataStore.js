import { create } from "zustand";

export const useSheetDataStore = create((set, get) => ({
  
  selectedScreen: {},
  selectedMediaPlayer: {},
  selectedMount: {},
  selectedReceptacleBox: {},
  ledScaleFactor: 10, // Default value, will be updated from Canvas
  
  // Add helper function to check if download should be enabled
  canDownload: () => {
    const state = get();
    return (
      state.selectedScreen?.["Screen MFR"] && 
      state.selectedScreen["Screen MFR"] !== "" &&
      state.selectedMount?.["MFG. PART"] && 
      state.selectedMount["MFG. PART"] !== ""
    );
  },

  setSelectedScreen: (value) =>
    set((old) => ({ ...old, selectedScreen: value })),
  setSelectedMediaPlayer: (value) =>
    set((old) => ({ ...old, selectedMediaPlayer: value })),
  setSelectedMount: (value) =>
    set((old) => ({ ...old, selectedMount: value })),
  setSelectedReceptacleBox: (value) =>
    set((old) => {
      // Log the entire object to see its structure
      console.log('Selected Receptacle Box Data:', value);
      console.log('Object keys:', Object.keys(value || {}));
      
      // Get dimensions from the correct property names
      const width = value && value['Width (in)'] ? parseFloat(value['Width (in)']) : 0;
      const height = value && value['Height (in)'] ? parseFloat(value['Height (in)']) : 0;
      
      console.log('Found dimensions:', { width, height });
      const newdimenhhs = {
        width: width,
        height: height
      }
      const newState = {
        ...old,
        selectedReceptacleBox: value,
        BOX_WIDTH: width,
        BOX_HEIGHT: height
      };
      
      // Force an update of box positions
      setTimeout(() => {
        const store = get();
        if (store.updateBoxPositions) {
          store.updateBoxPositions();
        }
        if (store.repositionBoxes) {
          store.repositionBoxes();
        }
      }, 0);
      
      return newState;
    }),
  
  isHorizontal: true,
  isNiche: true,
  
  toggleIsHorizontal: () =>
    set(old => ({ ...old, isHorizontal: !old.isHorizontal })),

  
  isEdgeToEdge: true,

  toggleIsEdgeToEdge: () =>{
    set(old => ({ ...old, isEdgeToEdge: !old.isEdgeToEdge }))
  },

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

  // Receptacle box settings and controls
  bottomDistance: 0,
  topDistance: 0,
  leftDistance: 0,
  boxGap: 0,
  boxCount: 1,
  receptacleBoxes: [],
  maxBoxesReached: false,
  isAtMaxBottomDistance: false,
  isAtMaxTopDistance: false,
  isAtMaxLeftDistance: false,
  isAtMaxBoxGap: false,
  BOX_WIDTH: 0,
  BOX_HEIGHT: 0,
  isColumnLayout: false,
  
  // Calculate maximum allowed values for box parameters
  calculateMaxValues: () => {
    const state = get();
    const { BOUNDARY, BOX_WIDTH, BOX_HEIGHT, boxCount, ledScaleFactor } = state;
    const boxWidthPx = BOX_WIDTH * ledScaleFactor;
    const boxHeightPx = BOX_HEIGHT * ledScaleFactor;
    const screenWidth = BOUNDARY.width;
    const screenHeight = BOUNDARY.height;
    const currentGapPx = state.boxGap * ledScaleFactor;
    const leftDistancePx = state.leftDistance * ledScaleFactor;
    const availableWidth = screenWidth - leftDistancePx;
    const maxBoxesPerRow = Math.max(1, Math.floor((availableWidth + currentGapPx) / (boxWidthPx + currentGapPx)));
    const rowsNeeded = Math.ceil(boxCount / maxBoxesPerRow);
    const totalRowHeight = (rowsNeeded * boxHeightPx) + ((rowsNeeded - 1) * currentGapPx);
    
    // Calculate maximum distances considering both top and bottom
    const maxBottomDistance = Math.max(0, (screenHeight - totalRowHeight - state.topDistance * ledScaleFactor) / ledScaleFactor);
    const maxTopDistance = Math.max(0, (screenHeight - totalRowHeight - state.bottomDistance * ledScaleFactor) / ledScaleFactor);
    
    const boxesInFirstRow = Math.min(boxCount, maxBoxesPerRow);
    let maxBoxGap = state.boxGap;
    
    if (boxesInFirstRow > 1) {
      const availableGapSpace = availableWidth - (boxesInFirstRow * boxWidthPx);
      const maxGapValue = availableGapSpace / (boxesInFirstRow - 1) / ledScaleFactor;
      maxBoxGap = Math.max(0, maxGapValue);
    }
    
    const spaceNeededForBoxes = (boxesInFirstRow * boxWidthPx) + ((boxesInFirstRow - 1) * currentGapPx);
    const maxLeftDistance = Math.max(0, (screenWidth - spaceNeededForBoxes) / ledScaleFactor);
    
    return {
      maxBottomDistance,
      maxTopDistance,
      maxLeftDistance,
      maxBoxGap,
      isAtMaxBottomDistance: state.bottomDistance >= maxBottomDistance - 0.1,
      isAtMaxTopDistance: state.topDistance >= maxTopDistance - 0.1,
      isAtMaxLeftDistance: state.leftDistance >= maxLeftDistance - 0.1,
      isAtMaxBoxGap: state.boxGap >= maxBoxGap - 0.1
    };
  },
  
  // Set bottom distance with limit check
  setBottomDistance: (val) => set(state => {
    const newVal = Math.max(0, Number(parseFloat(val).toFixed(1)) || 0);
    const { maxBottomDistance } = state.calculateMaxValues();
    const limitedValue = Math.min(newVal, maxBottomDistance);
    return { 
      ...state, 
      bottomDistance: limitedValue,
      isAtMaxBottomDistance: limitedValue >= maxBottomDistance
    };
  }),

  // Set top distance with limit check
  setTopDistance: (val) => set(state => {
    const newVal = Math.max(0, Number(parseFloat(val).toFixed(1)) || 0);
    const { maxTopDistance } = state.calculateMaxValues();
    const limitedValue = Math.min(newVal, maxTopDistance);
    return { 
      ...state, 
      topDistance: limitedValue,
      isAtMaxTopDistance: limitedValue >= maxTopDistance
    };
  }),
  
  // Set left distance with limit check
  setLeftDistance: (val) => set(state => {
    const newVal = Math.max(0, Number(parseFloat(val).toFixed(1)) || 0);
    const { maxLeftDistance } = state.calculateMaxValues();
    const limitedValue = Math.min(newVal, maxLeftDistance);
    return { 
      ...state, 
      leftDistance: limitedValue,
      isAtMaxLeftDistance: limitedValue >= maxLeftDistance
    };
  }),
  
  // Set box gap with limit check
  setBoxGap: (val) => set(state => {
    const newVal = Math.max(0, Number(parseFloat(val).toFixed(1)) || 0);
    const { maxBoxGap } = state.calculateMaxValues();
    const limitedValue = Math.min(newVal, maxBoxGap);
    return { 
      ...state, 
      boxGap: val,
      isAtMaxBoxGap: limitedValue >= maxBoxGap
    };
  }),
  
  // Set box count directly
  setBoxCount: (value) => set(state => {

    const newCount = Math.max(1, Math.floor(value));
    const { positions } = state.calculateBoxPositions();
    const maxBoxes = positions.length;
    const limitedCount = Math.min(newCount, maxBoxes);
    const updatedBoxes = positions.slice(0, limitedCount).map((position, index) => ({
      id: state.receptacleBoxes[index]?.id || Date.now() + index,
      ...position
    }));
   //are meghdare ebtedayi 1 hast. vaghti ziad mikonam set mishan
    
    return {
      ...state,
      boxCount: value,
  
      receptacleBoxes: updatedBoxes,
      maxBoxesReached: limitedCount >= maxBoxes
    };
  }),
  
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
    const { maxBottomDistance, maxTopDistance, maxLeftDistance, maxBoxGap } = updatedState.calculateMaxValues();
    
    return {
      ...updatedState,
      bottomDistance: Math.min(updatedState.bottomDistance, maxBottomDistance),
      topDistance: Math.min(updatedState.topDistance, maxTopDistance),
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
      BOUNDARY,
      BOX_WIDTH,
      BOX_HEIGHT,
      leftDistance,
      bottomDistance,
      topDistance,
      boxGap,
      boxCount,
      isColumnLayout,
      ledScaleFactor
    } = state;

    // Convert inches to pixels based on diagram scale
    const boxWidthPx = BOX_WIDTH * ledScaleFactor;
    const boxHeightPx = BOX_HEIGHT * ledScaleFactor;
    const leftDistancePx = leftDistance * ledScaleFactor;
    const bottomDistancePx = bottomDistance * ledScaleFactor;
    const topDistancePx = topDistance * ledScaleFactor;
    const boxGapPx = boxGap * ledScaleFactor;

    // Calculate usable dimensions
    const usableWidth = BOUNDARY.width - leftDistancePx;
    const usableHeight = BOUNDARY.height - bottomDistancePx - topDistancePx;

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
    
    if (isColumnLayout) {
      // Column-based layout: fill down each column first
      const columnsNeeded = Math.ceil(boxCount / maxRows);
      for (let col = 0; col < columnsNeeded; col++) {
        const boxesInThisColumn = Math.min(boxCount - (col * maxRows), maxRows);
        for (let row = 0; row < boxesInThisColumn; row++) {
          const x = BOUNDARY.x + leftDistancePx + col * (boxWidthPx + boxGapPx);
          const y = BOUNDARY.y + topDistancePx + row * (boxHeightPx + boxGapPx);
          
          positions.push({
            x: x,
            y: y,
            width: boxWidthPx,
            height: boxHeightPx
          });
        }
      }
    } else {
      // Original layout: fill right across rows from bottom
      const rowsNeeded = Math.ceil(boxCount / boxesPerRow);
      for (let row = 0; row < rowsNeeded; row++) {
        const boxesInThisRow = Math.min(boxCount - (row * boxesPerRow), boxesPerRow);
        for (let col = 0; col < boxesInThisRow; col++) {
          const x = BOUNDARY.x + leftDistancePx + col * (boxWidthPx + boxGapPx);
          const y = BOUNDARY.y + BOUNDARY.height - bottomDistancePx - boxHeightPx - row * (boxHeightPx + boxGapPx);
          
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
      name: boxCount === 0 ? 'Box 1' : undefined, // Only first box gets a name
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
    if (state.boxCount <= 1) return state;
    
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
      topDistance,
      boxGap,
      ledScaleFactor
    } = state;
    
    // First get positions based on current settings
    const { positions, maxBoxes } = calculateBoxPositions();
    
    // If we don't have enough positions for all boxes, we need to adjust
    // settings to maintain the current box count
    if (boxCount > positions.length && boxCount > 0) {
      // We have more boxes than positions - try to adjust settings
      const boxWidthPx = BOX_WIDTH * ledScaleFactor;
      const boxHeightPx = BOX_HEIGHT * ledScaleFactor;
      
      // Calculate how many boxes should fit per row to accommodate all boxes
      const screenWidth = BOUNDARY.width;
      const screenHeight = BOUNDARY.height;
      
      // Estimate ideal number of columns
      const idealCols = Math.ceil(Math.sqrt(boxCount));
      const idealRows = Math.ceil(boxCount / idealCols);
      
      // Calculate maximum viable settings
      const adjustedGap = Math.max(0, (screenWidth - (idealCols * boxWidthPx) - (leftDistance * ledScaleFactor)) / Math.max(1, idealCols - 1) / ledScaleFactor);
      const adjustedBottomDistance = Math.max(0, (screenHeight - (idealRows * boxHeightPx) - ((idealRows - 1) * boxGap * ledScaleFactor)) / ledScaleFactor);
      const adjustedTopDistance = Math.max(0, (screenHeight - (idealRows * boxHeightPx) - ((idealRows - 1) * boxGap * ledScaleFactor)) / ledScaleFactor);
      const adjustedLeftDistance = Math.max(0, (screenWidth - (idealCols * boxWidthPx) - ((idealCols - 1) * boxGap * ledScaleFactor)) / ledScaleFactor);
      
      // Update settings with adjusted values to maintain box count
      // (This will trigger another updateBoxPositions call)
      return {
        ...state,
        boxGap: Math.min(boxGap, adjustedGap),
        bottomDistance: Math.min(bottomDistance, adjustedBottomDistance),
        topDistance: Math.min(topDistance, adjustedTopDistance),
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
        name: i === 0 ? 'Box 1' : undefined, // Only first box gets a name
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
    newX = Math.max(state.BOUNDARY.x, Math.min(state.BOUNDARY.x + state.BOUNDARY.width - state.BOX_WIDTH * state.ledScaleFactor, newX));
    newY = Math.max(state.BOUNDARY.y, Math.min(state.BOUNDARY.y + state.BOUNDARY.height - state.BOX_HEIGHT * state.ledScaleFactor, newY));
    
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
  })),

  // Toggle column layout and update box positions
  toggleIsColumnLayout: () => set((state) => {
    const newState = { ...state, isColumnLayout: !state.isColumnLayout };
    const { positions } = state.calculateBoxPositions();
    
    // Update receptacle boxes with new positions while preserving IDs
    newState.receptacleBoxes = positions.map((position, index) => ({
      id: state.receptacleBoxes[index]?.id || Date.now() + index,
      ...position
    }));
    
    return newState;
  }),

  // Add visibility toggles
  floorLine: true,
  centreLine: true,
  woodBacking: true,
  receptacleBox: true,
  intendedPosition: true,

  setFloorLine: (value) => set(state => ({ ...state, floorLine: value })),
  setCentreLine: (value) => set(state => ({ ...state, centreLine: value })),
  setWoodBacking: (value) => set(state => ({ ...state, woodBacking: value })),
  setReceptacleBox: (value) => set(state => ({ ...state, receptacleBox: value })),
  setIntendedPosition: (value) => set(state => ({ ...state, intendedPosition: value })),

  setLedScaleFactor: (value) => set(state => ({ ...state, ledScaleFactor: value })),
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