import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";

function SearchOrders({ orders, onSearchChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
  const searchBoxRef = useRef(null); // Reference for the search box container

  useEffect(() => {
    // const allSuggestions = orders.flatMap((order) =>
    //   order.items.map((item) => item.title)
    // );
    // setSuggestions([...new Set(allSuggestions)]);
  }, [orders]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setFilteredSuggestions([]); // Hide suggestions when clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event) => {
    const input = event.target.value;
    setSearchTerm(input);

    if (input.trim() === "") {
      setFilteredSuggestions([]);
    } else {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }

    onSearchChange(input); // Update search term in parent
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setFilteredSuggestions([]);
    onSearchChange(suggestion); // Trigger search with selected suggestion
  };

  return (
    <div className="relative w-full md:max-w-md" ref={searchBoxRef}>
      <label className="flex h-11 w-full items-center gap-3 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search orders by product"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setFilteredSuggestions(suggestions)}
          className="h-full flex-1 bg-transparent outline-none placeholder:text-gray-400"
        />
      </label>

      {filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchOrders;
