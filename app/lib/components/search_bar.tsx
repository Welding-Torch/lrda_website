import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from '../utils/GoogleMapsContext';

type SearchBarProps = {
  onSearch: (address: string, lat?: number, lng?: number) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const { isMapsApiLoaded } = useGoogleMaps();

  const loadAutocompleteService = useCallback(() => {
    console.log('loadAutocompleteService called');
    console.log('window.google:', window.google); // Check if window.google is defined
    if (window.google && window.google.maps && window.google.maps.places) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        console.log('AutocompleteService loaded', autocompleteServiceRef.current); // Log after loading the service
      }
    } else {
      console.log('Google Maps API is not ready.'); // Log if the API is not ready
    }
  }, []);

  useEffect(() => {
    if (isMapsApiLoaded) {
      loadAutocompleteService();
    }
  }, [isMapsApiLoaded, loadAutocompleteService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(query);
    console.log('Handling input change:', query); // Log input change
  
    if (query.length > 2) {
      if (autocompleteServiceRef.current) {
        console.log('AutocompleteService is defined, fetching predictions.'); // Confirm service is loaded
        autocompleteServiceRef.current.getPlacePredictions({ input: query }, (predictions, status) => {
          console.log('getPlacePredictions status:', status); // Log the status of the prediction fetch
          console.log('Predictions:', predictions); // Log the predictions
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
            console.error('Error with getPlacePredictions:', status); // Log an error if the status is not OK
          }
        });
      } else {
        console.error('AutocompleteService is not loaded yet.'); // Log if service is not loaded
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = useCallback((placeId: string) => {
    console.log('Handling suggestion select:', placeId); // Log selection of a suggestion
    if (isMapsApiLoaded) {
      const placesService = new google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails({ placeId }, (result, status) => {
        console.log('getDetails status:', status); // Log the status of the details fetch
        console.log('Place details:', result); // Log the details of the place
        if (status === google.maps.places.PlacesServiceStatus.OK && result && result.geometry && result.geometry.location) {
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          onSearch(result.formatted_address || '', lat, lng);
          setSearchText(result.formatted_address || '');
          setSuggestions([]);
        }
      });
    }
  }, [onSearch, isMapsApiLoaded]);
  

  return (
    <div className="flex flex-col w-full relative">
      <Input
        type="text"
        placeholder="🔍 Search for a place..."
        className="border-2 border-gray-300 focus:border-blue-500 rounded-full py-2 px-4 w-full bg-white shadow-sm transition-all focus:ring-2 focus:ring-blue-300 outline-none"
        value={searchText}
        onChange={handleInputChange}
        aria-label="Search for a place"
        aria-autocomplete="list"
        aria-haspopup="true"
        aria-controls="autocomplete-suggestions"
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul id="autocomplete-suggestions" className="absolute z-10 w-full mt-1 rounded-md bg-white shadow-lg max-h-60 overflow-auto top-full">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer transition-colors"
              onClick={() => handleSelectSuggestion(suggestion.place_id)}
              role="option"
              aria-selected="false"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
  
};

export default SearchBar;
