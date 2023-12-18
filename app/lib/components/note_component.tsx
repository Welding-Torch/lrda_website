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
import { Textarea } from "@/components/ui/textarea"
import BasicEditor from "@/components/plate-ui/basic_editor";
import { useEditorState, Plate } from '@udecode/plate';
import { useState, useEffect } from "react";
import { stateFromHTML } from "draft-js-import-html";
import { Button } from "@/components/ui/button";
import { Note } from "@/app/types";
import { Input } from "@/components/ui/input";

type NoteEditorProps = {
  note?: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [editor] = useState(useEditorState(note?.text || ''));
  const [title, setTitle] = useState(note?.title || '');
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
    }
  }, [note]);

  const handleEditorChange = (newEditorState) => {
    // Update your editor state
  };

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
    <Input
      value={title}
      onChange={handleTitleChange}
      placeholder="Title"
    />
    <main className="flex-grow p-6 lg:p-4 w-full">
      <div className="max-w-full flex-grow overflow-auto">
        <div className="mt-2 border border-black p-4 rounded-lg w-full bg-white">
          <BasicEditor
            editor={editor}
            onChange={handleEditorChange} 
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

