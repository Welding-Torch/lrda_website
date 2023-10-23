import Layout from "../layout";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import NoteComponent from "../lib/components/noteComponent";
import { RichUtils } from 'draft-js';

jest.mock('draft-js', () => ({
  ...jest.requireActual('draft-js'),
  RichUtils: {
    ...jest.requireActual('draft-js').RichUtils,
    toggleInlineStyle: jest.fn(jest.requireActual('draft-js').RichUtils.toggleInlineStyle),
  },
}));

describe("NoteComponent Component", () => {

  it("renders the note component without crashing", () => {
    render(<NoteComponent />);
    expect(screen.getByText("Draft.js Testing Environment")).toBeInTheDocument();
  });

  describe("Button interactions", () => {
    it("toggles bold style when Bold button is clicked", () => {
      render(<NoteComponent />);
      const boldButton = screen.getByText("Bold");
      fireEvent.click(boldButton);
      expect(RichUtils.toggleInlineStyle).toHaveBeenCalledWith(expect.anything(), 'BOLD');
    });

    it("toggles italic style when Italic button is clicked", () => {
      render(<NoteComponent />);
      const italicButton = screen.getByText("Italic");
      fireEvent.click(italicButton);
      expect(RichUtils.toggleInlineStyle).toHaveBeenCalledWith(expect.anything(), 'ITALIC');
    });
  });
});
