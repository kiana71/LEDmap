import React from 'react';
import { useToolbar } from './NotesArea';
import { CustomToolbar } from './CustomToolbar'; // Ensure this matches your file name exactly

// This component can be placed anywhere in your layout
const ExternalToolbar = ({ className = '' }) => {
  // Get the global editor state from our context
  const { toolbarVisible, editorState, setEditorState } = useToolbar();
  
  // If toolbar is not visible or there's no editor state yet, don't render
  if (!toolbarVisible || !editorState) {
    return null;
  }
  
  return (
    <div className={`print:hidden ${className}`}>
      <CustomToolbar 
        editorState={editorState}
        setEditorState={setEditorState}
        visible={toolbarVisible}
      />
    </div>
  );
};

export default ExternalToolbar;