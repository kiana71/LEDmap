import {create} from 'zustand';

const useDescriptionDataStore = create((set) => ({
  // Initial state
  formData: {
    title: '',
    drawer: '',
    department: '',
    screenSize: '',
    date: '',
  },

  // Action to update form data
  setFormData: (key, value) =>
    set((state) => ({
      formData: { ...state.formData, [key]: value },
    })),
}));

export default useDescriptionDataStore;

