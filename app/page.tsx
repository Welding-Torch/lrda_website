"use client";
import React, { useState } from "react";
import Sidebar from "./lib/components/side_bar";
import ToolPage from "./lib/components/note_component";
import { Note } from "./types";

export default function Home() {
  const [selectedNote, setSelectedNote] = useState<Note>();

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <main className="relative flex h-screen flex-row p-24">
      <Sidebar onNoteSelect={handleNoteSelect} />
      <div className="flex-1 ml-64">
        <ToolPage note={selectedNote} />
      </div>
    </main>
  );
}

