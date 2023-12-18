"use client";
import {
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  QuoteIcon,
  ChatBubbleIcon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import { ContentState, EditorState, Modifier, RichUtils } from "draft-js";
import { Textarea } from "@/components/ui/textarea"
import { Editor } from "@/components/plate-ui/editor"
import "draft-js/dist/Draft.css";
import { useState, useEffect } from "react";
import { stateFromHTML } from "draft-js-import-html";
import { stateToHTML } from "draft-js-export-html";
import { Button } from "@/components/ui/button";
import { Note } from "@/app/types";
import { Input } from "@/components/ui/input";

type NoteEditorProps = {
  note?: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<any>();
  const [time, setTime] = useState<Date | undefined>();
  const [longitude, setLongitude] = useState<string | undefined>();
  const [latitude, setLatitude] = useState<string | undefined>();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setImages(note.media);
      setTime(note.time);
      setLongitude(note.longitude);
      setLatitude(note.latitude);

      const contentState = stateFromHTML(note.text);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [note]);

  

  const handleKeyCommand = (command: string) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleBold = () => {
    // Check if the current selection is bold
    const currentStyle = editorState.getCurrentInlineStyle();
    const isBold = currentStyle.has("BOLD");
  
    // Toggle the "BOLD" style
    let newEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
  
    // If the selection was already bold, remove the "BOLD" style
    if (isBold) {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
    }
  
    // Set the new editor state
    setEditorState(newEditorState);
  };
  

  const toggleItalic = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };

  const toggleUnderline = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
  };

  const handleTextAlignLeft = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'left'));
  };
  
  const handleTextAlignCenter = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'center'));
  };
  
  const handleTextAlignRight = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'right'));
  };
  
  
  

const handleQuote = () => {
  setEditorState(RichUtils.toggleBlockType(editorState, 'blockquote'));
};

const handleChatBubble = () => {
  // Example: Inserting a custom chat bubble character
  const contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const newContentState = Modifier.insertText(
    contentState,
    selection,
    '💬', // You can replace this with your preferred chat bubble character
  );
  const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
  setEditorState(newEditorState);
};


  const handleListBullet = () => {
    setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
  };


  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <Input
        className="text-3xl font-bold custom-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Title"
      />

      <div className="flex items-center justify-right p-4 bg-gray-200">
        <Button
          onClick={toggleBold}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="Bold"
          
        >
          <FontBoldIcon />
        </Button>
        <Button
          onClick={toggleItalic}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="Italic"
        >
          <FontItalicIcon />
        </Button>
        <Button
          onClick={toggleUnderline}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="Underline"
        >
          <UnderlineIcon />
        </Button>
        <Button
          onClick={handleTextAlignLeft}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="TextAlignLeft"
        >
          <TextAlignLeftIcon />
        </Button>
        <Button
          onClick={handleTextAlignCenter}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="TextAlignCenter"
        >
          <TextAlignCenterIcon />
        </Button>
        <Button
          onClick={handleTextAlignRight}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="TextAlignRight"
        >
          <TextAlignRightIcon />
        </Button>
        <Button
          onClick={handleQuote}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="Quote"
        >
          <QuoteIcon />
        </Button>
        <Button
          onClick={handleChatBubble}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="ChatBubble"
        >
          <ChatBubbleIcon />
        </Button>
        <Button
          onClick={handleListBullet}
          className="mx-2 w-10 h-10 bg-secondary border-black rounded-full text-black"
          data-testid="ListBullet"
        >
          <ListBulletIcon />
        </Button>
        
      </div>
      <main className="flex-grow p-6 lg:p-4 w-full">
        <div className="max-w-full flex-grow overflow-auto">
          <div className="mt-2 border border-black p-4 rounded-lg w-full bg-white">
          <Editor
              value={editorState.getCurrentContent().getPlainText()}
              onChange={(e) => {
              }}
              placeholder="Start writing your notes here . . ."
              spellCheck={true}
              aria-label="Text editor"
              data-testid="editor"
              // Add any additional props you need for the Textarea component
              className="h-screen w-full p-4 border border-black"
            />

          </div>
        </div>
      </main>

    </div>
  );
};


const editorStyles = {
  border: "1px solid black",
  padding: "10px",
  borderRadius: "4px",
  minHeight: "300px",
  width: "100%", 
  color: "black",
  backgroundColor: "white",
  overflow: "auto", 
};

