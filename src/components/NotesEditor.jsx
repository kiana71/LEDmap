// NotesEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import useApiStore from "../store/apiStore";
import { useToolbar } from "../hook/ToolbarContext";

const NotesEditor = ({ componentId }) => {
  const { noteArea, setNoteArea } = useApiStore();
  const editorRef = useRef(null);
  const toolbar = useToolbar(componentId);
  const lastHTMLRef = useRef('');
  const [hasFocus, setHasFocus] = useState(false);
  
  // Initialize toolbar
  useEffect(() => {
    toolbar.enable();
    return () => toolbar.disable();
  }, [toolbar]);

  // Handle initial loading of notes
  useEffect(() => {
    if (editorRef.current) {
      // Only update content if we're not currently editing and content has changed
      if (noteArea && noteArea !== lastHTMLRef.current && !hasFocus) {
        editorRef.current.innerHTML = noteArea;
        lastHTMLRef.current = noteArea;
      }
      
      // Initialize with empty paragraph if needed
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      }
    }
  }, [noteArea, hasFocus]);

  // Handle content changes - update the store when content changes
  const handleInput = (e) => {
    const newHTML = e.currentTarget.innerHTML;
    if (newHTML !== lastHTMLRef.current) {
      lastHTMLRef.current = newHTML;
      
      // Use setTimeout to avoid conflicts with React's event system
      setTimeout(() => {
        setNoteArea(newHTML);
      }, 0);
    }
  };

  // Track focus state
  const handleFocus = () => setHasFocus(true);
  const handleBlur = () => {
    setHasFocus(false);
    // Save content on blur as an extra safety measure
    if (editorRef.current) {
      const finalHTML = editorRef.current.innerHTML;
      if (finalHTML !== lastHTMLRef.current) {
        lastHTMLRef.current = finalHTML;
        setNoteArea(finalHTML);
      }
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    // Prevent Tab from moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // Insert tab character
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0'); // 4 non-breaking spaces
      range.insertNode(tabNode);
      
      // Move cursor after the tab
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <div className="h-[140px] p-4 flex-col relative mb-3">
      <p className="absolute left-3 top-3 text-md font-light underline mb-2">NOTES:</p>
      <div
        ref={editorRef}
        className="absolute top-10 left-3 right-3 bottom-3 overflow-auto notes-editor"
        contentEditable="true"
        suppressContentEditableWarning={true}
        style={{
          outline: "none",
          maxHeight: "100%",
          overflowY: "auto",
          wordWrap: "break-word",
          wordBreak: "break-word",
          direction: "ltr",
          unicodeBidi: "isolate",
          whiteSpace: "pre-wrap",
          textAlign: "left"
        }}
        data-toolbar-enabled={componentId}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      ></div>
    </div>
  );
};

export default NotesEditor;