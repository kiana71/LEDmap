import React, { useState, useEffect } from 'react';
import TextEditorWithCustomToolbar from './CustomToolbar';

// Create a context for sharing toolbar visibility state across components
export const ToolbarContext = React.createContext({
  toolbarVisible: true,
  toggleToolbar: () => {},
  hideToolbar: () => {},
  showToolbar: () => {}
});

// Create a provider component for the toolbar context
export const ToolbarProvider = ({ children }) => {
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [hideForPrint, setHideForPrint] = useState(false);
  
  const toggleToolbar = () => setToolbarVisible(prev => !prev);
  const hideToolbar = () => setToolbarVisible(false);
  const showToolbar = () => setToolbarVisible(true);
  
  // Handle print events
  useEffect(() => {
    const handleBeforePrint = () => setHideForPrint(true);
    const handleAfterPrint = () => setHideForPrint(false);
    
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  return (
    <ToolbarContext.Provider 
      value={{ 
        toolbarVisible: toolbarVisible && !hideForPrint, 
        toggleToolbar, 
        hideToolbar, 
        showToolbar 
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

// Hook to consume toolbar context
export const useToolbar = () => React.useContext(ToolbarContext);

// The NotesArea component that uses the TextEditorWithCustomToolbar
const NotesArea = () => {
  const [editorContent, setEditorContent] = useState('');
  const { toolbarVisible } = useToolbar();
  
  const handleSave = (content) => {
    setEditorContent(content);
    console.log('Saved content:', content);
    // Here you could save to your backend
  };
  
  return (
    <div className="w-full h-80 flex text-left flex-col mt-0 border-gray-400 border-2">
      <div className="p-4">
        <p className="mb-1 text-xl font-bold">Notes:</p>
      </div>
      
      <div className="flex-grow overflow-auto border-t border-gray-400">
        {/* Editor without its own toolbar */}
        <TextEditorWithCustomToolbar
          initialContent={editorContent}
          onSave={handleSave}
          className="border-0"
          showInternalToolbar={false} // This will hide the internal toolbar
          externalToolbarVisible={toolbarVisible} // Pass the global toolbar state
          height="100%" // Take full height of parent
        />
      </div>
    </div>
  );
};

export default NotesArea;