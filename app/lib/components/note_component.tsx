"use client";
import { Textarea } from "@/components/ui/textarea";
import { Editor } from "@/components/plate-ui/editor";
import {
  Plate,
  createDeserializeHtmlPlugin,
  createBlockquotePlugin,
  createDeletePlugin,
  createBoldPlugin,
  createUnderlinePlugin,
  createIndentPlugin,
  createStrikethroughPlugin,
  createItalicPlugin,
  PlateElement,
} from "@udecode/plate";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Note } from "@/app/types";
import { Input } from "@/components/ui/input";
import { slateToHtml, htmlToSlate } from "@slate-serializers/html";
import { Descendant } from "slate";

type NoteEditorProps = {
  note?: Note;
};

type TElement = {
  type: string;
  children: Descendant[];
  // Add any other properties that your elements require
};


export default function NoteEditor({ note }: NoteEditorProps) {
  const [editorContent, setEditorContent] = useState([]);
  const [debugValue, setDebugValue] = useState<any>(editorContent);
  const [title, setTitle] = useState(note?.title || "");
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

      console.log(note.text);
      const serializedToSlate = htmlToSlate(note.text);
      console.log('THIS:',serializedToSlate);
      setEditorContent(serializedToSlate);
    }
  }, [note]);

  const plugins = [
    createDeserializeHtmlPlugin(),
    createBlockquotePlugin(),
    createDeletePlugin(),
    createBoldPlugin(),
    createUnderlinePlugin(),
    createIndentPlugin(),
    createStrikethroughPlugin(),
    createItalicPlugin(),
  ];

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  console.log("THIS GUY: ", editorContent);

  return (
    <div className="flex flex-col h-screen">
      <Input value={title} onChange={handleTitleChange} placeholder="Title" />
      <main className="flex-grow p-6 lg:p-4 w-full">
        <Plate
          value={editorContent}
          plugins={plugins}
          onChange={(newValue) => {
            setDebugValue(newValue);
          }}
        >
          <Editor placeholder="Start Typing Here..." />
        </Plate>
      </main>
    </div>
  );
}
