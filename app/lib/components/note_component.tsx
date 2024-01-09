"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Note } from "@/app/types";
import TimePicker from "./time_picker";
import {
  LinkBubbleMenu,
  RichTextEditor,
  type RichTextEditorRef,
} from "mui-tiptap";
import TagManager from "./tag_manager";
import LocationPicker from "./location_component";
import AudioPicker from "./audio_component";
import { AudioType } from "../models/media_class";
import EditorMenuControls from "./editor_menu_controls";
import useExtensions from "../utils/use_extensions";
import { User } from "../models/user_class";
import ApiService from "../utils/api_service";
import { FileX2, SaveIcon, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const user = User.getInstance();

type NoteEditorProps = {
  note?: Note;
  isNewNote: boolean;
};

export default function NoteEditor({ note: initialNote, isNewNote }: NoteEditorProps) {
  const [note, setNote] = useState<Note | undefined>(initialNote);
  const [editorContent, setEditorContent] = useState<string>(note?.text || "");
  const [title, setTitle] = useState<string>(note?.title || "");
  const [images, setImages] = useState<any[]>(note?.media || []);
  const [time, setTime] = useState<Date>(note?.time || new Date());
  const [audio, setAudio] = useState<AudioType[]>(note?.audio || []);
  const [counter, setCounter] = useState(0);
  const [longitude, setLongitude] = useState<string>(note?.longitude || "");
  const [latitude, setLatitude] = useState<string>(note?.latitude || "");
  const [tags, setTags] = useState<any[]>(note?.tags || []);
  const rteRef = useRef<RichTextEditorRef>(null);
  const extensions = useExtensions({
    placeholder: "Add your own content here...",
  });

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
      setEditorContent(initialNote.text || "");
      setTitle(initialNote.title || "");
      setImages(initialNote.media || []);
      setTime(initialNote.time || new Date());
      setLongitude(initialNote.longitude || "");
      setLatitude(initialNote.latitude || "");
      setTags(initialNote.tags || []);
      setAudio(initialNote.audio || []);
    }
  }, [initialNote]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };


  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setImages(note.media);
      setTime(note.time);
      setLongitude(note.longitude);
      setLatitude(note.latitude);
      setTags(note.tags);
      setAudio(note.audio);
      setCounter(counter + 1);
    }
  }, [note]);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  const onSave = async () => {
    // Create an updated note object from the current state
    const updatedNote: Note = {
      ...note, // Spread the existing note properties
      text: editorContent,
      title,
      media: images,
      time,
      longitude,
      latitude,
      tags,
      audio,
      id: note?.id || "", 
      creator: note?.creator || "", 
    };
  
    try {
      if (isNewNote) {
        await ApiService.writeNewNote(updatedNote); 
        toast("Note Created", {
          description: "Your new note has been successfully created.",
          duration: 2000,
        });
      } else {
        await ApiService.overwriteNote(updatedNote);
        toast("Note Saved", {
          description: "Your note has been successfully saved.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast("Error", {
        description: "Failed to save note. Try again later.",
        duration: 4000,
      });
    }
  };
  
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleLocationChange = (newLongitude: number, newLatitude: number) => {
    setLatitude(newLatitude.toString());
    setLongitude(newLongitude.toString());
  };

  const handleTimeChange = (newDate: Date) => {
    setTime(newDate);
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleDeleteNote = async () => {
    console.log(note);
    if (note?.id) {
      try {
        const userId = await user.getId();
        const success = await ApiService.deleteNoteFromAPI(note.id, userId || "");
        if (success) {
          toast("Note successfully Deleted.", {
            description: "Your note was deleted successfully.",
            duration: 4000,
          });
          return true;
        } else {
          // Handle the case where success is false but not an error thrown
          toast("Error", {
            description: "Unknown error occurred. Please try again later.",
            duration: 4000,
          });
          return false;
        }
      } catch (error) {
        console.error("Error deleting note:", error);
        toast("Error", {
          description: "Failed to delete note. System failure. Try again later.",
          duration: 4000,
        });
        return false;
      }
    } else {
      toast("Error", {
        description: "You must first save your note, before deleting it.",
        duration: 4000,
      });
      return false;
    }
};


  return (
    console.log("Body text: ", note?.text),
    (
      <div className="flex flex-col w-[100%]" key={counter}>
        <div className="flex items-center justify-between mr-6">
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Title"
            style={{
              all: "unset",
              fontSize: "1.5em",
              fontWeight: "bold",
              outline: "none",
              marginLeft: "1.75rem",
              maxWidth: "400px,",
            }}
          />
          <div className="flex w-[220px] bg-popup shadow-sm rounded-md border border-border bg-white pt-2 pb-2 justify-around items-center">
            <button
              className="hover:text-green-500 flex justify-center items-center w-full"
              onClick={onSave}
            
            >
              <SaveIcon className="text-current" />
              <div className="ml-2">Save</div>
            </button>
            <div className="w-1 h-9 bg-border" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="hover:text-red-500 flex justify-center items-center w-full"
                >
                  <FileX2 className="text-current" />
                  <div className="ml-2">Delete</div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteNote()}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <main className="flex-grow p-6">
          <div className="mt-3">
            <AudioPicker audioArray={audio || []} setAudio={setAudio} />
          </div>
          <div className="mt-3">
            <TimePicker
              initialDate={time || new Date()}
              onTimeChange={handleTimeChange}
            />
          </div>
          <div className="mt-3">
            <LocationPicker long={longitude} lat={latitude} onLocationChange={handleLocationChange} />
          </div>
          <div className="mt-3 mb-3">
            <TagManager inputTags={tags} onTagsChange={handleTagsChange} />
          </div>
          <div className="overflow-auto">
            <RichTextEditor
              ref={rteRef}
              extensions={extensions}
              content={editorContent}
              onUpdate={({ editor }) => handleEditorChange(editor.getHTML())}
              renderControls={() => <EditorMenuControls />}
              children={(editor) => {
                if (!editor) return null;
                return (
                  <LinkBubbleMenu editor={editor}>
                    {/* This is where you can add additional elements that should appear in the bubble menu */}
                    {/* For example, you could include pedagogical comments here */}
                  </LinkBubbleMenu>
                );
              }}
            />
          </div>
         
        </main>
      </div>
    )
  );
}
