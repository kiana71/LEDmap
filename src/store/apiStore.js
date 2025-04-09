import axios from "axios";
import { create } from "zustand";
import { useSheetDataStore } from "../zustand/sheetDataStore";

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Create a store that accepts visibility functions
const createApiStore = (visibilityFunctions) => create((set, get) => ({
    isLoading: false,
    message: '',
    searchDrawingNo: '',
    infoTableData: {},
    sidebarSettings: {},
    noteArea: '',
    DEFAULT_USER_ID: "default_user",
    savedDrawings: [], // New state for saved drawings list
    showDrawingsList: false,

    // New function to fetch all drawings
    fetchSavedDrawings: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/api/mapdata');
            set({ 
                savedDrawings: response.data,
                showDrawingsList: true 
            });
            return response.data;
        } catch (error) {
            set({ message: `Error fetching drawings: ${error.message}` });
            return [];
        } finally {
            set({ isLoading: false });
        }
    },

    saveDrawing: async (data) => {
        set({ isLoading: true });
        try {
            const sheetStore = useSheetDataStore.getState();
            const state = get();
            
            const sidebarSettings = {
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
                
                isHorizontal: sheetStore.isHorizontal ?? true,
                isNiche: sheetStore.isNiche ?? true,
                isEdgeToEdge: sheetStore.isEdgeToEdge ?? true,
                isColumnLayout: sheetStore.isColumnLayout ?? false,
                
                floorLine: sheetStore.floorLine ?? true,
                centreLine: sheetStore.centreLine ?? true,
                woodBacking: sheetStore.woodBacking ?? true,
                receptacleBox: sheetStore.receptacleBox ?? true,
                intendedPosition: sheetStore.intendedPosition ?? true,
                
                variantDepth: parseFloat(sheetStore.variantDepth) || 0,
                floorDistance: parseFloat(sheetStore.floorDistance) || 20,
                bottomDistance: parseFloat(sheetStore.bottomDistance) || 0,
                leftDistance: parseFloat(sheetStore.leftDistance) || 0,
                boxGap: parseFloat(sheetStore.boxGap) || 0,
                
                BOX_WIDTH: parseFloat(sheetStore.BOX_WIDTH) || 6,
                BOX_HEIGHT: parseFloat(sheetStore.BOX_HEIGHT) || 6,
                boxCount: parseInt(sheetStore.boxCount) || 1,
                receptacleBoxes: Array.isArray(sheetStore.receptacleBoxes) ? sheetStore.receptacleBoxes : []
            };

            // Ensure infoTable has a drawingNumber
            if (!state.infoTableData.drawingNumber) {
                throw new Error('Drawing number is required');
            }

            const saveData = {
                infoTable: {
                    ...state.infoTableData,
                    drawingNumber: state.infoTableData.drawingNumber
                },
                sidebarSettings,
                noteArea: state.noteArea,
                userId: state.DEFAULT_USER_ID
            };

            const response = await api.post('/api/mapdata', saveData);
            set({ message: 'Drawing saved successfully' });
            // After saving, refresh the list using the store's own method
            await get().fetchSavedDrawings();
        } catch (error) {
            console.error("Error saving drawing:", error);
            set({ message: `Error: ${error.message}` });
            throw error; // Re-throw to be caught by the component
        } finally {
            set({ isLoading: false });
        }
    },

    loadDrawing: async (drawingNumber, sheetData) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/api/mapdata/drawing/${drawingNumber}`);
            const { sidebarSettings, infoTable } = response.data;
            
            // Update apiStore state with the complete infoTable data
            set({
                infoTableData: infoTable, // Set the complete infoTable data
                sidebarSettings: sidebarSettings,
                noteArea: response.data.noteArea,
                message: 'Loading drawing...',
                showDrawingsList: false
            });

            // Get the sheet store to update visibility states
            const sheetStore = useSheetDataStore.getState();

            // Update visibility states in sheetDataStore
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

            // Wait for box count to be applied
            await new Promise(resolve => setTimeout(resolve, 50));

            // Update box positions one last time
            sheetStore.updateBoxPositions();

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
    setInfoTableData: (data) => set({ infoTableData: data }),

    selectDrawing: async (drawing) => {
        const state = get();
        set({ 
            searchDrawingNo: drawing.drawingNumber,
            showDrawingsList: false
        });
        // Use the store's own loadDrawing method
        await state.loadDrawing(drawing.drawingNumber);
    },

    // Sidebar setters
    setSidebarSettings: (settings) => set({ sidebarSettings: settings }),
}));

// Export a function to create the store with visibility functions
export const createApiStoreWithVisibility = (visibilityFunctions) => {
    return createApiStore(visibilityFunctions);
};

// Export a default store instance
export default createApiStore({ toggleVisibility: () => {} });