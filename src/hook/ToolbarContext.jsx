import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import ReactDOM from "react-dom";
import "../index.css";

// Create a context to control toolbar availability
export const ToolbarContext = createContext({
  isToolbarEnabled: false,
  enableToolbar: () => {},
  disableToolbar: () => {}
});

// Provider component to wrap your app
export const ToolbarProvider = ({ children }) => {
  const [enabledComponents, setEnabledComponents] = useState(new Set());
  
  const enableToolbar = (componentId) => {
    setEnabledComponents(prev => {
      const updated = new Set(prev);
      updated.add(componentId);
      return updated;
    });
  };
  
  const disableToolbar = (componentId) => {
    setEnabledComponents(prev => {
      const updated = new Set(prev);
      updated.delete(componentId);
      return updated;
    });
  };
  
  const isToolbarEnabled = (componentId) => {
    return enabledComponents.has(componentId);
  };
  
  return (
    <ToolbarContext.Provider value={{ isToolbarEnabled, enableToolbar, disableToolbar }}>
      {children}
      <FloatingToolbar enabledComponents={enabledComponents} />
    </ToolbarContext.Provider>
  );
};

// Hook to use in components that need the toolbar
export const useToolbar = (componentId) => {
  const { isToolbarEnabled, enableToolbar, disableToolbar } = useContext(ToolbarContext);
  
  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      disableToolbar(componentId);
    };
  }, [componentId, disableToolbar]);
  
  return {
    isEnabled: isToolbarEnabled,
    enable: () => enableToolbar(componentId),
    disable: () => disableToolbar(componentId)
  };
};

// Helper to ensure contentEditable has initial structure
export const initializeContentEditable = (element) => {
  if (element && (!element.innerHTML || element.innerHTML.trim() === '')) {
    element.innerHTML = '<p><br></p>';
  }
};

// Main FloatingToolbar component
const FloatingToolbar = ({ enabledComponents }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selection, setSelection] = useState(null);
  const toolbarRef = useRef(null);
  
  // Format options
  const fontSizes = [
    { display: "12px", value: 1 },
    { display: "14px", value: 2 },
    { display: "16px", value: 3 },
    { display: "18px", value: 4 },
    { display: "24px", value: 5 },
    { display: "32px", value: 6 },
    { display: "48px", value: 7 }
  ];
  
  const fontFamilies = [
    "Arial", 
    "Times New Roman", 
    "Helvetica", 
    "Georgia", 
    "Verdana", 
    "Courier New", 
    "Tahoma"
  ];
  
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#FF0000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Green", value: "#008000" },
    { name: "Orange", value: "#FFA500" }
  ];
  
  // Click outside handler to close toolbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Helper to find if node is in an enabled component
  const isInEnabledComponent = (node) => {
    while (node) {
      if (node.nodeType === 1 && node.dataset && node.dataset.toolbarEnabled) {
        return enabledComponents.has(node.dataset.toolbarEnabled);
      }
      node = node.parentNode;
    }
    return false;
  };
  
  // Find if selection is within an editable area
  const getEditableParent = (node) => {
    while (node) {
      if (node.nodeType === 1 && 
          (node.getAttribute("contenteditable") === "true" || 
           node.tagName === "TEXTAREA" || 
           node.tagName === "INPUT")) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };
  
  // Selection handler with FIXED positioning
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (selection.toString().trim().length > 0) {
        try {
          // Get the selected range
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Check if we're in an editable area within an enabled component
          const editableParent = getEditableParent(selection.anchorNode);
          if (!editableParent || !isInEnabledComponent(editableParent)) {
            setVisible(false);
            return;
          }
          
          // Initialize editable area if needed
          if (editableParent.getAttribute("contenteditable") === "true" && 
              (!editableParent.innerHTML || editableParent.innerHTML.trim() === '')) {
            editableParent.innerHTML = '<p><br></p>';
          }
          
          // Store the selection for later use
          setSelection(selection);
          
          // Get toolbar dimensions - use fixed sizes if not available yet
          const toolbarHeight = 40; // Fixed height estimate
          const toolbarWidth = 350; // Fixed width estimate
          
          // Get viewport dimensions
          const viewportWidth = window.innerWidth;
          
          // Start with positioning above the selection
          let top = rect.top - toolbarHeight - 10 + window.scrollY;
          
          // Calculate left position and ensure it stays on screen
          let left = Math.max(20 + (toolbarWidth / 2), rect.left + (rect.width / 2));
          
          // Make sure it doesn't go off the right edge
          const maxLeft = viewportWidth - 20 - (toolbarWidth / 2);
          left = Math.min(left, maxLeft);
          
          setPosition({
            top: top,
            left: left
          });
          
          setVisible(true);
        } catch (err) {
          console.error("Selection handling error:", err);
        }
      }
    };
    
    // Only add the event listeners if there are enabled components
    if (enabledComponents.size > 0) {
      document.addEventListener("mouseup", handleSelection);
      document.addEventListener("keyup", handleSelection);
      
      return () => {
        document.removeEventListener("mouseup", handleSelection);
        document.removeEventListener("keyup", handleSelection);
      };
    }
  }, [enabledComponents]);
  
  // Formatting function with improved list handling
  const applyFormatting = (formatType, value) => {
    try {
      if (!selection) return;
      
      // Get fresh selection (the stored one might be stale)
      const sel = window.getSelection();
      
      // Focus the editable area first to ensure commands work
      const editableParent = getEditableParent(sel.anchorNode);
      if (editableParent) {
        editableParent.focus();
        
        // Add notes-editor class for proper styling if not already there
        if (!editableParent.classList.contains('notes-editor')) {
          editableParent.classList.add('notes-editor');
        }
      }
      
      // Special handling for lists
      if (formatType === "insertUnorderedList" || formatType === "insertOrderedList") {
        if (editableParent && editableParent.getAttribute("contenteditable") === "true") {
          // Get the current selection range
          const range = sel.getRangeAt(0);
          
          // Check if we're in a list already
          let ancestorList = null;
          let node = sel.anchorNode;
          
          // Find if we're in a list element
          while (node && node !== editableParent) {
            if (node.nodeName === 'UL' || node.nodeName === 'OL') {
              ancestorList = node;
              break;
            }
            node = node.parentNode;
          }
          
          if (ancestorList) {
            // We're in a list already, so we want to convert or remove it
            const isOl = ancestorList.nodeName === 'OL';
            const isUl = ancestorList.nodeName === 'UL';
            
            if ((isOl && formatType === "insertOrderedList") || 
                (isUl && formatType === "insertUnorderedList")) {
              // Same list type - remove the list
              document.execCommand('outdent', false, null);
              
              // Sometimes we need to remove list formatting completely
              document.execCommand('formatBlock', false, 'p');
            } else {
              // Convert list type
              const newListType = formatType === "insertOrderedList" ? 'ol' : 'ul';
              const newList = document.createElement(newListType);
              
              // Copy children
              while (ancestorList.firstChild) {
                newList.appendChild(ancestorList.firstChild);
              }
              
              // Replace old list with new list
              ancestorList.parentNode.replaceChild(newList, ancestorList);
              
              // Restore selection
              setTimeout(() => {
                try {
                  sel.removeAllRanges();
                  sel.addRange(range);
                } catch (e) {
                  console.error("Error restoring selection:", e);
                }
              }, 0);
            }
          } else {
            // We're not in a list, so create one
            // First ensure we have a block-level element
            if (!editableParent.querySelector('p, div:not([contenteditable]), h1, h2, h3, h4, h5, h6')) {
              document.execCommand('formatBlock', false, 'p');
            }
            
            // Save the current selection text
            const selectedText = range.toString();
            
            if (selectedText.trim() === '') {
              // If no text is selected, just create a new list with an empty item
              const listTag = formatType === "insertOrderedList" ? 'ol' : 'ul';
              const listEl = document.createElement(listTag);
              const listItem = document.createElement('li');
              listItem.innerHTML = '<br>';
              listEl.appendChild(listItem);
              
              // Insert at cursor
              range.deleteContents();
              range.insertNode(listEl);
              
              // Move cursor into the list item
              const newRange = document.createRange();
              newRange.setStart(listItem, 0);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
            } else {
              // Normal case with selected text - use execCommand
              document.execCommand(formatType, false, null);
            }
          }
        }
      } 
      // Handle regular formatting
      else {
        document.execCommand(formatType, false, value);
      }
      
      // Keep focus on the element
      if (editableParent) {
        editableParent.focus();
      }
      
      // Don't hide toolbar immediately for lists to allow continued formatting
      if (formatType !== "insertUnorderedList" && formatType !== "insertOrderedList") {
        setTimeout(() => {
          setVisible(false);
        }, 100);
      }
    } catch (err) {
      console.error("Formatting error:", err);
    }
  };
  
  // Create portal element
  const createPortalContainer = () => {
    let container = document.getElementById("toolbar-portal");
    if (!container) {
      container = document.createElement("div");
      container.id = "toolbar-portal";
      container.className = "portal-container";
      document.body.appendChild(container);
    }
    return container;
  };
  
  // If not visible or no enabled components, don't render
  if (!visible || enabledComponents.size === 0) return null;
  
  // Render using portal
  const toolbar = (
    <div 
      ref={toolbarRef}
      className="floating-toolbar floating-toolbar-enter"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {/* Font Family Select */}
      <select 
        className="toolbar-select mr-1"
        onChange={(e) => applyFormatting("fontName", e.target.value)}
        value=""
      >
        <option value="" disabled>Font</option>
        {fontFamilies.map((font, idx) => (
          <option key={idx} value={font}>{font}</option>
        ))}
      </select>
      
      {/* Font Size Select */}
      <select 
        className="toolbar-select mr-1"
        onChange={(e) => applyFormatting("fontSize", e.target.value)}
        value=""
      >
        <option value="" disabled>Size</option>
        {fontSizes.map((size, idx) => (
          <option key={idx} value={size.value}>{size.display}</option>
        ))}
      </select>
      
      {/* Color Select */}
      <select 
        className="toolbar-select mr-1"
        onChange={(e) => applyFormatting("foreColor", e.target.value)}
        value=""
      >
        <option value="" disabled>Color</option>
        {colors.map((color, idx) => (
          <option key={idx} value={color.value}>{color.name}</option>
        ))}
      </select>
      
      {/* Style Buttons */}
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("bold")}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("italic")}
        title="Italic"
      >
        <em>I</em>
      </button>
      
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("underline")}
        title="Underline"
      >
        <u>U</u>
      </button>
      
      {/* List Buttons */}
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("insertUnorderedList")}
        title="Bullet List"
      >
        • List
      </button>
      
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("insertOrderedList")}
        title="Numbered List"
      >
        1. List
      </button>
      
      {/* Alignment Buttons */}
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("justifyLeft")}
        title="Align Left"
      >
        ←
      </button>
      
      <button 
        className="toolbar-btn mr-1" 
        onClick={() => applyFormatting("justifyCenter")}
        title="Align Center"
      >
        ↔
      </button>
      
      <button 
        className="toolbar-btn" 
        onClick={() => applyFormatting("justifyRight")}
        title="Align Right"
      >
        →
      </button>
    </div>
  );
  
  return ReactDOM.createPortal(toolbar, createPortalContainer());
};

export default FloatingToolbar;