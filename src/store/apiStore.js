import axios from "axios";
import { create } from "zustand";
import { useSheetDataStore } from "../zustand/sheetDataStore";
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
      }
})

const useApiStore = create((set) => ({
    isLoading: false,
    message: '',
    searchDrawingNo: '',
    infoTableData: {},
    sidebarSettings: {},
    noteArea: '',
    DEFAULT_USER_ID: "default_user",
    savedDrawings: [], // New state for saved drawings list
    showDrawingsList: false, // New stat
    // 
    // 
    // 
     // New function to fetch all drawings
     fetchSavedDrawings: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/api/mapdata');
          // consolloe.log('Received drawings:', response.data);
          set({ 
            savedDrawings: response.data,
            showDrawingsList: true 
          });
          return response.data; // Return the data
        } catch (error) {
          set({ message: `Error fetching drawings: ${error.message}` });
          return []; // Return empty array on error
        } finally {
          set({ isLoading: false });
        }
      },
 // Existing functions...
 saveDrawing: async (data) => {
    set({ isLoading: true });
    try {
   
      //che konam? error darim
      // Get current state from sheetDataStore
      const sheetStore = useSheetDataStore.getState();
      
      // Gather all sidebar settings
      const sidebarSettings = {
        // Selections - only save the identifying fields
        selectedScreen: sheetStore.selectedScreen ? {
          "Screen MFR": sheetStore.selectedScreen["Screen MFR"]
        } : null,
        selectedMediaPlayer: sheetStore.selectedMediaPlayer ? {
          "MFG. PART": sheetStore.selectedMediaPlayer["MFG. PART"]
        } : null,
        selectedMount: sheetStore.selectedMount ? {
          "MFG. PART": sheetStore.selectedMount["MFG. PART"]
        } : null,
        selectedReceptacleBox: sheetStore.selectedReceptacleBox ? {
          "MFG. PART": sheetStore.selectedReceptacleBox["MFG. PART"]
        } : null,
        
        // Boolean values with defaults
        isHorizontal: sheetStore.isHorizontal ?? true,
        isNiche: sheetStore.isNiche ?? true,
        isEdgeToEdge: sheetStore.isEdgeToEdge ?? true,
        isColumnLayout: sheetStore.isColumnLayout ?? false,
        
        // Toggle menu visibility states
        floorLine: sheetStore.floorLine ?? true,
        centreLine: sheetStore.centreLine ?? true,
        woodBacking: sheetStore.woodBacking ?? true,
        receptacleBox: sheetStore.receptacleBox ?? true,
        intendedPosition: sheetStore.intendedPosition ?? true,
        
        // Numeric values with defaults and parsing
        variantDepth: parseFloat(sheetStore.variantDepth) || 0,
        floorDistance: parseFloat(sheetStore.floorDistance) || 20,
        bottomDistance: parseFloat(sheetStore.bottomDistance) || 0,
        leftDistance: parseFloat(sheetStore.leftDistance) || 0,
        boxGap: parseFloat(sheetStore.boxGap) || 0,
        
        // Box settings with defaults
        BOX_WIDTH: parseFloat(sheetStore.BOX_WIDTH) || 6,
        BOX_HEIGHT: parseFloat(sheetStore.BOX_HEIGHT) || 6,
        boxCount: parseInt(sheetStore.boxCount) || 1,
        receptacleBoxes: Array.isArray(sheetStore.receptacleBoxes) ? sheetStore.receptacleBoxes : []
      };

      // Combine with existing data and add sidebarSettings
      const saveData = {
        ...data,
        sidebarSettings,
        infoTable: useApiStore.getState().infoTableData,
        noteArea: useApiStore.getState().noteArea
      };

      const response = await api.post('/api/mapdata', saveData);
      set({ message: 'Drawing saved successfully' });
      // After saving, refresh the list
      useApiStore.getState().fetchSavedDrawings();
    } catch (error) {
      console.error("Error savingggg drawing:", error);
      set({ message: `Error: ${error.message}` });
    } finally {
      set({ isLoading: false });
    }
  },

  loadDrawing: async (drawingNumber, sheetData) => {
    set({ isLoading: true });
    try {

      const response = await api.get(`/api/mapdata/drawing/${drawingNumber}`);
      const { sidebarSettings } = response.data;
      
      // console.log('Loaded sidebarSettings:', sidebarSettings);

      // Update apiStore state
      set({
        infoTableData: response.data.infoTable,
        sidebarSettings: sidebarSettings,
        noteArea: response.data.noteArea,
        message: 'Loading drawing...',
        showDrawingsList: false
      });

      // Update sheetDataStore with sidebar settings
      const sheetStore = useSheetDataStore.getState();
      if (sidebarSettings) {
        // Verify sheet data is available
        if (!sheetData?.sheet1 || !sheetData?.sheet2 || !sheetData?.sheet3 || !sheetData?.sheet4) {
          throw new Error('Sheet data not available. Please try again.');
        }
        
        set({ message: 'Applying settings...' });

        // Set selections first since they affect dimensions
        if (sidebarSettings.selectedScreen && sheetData.sheet1) {
          const fullScreen = sheetData.sheet1.find(
            item => item["Screen MFR"] === sidebarSettings.selectedScreen["Screen MFR"]
          );
          if (fullScreen) {
            sheetStore.setSelectedScreen(fullScreen);
          }
        }

        if (sidebarSettings.selectedMediaPlayer && sheetData.sheet2) {
          const fullMediaPlayer = sheetData.sheet2.find(
            item => item["MFG. PART"] === sidebarSettings.selectedMediaPlayer["MFG. PART"]
          );
          if (fullMediaPlayer) {
            sheetStore.setSelectedMediaPlayer(fullMediaPlayer);
          }
        }

        if (sidebarSettings.selectedMount && sheetData.sheet3) {
          const fullMount = sheetData.sheet3.find(
            item => item["MFG. PART"] === sidebarSettings.selectedMount["MFG. PART"]
          );
          if (fullMount) {
            sheetStore.setSelectedMount(fullMount);
          }
        }

        if (sidebarSettings.selectedReceptacleBox && sheetData.sheet4) {
          const fullReceptacleBox = sheetData.sheet4.find(
            item => item["MFG. PART"] === sidebarSettings.selectedReceptacleBox["MFG. PART"]
          );
          if (fullReceptacleBox) {
            sheetStore.setSelectedReceptacleBox(fullReceptacleBox);
          }
        }

        // Set boolean values
        if (sidebarSettings.isHorizontal !== sheetStore.isHorizontal) {
          sheetStore.toggleIsHorizontal();
        }
        if (sidebarSettings.isNiche !== sheetStore.isNiche) {
          sheetStore.toggleIsNiche();
        }
        if (sidebarSettings.isEdgeToEdge !== sheetStore.isEdgeToEdge) {
          sheetStore.toggleIsEdgeToEdge();
        }
        if (sidebarSettings.isColumnLayout !== sheetStore.isColumnLayout) {
          sheetStore.toggleIsColumnLayout();
        }

        // Set toggle menu visibility states
        if (sidebarSettings.floorLine !== undefined) {
          sheetStore.setFloorLine(sidebarSettings.floorLine);
        }
        if (sidebarSettings.centreLine !== undefined) {
          sheetStore.setCentreLine(sidebarSettings.centreLine);
        }
        if (sidebarSettings.woodBacking !== undefined) {
          sheetStore.setWoodBacking(sidebarSettings.woodBacking);
        }
        if (sidebarSettings.receptacleBox !== undefined) {
          sheetStore.setReceptacleBox(sidebarSettings.receptacleBox);
        }
        if (sidebarSettings.intendedPosition !== undefined) {
          sheetStore.setIntendedPosition(sidebarSettings.intendedPosition);
        }

        // Set basic numeric values
        sheetStore.setVariantDepth(sidebarSettings.variantDepth);
        sheetStore.setFloorDistance(sidebarSettings.floorDistance);
        sheetStore.setLeftDistance(sidebarSettings.leftDistance);
        sheetStore.setBottomDistance(sidebarSettings.bottomDistance);

        // Wait for a moment to ensure all previous updates are processed
        await new Promise(resolve => setTimeout(resolve, 50));

        // Now set box gap and count
        const boxGap = parseFloat(sidebarSettings.boxGap);
        const boxCount = parseInt(sidebarSettings.boxCount, 10);

        // console.log('Setting box gap:', boxGap);
        // console.log('Setting box count:', boxCount);
        //inas ke moheme va nemiad/////////
///////////////////////////////
        // Set box gap first
        sheetStore.setBoxGap(boxGap);

        // Wait for box gap to be applied
        await new Promise(resolve => setTimeout(resolve, 50));

        // Update box positions after setting gap
        sheetStore.updateBoxPositions();

        // Wait for box positions to be updated
        await new Promise(resolve => setTimeout(resolve, 50));

        // Finally set box count
        sheetStore.setBoxCount(boxCount);
// console.log('boxCount:', boxCount);

        // Wait for box count to be applied
        await new Promise(resolve => setTimeout(resolve, 50));

        // Update box positions one last time
        sheetStore.updateBoxPositions();

        // Force a boundary update to ensure everything is properly positioned
        // const currentBoundary = sheetStore.BOUNDARY;
        // sheetStore.updateBoundary(currentBoundary);

        // Log the final state
        // console.log('Final box gap:', sheetStore.boxGap);
        // console.log('Final box count:', sheetStore.boxCount);
        // console.log('Final receptacle boxes:', sheetStore.receptacleBoxes);
      }
      //inam hamoon 2 ta hastan
      //dataye in 2 ta update nemishe vaghti load mizanam
      
      set({ message: 'Drawing loaded successfully' });
    } catch (error) {
      console.error("Error loading drawing:", error);
      set({ message: `Error: ${error.message}` });
      throw error; // Re-throw the error to be caught by the component
    } finally {
      set({ isLoading: false });
    }
  },

 // Setters
 setSearchDrawingNo: (value) => set({ searchDrawingNo: value }),
 setShowDrawingsList: (show) => set({ showDrawingsList: show }),
 setMessage: (msg) => set({ message: msg }),
 setNoteArea: (notes) => set({ noteArea: notes }),
 // ... other setters

 // Add this function
 selectDrawing: async (drawing) => {
    set({ 
        searchDrawingNo: drawing.drawingNumber,
        showDrawingsList: false  // Hide the dropdown after selection
    });
    // Add this line to actually load the drawing data
    await useApiStore.getState().loadDrawing(drawing.drawingNumber);
},

// Sidebar setters
setSidebarSettings: (settings) => set({ sidebarSettings: settings }),

}));

export default useApiStore;