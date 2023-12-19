"use client";
import React, { useState, useEffect } from "react";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Input } from "@/components/ui/input";
import { Note } from "@/app/types";

type NoteEditorProps = {
  note?: Note;
};

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.BodyText || '<p>Type your text...</p>',
  });

  useEffect(() => {
    if (note && editor) {
      setTitle(note.title);
      editor.commands.setContent(note.BodyText);
    }
  }, [note, editor]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  if (!editor) {
    return null; // or a loading indicator
  }

  return (
    <div className="flex flex-col h-screen">
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Title"
        className="m-4"
      />
      <div className="flex justify-center space-x-2 p-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">Italic</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="btn">Underline</button>
      </div>
      <main className="flex-grow p-6">
        <div className="overflow-auto">
          <div className="mt-2 border border-black p-4 rounded-lg bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>
    </div>
  );
}
