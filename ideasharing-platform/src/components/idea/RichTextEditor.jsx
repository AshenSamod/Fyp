import React, { useRef, useEffect } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaListUl, 
  FaListOl,
  FaLink,
  FaCode,
  FaRemoveFormat
} from 'react-icons/fa';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, disabled }) => {
  const editorRef = useRef(null);
  const isUserTypingRef = useRef(false);

  // Only update innerHTML when value changes externally (not from user typing)
  useEffect(() => {
    if (editorRef.current && !isUserTypingRef.current) {
      // Only update if the content is different
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isUserTypingRef.current = false;
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = (e) => {
    isUserTypingRef.current = true;
    onChange(e.target.innerHTML);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          <FaBold />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          <FaItalic />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        >
          <FaUnderline />
        </button>
        
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('removeFormat')}
          title="Clear Formatting"
          disabled={disabled}
        >
          <FaRemoveFormat />
        </button>
        
        <div className="toolbar-divider"></div>
        
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
          disabled={disabled}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
          disabled={disabled}
        >
          <FaListOl />
        </button>
        
        <div className="toolbar-divider"></div>
        
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          title="Insert Link"
          disabled={disabled}
        >
          <FaLink />
        </button>
        
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('formatBlock', '<pre>')}
          title="Code Block"
          disabled={disabled}
        >
          <FaCode />
        </button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Enter description...'}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
