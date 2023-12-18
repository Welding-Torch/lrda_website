"use client";
import React, { useState, useEffect } from "react";
import { Plate } from '@udecode/plate';
import { PlateEditor } from "@/components/plate-ui/plate-editor";
import { Input } from "@/components/ui/input";
import { Note } from "@/app/types";

type NoteEditorProps = {
  note?: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  // Initialize title from note prop
  const [title, setTitle] = useState(note?.title || '');

  // Convert note text to Plate's initial value format
  const initialValue = note ? [
    {
      type: 'p',
      children: [{ text: note.text }],
    },
  ] : [
    // Default initial value if note is not provided
    {
      type: 'p',
      children: [{ text: note?.text || "" }],
    },
  ];

  useEffect(() => {
    // Update the title state if the note prop changes
    if (note) {
      setTitle(note.title);
    }
  }, [note]);

  const handleEditorChange = (newEditorState) => {
    // This function will update the editor state
    // Depending on Plate's setup, you might need to handle serialization here
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Title"
        className="m-4"
      />
      <main className="flex-grow p-6">
        <div className="overflow-auto">
          <div className="mt-2 border border-black p-4 rounded-lg bg-white">
            {/* Plate editor with initial value set */}
            <PlateEditor/>
          </div>
        </div>
      </main>
      {/* Additional components such as buttons for saving or editing notes can go here */}
    </div>
  );
}
