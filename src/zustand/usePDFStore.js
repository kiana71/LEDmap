import {create} from 'zustand';
export const usePDFStore = create((set)=>(
    {
        isPDFMode: true,//initial state
        setPDFMode:(value)=>set({isPDFMode:value})
    }
))