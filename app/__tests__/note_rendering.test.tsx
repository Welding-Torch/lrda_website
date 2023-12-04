import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ToolPage from "../lib/components/note_component";

describe("ToolPage", () => {
  const testNote = {
    id: "1",
    title: "Test Note",
    text: "<p>Test content for the note</p>",
    time: new Date("2023-01-01T12:00:00"),
    media: [],
    audio: [],
    creator: "test_creator",
    latitude: "34.0522",
    longitude: "-118.2437",
    published: false,
    tags: ["test", "note"],
  };

  it("initializes the editor with provided note content", async () => {
    render(<ToolPage note={testNote} />);

    // Use a regex for partial matching and to ignore case
    const content = await screen.findByText(/test content/i);
    expect(content).toBeInTheDocument();
  });

  it("updates editor content when note prop changes", async () => {
    const updatedNote = {
      id: "2",
      title: "Updated Title",
      text: "<p>Updated content for the note</p>",
      time: new Date(),
      media: [],
      audio: [],
      creator: "updated_creator",
      latitude: "40.7128",
      longitude: "-74.0060",
      published: false,
      tags: ["updated", "note"],
    };

    const { rerender } = render(<ToolPage note={testNote} />);

    const initialContent = await screen.findByText(/test content/i);
    expect(initialContent).toBeInTheDocument();

    rerender(<ToolPage note={updatedNote} />);

    const updatedContent = await screen.findByText(/updated content/i);
    expect(updatedContent).toBeInTheDocument();
  });
});
