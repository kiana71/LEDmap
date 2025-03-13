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
    isEnabled: isToolbarEnabled(componentId),
    enable: () => enableToolbar(componentId),
    disable: () => disableToolbar(componentId)
  };
};

// Main FloatingToolbar component
const FloatingToolbar = ({ enabledComponents }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selection, setSelection] = useState(null);
  const toolbarRef = useRef(null);
  
  // Format options
  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px"];
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
  
  // Formatting function
  const applyFormatting = (formatType, value) => {
    try {
      if (!selection) return;
      
      const sel = window.getSelection();
      
      // Special handling for lists
      if (formatType === "insertUnorderedList" || formatType === "insertOrderedList") {
        // First, get the contentEditable container
        let node = sel.anchorNode;
        let editableDiv = null;
        
        while (node && !editableDiv) {
          if (node.nodeType === 1 && node.getAttribute && node.getAttribute('contenteditable') === 'true') {
            editableDiv = node;
          }
          node = node.parentNode;
        }
        
        if (editableDiv) {
          // Ensure we have proper structure for lists
          const hasProperStructure = !!editableDiv.querySelector('p, div, h1, h2, h3, h4, h5, h6');
          
          // If no proper structure, wrap content in paragraph
          if (!hasProperStructure) {
            // Save selection
            const range = sel.getRangeAt(0);
            const content = range.cloneContents();
            
            // Create a paragraph and insert it
            const p = document.createElement('p');
            p.appendChild(content);
            range.deleteContents();
            range.insertNode(p);
            
            // Reset selection to within the paragraph
            range.selectNodeContents(p);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        
        // Now apply the list command
        document.execCommand(formatType, false, null);
      } 
      // Handle regular formatting
      else {
        document.execCommand(formatType, false, value);
      }
      
      // Hide toolbar after action
      setTimeout(() => {
        setVisible(false);
      }, 100);
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
          <option key={idx} value={size}>{size}</option>
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