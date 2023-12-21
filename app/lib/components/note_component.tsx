"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Note } from "@/app/types";
import TimePicker from "./time_picker";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import StarterKit from "@tiptap/starter-kit";

type NoteEditorProps = {
  note?: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  console.log("Here is my note: ", note);
  const [title, setTitle] = useState(note?.title || "");
  const [images, setImages] = useState(note?.media || []);
  const [time, setTime] = useState(note?.time || new Date());
  const [longitude, setLongitude] = useState(note?.longitude || '');
  const [latitude, setLatitude] = useState(note?.latitude || '');
  const rteRef = useRef<RichTextEditorRef>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setImages(note.media);
      setTime(note.time);
      setLongitude(note.longitude);
      setLatitude(note.latitude);
    
    }
  }, [note]);

  useEffect(() => {
    if (rteRef.current?.editor && note?.text) {
      rteRef.current.editor.commands.setContent(note.text);
    }
    else if (rteRef.current?.editor && !note?.text) {
      rteRef.current.editor.commands.setContent("<p>Type your text...</p>");
    }
  }, [note?.text]);
  

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    console.log("Body text: ", note?.text),
    <div className="flex flex-col h-screen">
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Title"
        className="m-4"
      />
      <main className="flex-grow p-6">
        <TimePicker initialDate={time} onChange={(newTime) => setTime(newTime)} />
        <div className="overflow-auto">
          <RichTextEditor
            ref={rteRef}
            extensions={[StarterKit]}
            content= {"<p>Type your text...</p>"}
            renderControls={() => (
              <MenuControlsContainer>
                <MenuSelectHeading />
                <MenuDivider />
                <MenuButtonBold />
                <MenuButtonItalic />
                {/* Add more controls of your choosing here */}
              </MenuControlsContainer>
            )}
          />
        </div>
      </main>
    </div>
  );
}
