import React, { useState, useRef, useEffect } from 'react';
import { EditorState, RichUtils, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { stateToHTML } from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const TextEditor = ({ initialContent = '', onSave, className = '' }) => {
  // Create initial editor state from HTML if provided
  const createEditorState = () => {
    if (initialContent) {
      const blocksFromHTML = convertFromHTML(initialContent);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  };

  const [editorState, setEditorState] = useState(createEditorState);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const editorRef = useRef(null);

  // Handle editor state changes
  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  // Convert editor content to HTML for saving
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const html = stateToHTML(contentState);
    if (onSave) onSave(html);
  };

  // Apply keyboard shortcuts
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Toggle toolbar visibility
  const toggleToolbar = () => {
    setToolbarVisible(!toolbarVisible);
  };

  // Focus the editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focusEditor();
    }
  }, []);

  // Handle before print event to hide toolbar
  useEffect(() => {
    const handleBeforePrint = () => {
      setToolbarVisible(false);
    };

    const handleAfterPrint = () => {
      setToolbarVisible(true);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Custom toolbar options
  const toolbarOptions = {
    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough'],
    },
    blockType: {
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72],
    },
    fontFamily: {
      options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    textAlign: {
      options: ['left', 'center', 'right', 'justify'],
    },
  };

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Editor container */}
      <div className={`${toolbarVisible ? 'block' : 'hidden print:hidden'} border-b border-gray-300`}>
        <div className="flex justify-between items-center px-2 py-1 bg-gray-50">
          <button 
            onClick={toggleToolbar} 
            className="text-gray-500 hover:text-gray-700"
          >
            {toolbarVisible ? '▲ Hide Toolbar' : '▼ Show Toolbar'}
          </button>
          <button 
            onClick={saveContent} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>

      {/* Rich text editor */}
      <Editor
        ref={editorRef}
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        handleKeyCommand={handleKeyCommand}
        toolbar={toolbarOptions}
        toolbarHidden={!toolbarVisible}
        toolbarClassName="print:hidden"
        wrapperClassName="min-h-[200px]"
        editorClassName="px-4 py-2 min-h-[150px]"
      />

      {/* Print-only editor content */}
      <style jsx global>{`
        @media print {
          .rdw-editor-toolbar,
          .rdw-option-wrapper,
          .toolbar-hidden {
            display: none !important;
          }
          
          .rdw-editor-main {
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TextEditor;