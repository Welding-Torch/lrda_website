// note_listview.tsx
import React, { useState, useEffect } from "react";
import { User } from "../models/user_class";
import ApiService from "../utils/api_service";
import { Note } from "../../types";
import { Button } from "@/components/ui/button";
import DataConversion from "../utils/data_conversion";

type NoteListViewProps = {
  onNoteSelect: (note: Note) => void;
};

const NoteListView: React.FC<NoteListViewProps> = ({ onNoteSelect }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [fresh, setFresh] = useState(true);

  useEffect(() => {
    if (notes.length > 0 && fresh) {
      onNoteSelect(notes[0]);
      setFresh(false);
    }
  }, [notes, onNoteSelect]);

  useEffect(() => {
    const fetchNotes = async () => {
      const user = User.getInstance();
      const userId = await user.getId();
      if (userId) {
        try {
          const userNotes = await ApiService.fetchMessages(
            false,
            false,
            userId
          );
          setNotes(DataConversion.convertMediaTypes(userNotes).reverse());
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      }
    };

    fetchNotes();
  }, []);

  const handleLoadText = (note: Note) => {
    onNoteSelect(note);
  };

  return (
    <div className="my-4 flex flex-col">
      {notes.map((note) => {
        return (
          <Button
            key={note.id}
            className="bg-secondary text-primary p-2 m-1"
            onClick={() => handleLoadText(note)}
          >
            <h3 className="text-lg font-semibold">{note.title}</h3>
          </Button>
        );
      })}
    </div>
  );
};

export default NoteListView;
