import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../lib/components/navbar";
import { User } from "../lib/models/user_class";
import { act } from "react-dom/test-utils";

interface MockUser extends User {
    getName: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
    getId: jest.Mock;
    hasOnboarded: jest.Mock;
    getRoles: jest.Mock;
  }

jest.mock("../lib/models/user_class", () => {
  return {
    User: {
      getInstance: jest.fn().mockImplementation(() => ({
        getName: jest.fn().mockResolvedValue("John Doe"),
        login: jest.fn(),
        logout: jest.fn(),
        getId: jest.fn(),
        hasOnboarded: jest.fn(),
        getRoles: jest.fn(),
      })),
    },
  };
});

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Navbar Component", () => {
    const userMock = User.getInstance() as unknown as MockUser;

  beforeEach(() => {
    userMock.getName.mockReset();
    userMock.login.mockReset();
    userMock.logout.mockReset();
    window.localStorage.clear();
  });

  it("shows Login when user is not logged in", async () => {
    userMock.getName.mockResolvedValue(null); // Simulate user not logged in

    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });
  });

  it("displays user name when logged in", async () => {
    await act(async () => {
      render(<Navbar />);
    });

    expect(screen.getByText(/Hi, John Doe!/i)).toBeInTheDocument();
    expect(screen.queryByText(/login/i)).toBeNull();
  });

  it("renders correctly", async () => {
    await act(async () => {
      render(<Navbar />);
    });
    expect(screen.getByText(/where's religion?/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

});
