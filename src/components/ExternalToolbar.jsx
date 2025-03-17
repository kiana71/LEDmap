import React from 'react';
import { useToolbar } from './NotesArea';
import { CustomToolbar } from './CostomToolbar';

// This component can be placed anywhere in your layout
const ExternalToolbar = ({ className = '' }) => {
  // Get the global editor state from our App component
  const { toolbarVisible, editorState, setEditorState } = useToolbar();
  
  if (!toolbarVisible || !editorState) return null;
  
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