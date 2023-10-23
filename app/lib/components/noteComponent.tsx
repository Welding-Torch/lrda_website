"use client";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { useState, useEffect } from "react";
import { stateToHTML } from 'draft-js-export-html';

export default function NoteComponent() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [plainText, setPlainText] = useState("");
  const [rawHTML, setRawHTML] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setPlainText(editorState.getCurrentContent().getPlainText());
  }, [editorState])

  useEffect(() => {
    // Updates the rawHTML component as the editorState changes
    const html = stateToHTML(editorState.getCurrentContent());
    setRawHTML(html);
  }, [editorState]);
  
  const handleKeyCommand = (command: any) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleBold = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  };

  const toggleItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };

  const toggleUnderline = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="">
        <h1 className="text-blue-500 text-xl">Draft.js Testing Environment</h1>
        <div className="border border-black p-4 rounded-lg">
          <button onClick={toggleBold} className="border border-black p-2 m-1 rounded-md text-black">
            Bold
          </button>
          <button onClick={toggleItalic} className="border border-black p-2 m-1 rounded-md text-black">
            Italic
          </button>
          <button onClick={toggleUnderline} className="border border-black p-2 m-1 rounded-md text-black">
            Underline
          </button>
        </div>
        <div style={editorStyles}>
          {isClient && (
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              handleKeyCommand={handleKeyCommand}
              editorKey="editor"
              placeholder="Start writing your notes here . . ."
              spellCheck={true}
              ariaLabel="Text editor"
              ariaMultiline={true}
            />
          )}
        </div>
      </div>
    </main>
  );
}

const editorStyles = {
  border: "1px solid black",
  padding: "10px",
  borderRadius: "4px",
  minHeight: "300px",
  width: "800px",
  color: "black",
  backgroundColor: "white",
};
