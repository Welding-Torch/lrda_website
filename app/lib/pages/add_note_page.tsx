// AddNotePage.tsx
'use client'
import { useState, useEffect } from "react";
import { Editor, EditorState } from "draft-js";
import 'draft-js/dist/Draft.css';

export default function AddNotePage() {
  const [text, textUpdate] = useState(EditorState.createEmpty());
  const [editor, setEditor] = useState(false);  // New state variable

  // New useEffect to update editor state on component mount
  useEffect(() => {
    setEditor(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="">
        <h1 className="text-blue-500 text-xl">Draft.js Testing Environment</h1>
        <div style={editorStyles}>
          { editor && <Editor editorState={text} onChange={textUpdate} editorKey="editor" /> }
          {/* Conditionally render Editor if editor is true */}
        </div>
      </div>
    </main>
  );
}

const editorStyles = {
  border: '1px solid black',
  padding: '10px',
  borderRadius: '4px',
  minHeight: '200px',
  width: '800px',
  color: 'black',
  backgroundColor: 'white',
};
