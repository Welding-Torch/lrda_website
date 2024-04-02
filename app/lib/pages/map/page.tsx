"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
} from "@react-google-maps/api";
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
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { getItem, setItem } from "../../utils/async_storage";
import { GoogleMapsProvider, useGoogleMaps } from '../../utils/GoogleMapsContext';


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
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(
    null
  );
  const mapRef = useRef<google.maps.Map>();
  const markerClustererRef = useRef<MarkerClusterer>();
  const [emptyRegion, setEmptyRegion] = useState(false);
  const noteRefs = useRef<Refs>({});
  const [currentPopup, setCurrentPopup] = useState<any | null>(null);
  const [markers, setMarkers] = useState(new Map());

  const user = User.getInstance();

  const isMapsApiLoaded = useGoogleMaps();

  useEffect(() => {
    let isSubscribed = true;
    // Immediately try to fetch the last known location from storage
    const fetchLastLocation = async () => {
      try {
        const lastLocationString = await getItem("LastLocation");
        const lastLocation = lastLocationString
          ? JSON.parse(lastLocationString)
          : null;
        if (isSubscribed) {
          setMapCenter(lastLocation);
          setMapZoom(10);
          setLocationFound(true);
        }
      } catch (error) {
        const defaultLocation = { lat: 38.637334, lng: -90.286021 };
        setMapCenter(defaultLocation as Location);
        setMapZoom(10);
        setLocationFound(true);
        console.error("Failed to fetch the last location", error);
      }
    };
    fetchLastLocation();
    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    let isComponentMounted = true;

    const fetchCurrentLocationAndUpdate = async () => {
      try {
        const currentLocation = (await getLocation()) as Location;
        if (!locationFound && isComponentMounted) {
          setMapCenter(currentLocation);
          setMapZoom(10);
        }
        await setItem("LastLocation", JSON.stringify(currentLocation));
      } catch (error) {
        if (isComponentMounted) {
          const defaultLocation = { lat: 38.637334, lng: -90.286021 };
          setMapCenter(defaultLocation);
          setMapZoom(10);
          setLocationFound(true);
          console.log("Using last known location due to error:", error);
        }
      }
    };

    fetchCurrentLocationAndUpdate();

    // The cleanup function to run when the component unmounts
    return () => {
      isComponentMounted = false;
    };
  }, [locationFound]);

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
    const timer = setTimeout(() => {
      if (filteredNotes.length < 1) {
        setEmptyRegion(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
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
      });
    }
  }, [locationFound, global]);

  // useEffect that creates and updates Markers and MarkerClusters
  useEffect(() => {
    if (isMapsApiLoaded && mapRef.current && filteredNotes.length > 0) {
      const tempMarkers = new Map();

      const attachMarkerEvents = (marker: google.maps.Marker, note: Note) => {
        google.maps.event.clearListeners(marker, "click");
        google.maps.event.clearListeners(marker, "mouseover");
        google.maps.event.clearListeners(marker, "mouseout");

        marker.addListener("click", () => handleMarkerClick(note));

        marker.addListener("mouseover", () => {
          setHoveredNoteId(note.id);
          scrollToNoteTile(note.id);
          setActiveNote(note);
          marker.setIcon(createMarkerIcon(true));
        });

        marker.addListener("mouseout", () => {
          setHoveredNoteId(null);
          setActiveNote(null);
          marker.setIcon(createMarkerIcon(false));
        });
      };

      filteredNotes.forEach((note) => {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(
            parseFloat(note.latitude),
            parseFloat(note.longitude)
          ),
          icon: createMarkerIcon(false),
        });

        attachMarkerEvents(marker, note);
        tempMarkers.set(note.id, marker);
      });

      setMarkers(tempMarkers);

      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }

      markerClustererRef.current = new MarkerClusterer({
        markers: Array.from(tempMarkers.values()),
        map: mapRef.current,
      });

      return () => {
        if (markerClustererRef.current) {
          markerClustererRef.current.clearMarkers();
        }
      };
    }
  }, [isMapsApiLoaded, filteredNotes, mapRef.current]);

  const handleMapClick = () => {
    if (currentPopup) {
      currentPopup.setMap(null);
    }
    setCurrentPopup(null);
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
    map.addListener("zoom_changed", () => {
      updateBounds();
    });
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
    // Close the currently active popup if it exists
    if (currentPopup) {
      currentPopup.setMap(null); // Close the currently open popup
      setCurrentPopup(null); // Set the currentPopup to null immediately after closing
    }

    setActiveNote(note); // Set the new active note
    scrollToNoteTile(note.id); // Scroll to the note tile if needed

    const map = mapRef.current;

    if (map) {
      const popupContent = document.createElement("div");
      const root = createRoot(popupContent);
      root.render(<ClickableNote note={note} />);

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
          this.getPanes()!.floatPane.appendChild(this.containerDiv);
        }

        /** Called when the popup is removed from the map. */
        onRemove() {
          if (this.containerDiv.parentElement) {
            this.containerDiv.parentElement.removeChild(this.containerDiv);
          }
        }

        /** Called each frame when the popup needs to draw itself. */
        draw() {
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

      let popup = new Popup(
        new google.maps.LatLng(
          parseFloat(note.latitude),
          parseFloat(note.longitude)
        ),
        popupContent
      );

      // Set the new popup as the currentPopup before opening it
      setCurrentPopup(popup);

      // Open the popup
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
          {isMapsApiLoaded && (
            <GoogleMapsProvider>

            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onMapLoad}
              onDragStart={handleMapClick}
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
                    <SearchBar onSearch={handleSearch} />
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
              {/* {filteredNotes.map((note, index) => {
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
              })} */}
            </GoogleMap>
            </GoogleMapsProvider>
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
                  className={`transition-transform duration-300 ease-in-out cursor-pointer max-h-[308px] max-w-[265px] ${
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
