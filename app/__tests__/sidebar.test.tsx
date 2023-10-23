import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import Sidebar from '../lib/components/side_bar'; // Update the path to your Sidebar component accordingly

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Sidebar Component', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
  });

  it('renders the sidebar correctly', () => {
    render(<Sidebar />);
    // Query for a child element of the sidebar to confirm it's rendered
    const linkElement = screen.getByText('Add Note');
    expect(linkElement).toBeInTheDocument();
  });

  it('displays the "Add Note" link', () => {
    render(<Sidebar />);
    const linkElement = screen.getByText('Add Note');
    expect(linkElement).toBeInTheDocument();
  });


});
