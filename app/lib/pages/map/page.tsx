"use client";
import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, Libraries } from "@react-google-maps/api";
import SearchBar from "../../components/search_bar";
import { Note } from "@/app/types";
import ApiService from "../../utils/api_service";
import DataConversion from "../../utils/data_conversion";
import { User } from "../../models/user_class";
import ClickableNote from "../../components/click_note_card";
import { Switch } from "@/components/ui/switch";
import {
  CompassIcon,
  GlobeIcon,
  LocateIcon,
  Navigation,
  UserIcon,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";

const mapAPIKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
const libraries: Libraries = ["places", "maps"];

interface Location {
  lat: number;
  lng: number;
}

interface Refs {
  [key: string]: HTMLElement | undefined;
}

const Page = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [personalNotes, setPersonalNotes] = useState<Note[]>([]);
  const [globalNotes, setGlobalNotes] = useState<Note[]>([]);
  const [global, setGlobal] = useState(true);
  const [mapCenter, setMapCenter] = useState<Location>({
    lat: 38.005984,
    lng: -24.334449,
  });
  const [mapZoom, setMapZoom] = useState(2);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [locationFound, setLocationFound] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [markers, setMarkers] = useState(new Map());
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(
    null
  );
  const mapRef = useRef<google.maps.Map>();
  const [emptyRegion, setEmptyRegion] = useState(false);
  const noteRefs = useRef<Refs>({});
  const [currentPopup, setCurrentPopup] = useState<any | null>(null);

  const user = User.getInstance();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const defaultLocation = await getLocation();
        setMapCenter(defaultLocation as Location);
        setMapZoom(10);
        setLocationFound(true);
      } catch (error) {
        const defaultLocation = { lat: 38.637334, lng: -90.286021 };
        setMapCenter(defaultLocation as Location);
        setMapZoom(10);
        setLocationFound(true);
        console.log("Failed to fetch the location", error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (map) {
      const mapClickListener = map.addListener("click", () => {
        setActiveNote(null);
      });

      const mapDragListener = map.addListener("dragstart", () => {
        setActiveNote(null);
      });

      return () => {
        google.maps.event.removeListener(mapClickListener);
        google.maps.event.removeListener(mapDragListener);
      };
    }
  }, []);

  useEffect(() => {
    const currentNotes = global ? globalNotes : personalNotes;
    updateFilteredNotes(mapCenter, mapBounds, currentNotes);
  }, [mapCenter, mapZoom, mapBounds, globalNotes, personalNotes, global]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const mapClickListener = map.addListener("click", handleMapClick);
      return () => google.maps.event.removeListener(mapClickListener);
    }
  }, []);

  useEffect(() => {
    markers.forEach((marker, noteId) => {
      const isHovered = hoveredNoteId === noteId;
      marker.setIcon(createMarkerIcon(isHovered));
      marker.setZIndex(isHovered ? google.maps.Marker.MAX_ZINDEX + 1 : null);
    });
  }, [hoveredNoteId, markers]);

  useEffect(() => {
    if (locationFound) {
      fetchNotes().then(({ personalNotes, globalNotes }) => {
        setPersonalNotes(personalNotes);
        setGlobalNotes(globalNotes);

        const initialNotes = global ? globalNotes : personalNotes;
        setNotes(initialNotes);
        setFilteredNotes(initialNotes);
      });
    }
  }, [locationFound, global]);

  const handleMapClick = () => {
    if (currentPopup) {
      currentPopup.setMap(null);
      setCurrentPopup(null);
    }
    setActiveNote(null);
  };

  const onMapLoad = React.useCallback((map: any) => {
    console.log("Map loaded:", map);
    mapRef.current = map;

    const updateBounds = () => {
      const newCenter: Location = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng(),
      };
      const newBounds = map.getBounds();

      setMapCenter(newCenter);
      setMapBounds(newBounds);
      // updateFilteredNotes(newCenter, newBounds, notes); // this line was causing over rendering.
    };

    map.addListener("dragend", updateBounds);
    map.addListener("zoom_changed", updateBounds);
    const mapClickListener = map.addListener("click", () => {
      setActiveNote(null); // This will hide the ClickableNote
    });

    const mapDragListener = map.addListener("dragstart", () => {
      setActiveNote(null); // This will hide the ClickableNote
    });
    updateBounds();

    setTimeout(() => {
      updateBounds();
    }, 100);
    // return () => {
    //   google.maps.event.clearListeners(map, 'dragend');
    //   google.maps.event.clearListeners(map, 'zoom_changed');
    // };
  }, []);

  // Filter function
  const filterNotesByMapBounds = (
    bounds: google.maps.LatLngBounds | null,
    notes: Note[]
  ): Note[] => {
    if (!bounds) return notes;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const returnVal = notes.filter((note) => {
      const lat = parseFloat(note.latitude);
      const lng = parseFloat(note.longitude);
      return (
        lat >= sw.lat() && lat <= ne.lat() && lng >= sw.lng() && lng <= ne.lng()
      );
    });
    console.log("Filtering Notes...")
    setEmptyRegion(false);
    if (returnVal.length < 1) {
      console.log("The Region is empty")
      setEmptyRegion(true);
    }
    return returnVal;
  };

  const updateFilteredNotes = async (
    center: Location,
    bounds: google.maps.LatLngBounds | null,
    allNotes: Note[]
  ) => {
    const visibleNotes = filterNotesByMapBounds(bounds, allNotes);
    setFilteredNotes(visibleNotes);
  };

  const fetchNotes = async () => {
    try {
      const userId = await user.getId();

      let personalNotes: Note[] = [];
      let globalNotes: Note[] = [];
      if (userId) {
        setIsLoggedIn(true);
        personalNotes = await ApiService.fetchUserMessages(userId);
        personalNotes =
          DataConversion.convertMediaTypes(personalNotes).reverse();
      }
      globalNotes = await ApiService.fetchPublishedNotes();
      globalNotes = DataConversion.convertMediaTypes(globalNotes).reverse();

      return { personalNotes, globalNotes };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { personalNotes: [], globalNotes: [] };
    }
  };

  const handleMarkerClick = (note: Note) => {
    handleMapClick();
    setActiveNote(note);
    scrollToNoteTile(note.id);

    const map = mapRef.current;

    class Popup extends google.maps.OverlayView {
      position: google.maps.LatLng;
      containerDiv: HTMLDivElement;

      constructor(position: google.maps.LatLng, content: HTMLElement) {
        super();
        this.position = position;

        content.classList.add("popup-bubble");

        // This zero-height div is positioned at the bottom of the bubble.
        const bubbleAnchor = document.createElement("div");

        bubbleAnchor.classList.add("popup-bubble-anchor");
        bubbleAnchor.appendChild(content);

        // This zero-height div is positioned at the bottom of the tip.
        this.containerDiv = document.createElement("div");
        this.containerDiv.classList.add("popup-container");
        this.containerDiv.appendChild(bubbleAnchor);

        // Optionally stop clicks, etc., from bubbling up to the map.
        Popup.preventMapHitsAndGesturesFrom(this.containerDiv);
      }

      /** Called when the popup is added to the map. */
      onAdd() {
        console.log(this, " BEING ADDED");
        this.getPanes()!.floatPane.appendChild(this.containerDiv);
      }

      /** Called when the popup is removed from the map. */
      onRemove() {
        console.log(this, " BEING Removed");
        if (this.containerDiv.parentElement) {
          this.containerDiv.parentElement.removeChild(this.containerDiv);
        }
      }

      /** Called each frame when the popup needs to draw itself. */
      draw() {
        console.log(this, " BEING drawed");
        const divPosition = this.getProjection().fromLatLngToDivPixel(
          this.position
        )!;

        // Hide the popup when it is far out of view.
        const display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
            ? "block"
            : "none";

        if (display === "block") {
          this.containerDiv.style.left = divPosition.x + "px";
          this.containerDiv.style.top = divPosition.y + "px";
        }

        if (this.containerDiv.style.display !== display) {
          this.containerDiv.style.display = display;
        }
      }
    }

    if (map) {
      console.log("BURUV");

      const popupContent = document.createElement("div");
      // Use createRoot to render the component into popupContent
      const root = createRoot(popupContent); // Create a root.
      root.render(<ClickableNote note={note} />); // Use the root to render.

      console.log("popupContent", popupContent);

      let popup = new Popup(
        new google.maps.LatLng(
          parseFloat(note.latitude),
          parseFloat(note.longitude)
        ),
        popupContent
      );
      if (currentPopup) {
        currentPopup.setMap(null);
        setCurrentPopup(null);
      }
      setCurrentPopup(popup);
      popup.setMap(map);
    }
  };

  // Old handle search that filters the locations by string
  // const handleSearch = (searchQuery: string) => {
  //   if (!searchQuery.trim()) {
  //     setFilteredNotes(notes);
  //     return;
  //   }
  //   const query = searchQuery.toLowerCase();
  //   const filtered = notes.filter(
  //     (note) =>
  //       note.title.toLowerCase().includes(query) ||
  //       note.tags.some((tag) => tag.toLowerCase().includes(query))
  //   );
  //   setFilteredNotes(filtered);
  // };

  // New handleSearch for location based searching
  const handleSearch = (address: string, lat?: number, lng?: number) => {
    if (!address.trim()) {
      setFilteredNotes(notes);
      return;
    }

    // Check if latitude and longitude are provided
    if (lat != null && lng != null) {
      // If so, move the map to the new location
      const newCenter = { lat, lng };
      mapRef.current?.panTo(newCenter);
      mapRef.current?.setZoom(10);
    } else {
      // Otherwise, filter the notes based on the search query
      const query = address.toLowerCase();
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredNotes(filtered);
    }
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: mapAPIKey,
    libraries,
    id: "google-map-script",
  });

  function createMarkerIcon(isHighlighted: boolean) {
    if (isHighlighted) {
      return {
        url: "/markerG.png",
        scaledSize: new window.google.maps.Size(48, 48), // 20% larger than the default size (40, 40)
      };
    } else {
      return {
        url: "/markerR.png",
        scaledSize: new window.google.maps.Size(40, 40),
      };
    }
  }

  const toggleFilter = () => {
    setGlobal(!global);
    const notesToUse = !global ? globalNotes : personalNotes;
    setNotes(notesToUse);
    setFilteredNotes(notesToUse);
  };

  const scrollToNoteTile = (noteId: string) => {
    const noteTile = noteRefs.current[noteId];
    if (noteTile) {
      noteTile.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };
  function getLocation() {
    toast("Fetching Location", {
      description: "Getting your location. This can take a second.",
      duration: 3000,
    });
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(newCenter);
        },
        (error) => {
          console.error("Error fetching location", error);
          reject(error);
        }
      );
    });
  }

  async function handleSetLocation() {
    try {
      const newCenter = await getLocation();
      setMapCenter(newCenter as Location);
      mapRef.current?.panTo(newCenter as Location);
      mapRef.current?.setZoom(13);
    } catch (error) {
      console.error("Failed to set location", error);
    }
  }

  return (
    <div className="flex flex-row w-screen h-[90vh] min-w-[600px]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={65}
          maxSize={82}
          minSize={29}
          className="flex-grow min-w-[320px]"
        >
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onMapLoad}
              // onDragStart={handleMapClick} // Add this line if we want to get rid of the Popup as soon as they drag
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              <div className="absolute flex flex-row mt-3 w-full h-10 justify-between z-10">
                <div className="flex flex-row w-[30vw] left-0 z-10 m-5 align-center items-center">
                  <div className="min-w-[80px] mr-3">
                    <SearchBar onSearch={handleSearch} isLoaded={isLoaded} />
                  </div>
                  {isLoggedIn ? (
                    <div className="flex flex-row justify-evenly items-center">
                      <GlobeIcon className="text-primary" />
                      <Switch onClick={toggleFilter} />
                      <UserIcon className="text-primary" />
                    </div>
                  ) : null}
                </div>
                <div
                  className="flex flex-row w-[50px] z-10 align-center items-center cursor-pointer hover:text-destructive"
                  onClick={handleSetLocation}
                >
                  <Navigation size={20} />
                </div>
              </div>
              {filteredNotes.map((note, index) => {
                const isNoteHovered = hoveredNoteId === note.id;
                return (
                  <Marker
                    key={note.id}
                    position={{
                      lat: parseFloat(note.latitude),
                      lng: parseFloat(note.longitude),
                    }}
                    onClick={() => handleMarkerClick(note)}
                    icon={createMarkerIcon(isNoteHovered)}
                    zIndex={isNoteHovered ? 1 : 0}
                    onLoad={(marker) => {
                      setMarkers((prev) => new Map(prev).set(note.id, marker));
                    }}
                  />
                );
              })}
            </GoogleMap>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={35}
          maxSize={71}
          minSize={18}
          className="min-w-[270px]"
        >
          {filteredNotes.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "0.5rem",
                padding: "0.5rem",
                overflowY: "auto",
                height: "90vh",
                justifyContent: "center",
              }}
            >
              {filteredNotes.map((note) => (
                <div
                  ref={(el: HTMLElement | null) => {
                    if (el) {
                      noteRefs.current[note.id] = el;
                    }
                  }}
                  className={`transition-transform duration-300 ease-in-out cursor-pointer ${
                    note.id === activeNote?.id
                      ? "active-note"
                      : "hover:scale-105 hover:shadow-lg hover:bg-gray-200"
                  }`}
                  onMouseEnter={() => setHoveredNoteId(note.id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                  key={note.id}
                >
                  <ClickableNote note={note} />
                </div>
              ))}
            </div>
          ) : !locationFound ? (
            <div className="flex flex-row w-full h-full justify-center align-middle items-center px-7 p-3 font-bold">
              <span className="self-center">Fetching Location...</span>
            </div>
          ) : emptyRegion ? (
            <div className="flex flex-row w-full h-full justify-center align-middle items-center px-7 p-3 font-bold">
              <span className="self-center">
                There are no entries in this region.
              </span>
            </div>
          ) : (
            <div className="flex flex-row w-full h-full justify-center align-middle items-center px-7 p-3 font-bold">
              <span className="self-center">Loading...</span>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Page;
