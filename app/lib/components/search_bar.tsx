"use client";
import React, { useState } from "react";
import ApiService from "../utils/api_service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    console.log("Search text:", searchText);
    if (!searchText) {
      console.log("Search text is empty. Aborting search.");
      return;
    }
    try {
      const response = await ApiService.searchMessages(searchText);
      console.log("API Response:", response);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="flex items-center w-min min-w-max">
      <Input
        type="text"
        placeholder="Search..."
        className="border border-gray-300 rounded-md p-2 flex-grow"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Button
        className="px-4 py-2 rounded-md"
        onClick={handleSearch}
        data-testid="search-button"
      >
          <MagnifyingGlassIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default SearchBar;