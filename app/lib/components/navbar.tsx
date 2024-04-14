"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "../models/user_class";
import { Button } from "@/components/ui/button";

const user = User.getInstance();

export default function Navbar() {
  const [name, setName] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await user.logout();
      localStorage.removeItem(name || "");

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const userName = await user.getName();
        setName(userName);

        if (userName) {
          const item = localStorage.getItem(userName);
          if (item) {
            await user.login(userName, item);
          }
        }
      } catch (error) {
        console.log("No user cached or login failed");
      }
    };

    fetchName();
  }, []);

  return (
    <nav className="bg-gray-900 w-full h-[10vh] flex flex-row justify-between items-center px-6 py-3 text-white">
      <div className="flex w-full justify-start">
      <Link legacyBehavior href="/" passHref>
        <a id="createNoteButton" className="text-2xl font-bold text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out mr-4">
        Where's Religion
        </a>
      </Link>

        {name ? (
          <Link legacyBehavior href="/lib/pages/notes" passHref>
            <a className="text-2xl font-bold text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out mr-4">
              Create a Note
            </a>
          </Link>
        ) : null}

        { <Link legacyBehavior href="/lib/pages/aboutPage" passHref>
          <a className="text-2xl font-bold text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out mr-4">
            About
          </a>
        </Link> }

        <Link legacyBehavior href="/lib/pages/map" passHref>
          <a className="text-2xl font-bold text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out mr-4">
            Explore
          </a>
        </Link>
    

        <Button
        className="text-2xl font-bold text-blue-300 hover:text-blue-500 transition duration-300 ease-in-out mr-4"
      >
        Tour
      </Button>
        </div>
      
      <div className="">
        {name ? (
          <div className="flex items-center gap-6 w-full">
            <span
              className="text-lg font-semibold min-w-max truncate max-w-[150px] hover:underline cursor-pointer"
              title={name}
            >
              Hi, {name}!
            </span>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => (window.location.href = "/lib/pages/loginPage")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
}
