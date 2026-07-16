/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Compass, 
  ParkingCircle, 
  HeartHandshake, 
  Utensils, 
  Accessibility as AccessibilityIcon,
  ShieldAlert,
  Route
} from "lucide-react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise(resolve => {
    // If already loaded, resolve immediately
    if (window.google?.maps) {
      resolve(null);
      return;
    }
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

// METLIFE STADIUM COORDINATES & LOCATIONS
const VENUE_COORDS = { lat: 40.8135, lng: -74.0744 }; // MetLife Stadium Center

const locations = {
  gates: [
    { name: "Gate 1 (North)", lat: 40.8145, lng: -74.0755, type: "gate" },
    { name: "Gate 2 (East)", lat: 40.8138, lng: -74.0725, type: "gate" },
    { name: "Gate 3 (South - Low Congestion)", lat: 40.8123, lng: -74.0736, type: "gate" },
    { name: "Gate 4 (West)", lat: 40.8128, lng: -74.0760, type: "gate" },
  ],
  parking: [
    { name: "Parking Lot A (Premium)", lat: 40.8105, lng: -74.0780, type: "parking" },
    { name: "Parking Lot B (General / Shuttle)", lat: 40.8112, lng: -74.0705, type: "parking" },
  ],
  medical: [
    { name: "First Aid & Medical Room C", lat: 40.8132, lng: -74.0740, type: "medical" },
    { name: "Emergency Dispatch Desk - Gate 3", lat: 40.8124, lng: -74.0735, type: "medical" },
  ],
  food: [
    { name: "World Cup Food Plaza", lat: 40.8139, lng: -74.0748, type: "food" },
    { name: "Halal & Vegan Stalls Court", lat: 40.8131, lng: -74.0739, type: "food" },
  ],
  accessibility: [
    { name: "ADA Accessible Lift & Ramp - Section B", lat: 40.8136, lng: -74.0746, type: "ada" },
    { name: "Accessible Restroom - Gate 3 Lobby", lat: 40.8125, lng: -74.0737, type: "ada" },
  ]
};

// Route coordinates (fallback polylines if directions service fails)
const routes = {
  gate3Route: [
    { lat: 40.8105, lng: -74.0780 }, // Parking A
    { lat: 40.8115, lng: -74.0760 },
    { lat: 40.8123, lng: -74.0736 }  // Gate 3
  ],
  seatRoute: [
    { lat: 40.8123, lng: -74.0736 }, // Gate 3
    { lat: 40.8130, lng: -74.0742 },
    { lat: 40.8136, lng: -74.0746 }  // Section B Seat
  ],
  emergencyExit: [
    { lat: 40.8136, lng: -74.0746 }, // Section B Seat
    { lat: 40.8130, lng: -74.0742 },
    { lat: 40.8123, lng: -74.0736 }, // Gate 3 Exit
    { lat: 40.8115, lng: -74.0760 },
    { lat: 40.8105, lng: -74.0780 }  // Safe Area Parking A
  ],
  accessiblePath: [
    { lat: 40.8123, lng: -74.0736 }, // Gate 3 Entrance
    { lat: 40.8125, lng: -74.0737 }, // Restroom
    { lat: 40.8136, lng: -74.0746 }  // ADA Lift to Seating
  ]
};

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = VENUE_COORDS,
  initialZoom = 16,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  
  const markers = useRef<any[]>([]);
  const polylines = useRef<google.maps.Polyline[]>([]);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("venue");
  const [routeInfo, setRouteInfo] = useState<string>("");
  const [googleLoadError, setGoogleLoadError] = useState(false);
  const [activePath, setActivePath] = useState<string>("");

  const clearOverlays = () => {
    // Clear markers
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];
    
    // Clear polylines
    polylines.current.forEach(p => p.setMap(null));
    polylines.current = [];
    
    // Clear directions
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] } as any);
    }
    setRouteInfo("");
  };

  const addMarkersForList = (list: any[], markerColor: string = "#4f46e5") => {
    clearOverlays();
    if (!map.current) return;

    list.forEach(loc => {
      // Create AdvancedMarkerElement if available
      try {
        const marker = new window.google.maps.Marker({
          position: { lat: loc.lat, lng: loc.lng },
          map: map.current!,
          title: loc.name,
          animation: window.google.maps.Animation.DROP,
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><h4 style="font-weight: 600; color: #1e293b;">${loc.name}</h4><p style="font-size: 12px; color: #64748b; margin-top: 4px;">MetLife Stadium World Cup Zone</p></div>`
        });

        marker.addListener("click", () => {
          infoWindow.open(map.current, marker);
        });

        markers.current.push(marker);
      } catch (err) {
        console.error("Failed to render Google Map Marker:", err);
      }
    });

    // Center map around markers
    if (list.length > 0) {
      map.current.panTo({ lat: list[0].lat, lng: list[0].lng });
    }
  };

  const drawManualPolyline = (path: any[], color: string, name: string) => {
    clearOverlays();
    if (!map.current) return;

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map: map.current
    });

    polylines.current.push(polyline);

    // Place markers at endpoints
    const startMarker = new window.google.maps.Marker({
      position: path[0],
      map: map.current,
      title: "Start"
    });
    const endMarker = new window.google.maps.Marker({
      position: path[path.length - 1],
      map: map.current,
      title: "Destination"
    });

    markers.current.push(startMarker, endMarker);

    // Fit bounds
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.current.fitBounds(bounds);

    setRouteInfo(`Active Route: ${name} (~5 min walking directions)`);
  };

  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      if (!window.google?.maps) {
        throw new Error("Google Maps script not fully loaded");
      }
      if (!mapContainer.current) {
        console.error("Map container not found");
        return;
      }

      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });

      // Initialize directions renderer
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: map.current,
        suppressMarkers: false
      });

      // Draw MetLife Stadium marker
      new window.google.maps.Marker({
        position: VENUE_COORDS,
        map: map.current,
        title: "MetLife Stadium (World Cup 2026 Venue)",
      });

      if (onMapReady) {
        onMapReady(map.current);
      }
    } catch (err) {
      console.warn("Failed to load Google Map, falling back to SVG Stadium Map:", err);
      setGoogleLoadError(true);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full min-h-[500px]">
      {/* Sidebar Controls */}
      <div className="flex flex-col gap-2 w-full md:w-64 bg-muted p-4 rounded-lg border border-border">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3">Map Controls</h3>
        
        <Button 
          variant={activeCategory === "venue" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("venue");
            setActivePath("");
            clearOverlays();
            map.current?.panTo(VENUE_COORDS);
            map.current?.setZoom(16);
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <Compass size={16} /> Stadium Location
        </Button>

        <Button 
          variant={activeCategory === "gates" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("gates");
            setActivePath("");
            addMarkersForList(locations.gates, "#3b82f6");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <MapPin size={16} /> Entrance Gates
        </Button>

        <Button 
          variant={activeCategory === "parking" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("parking");
            setActivePath("");
            addMarkersForList(locations.parking, "#10b981");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <ParkingCircle size={16} /> Parking Lots
        </Button>

        <Button 
          variant={activeCategory === "medical" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("medical");
            setActivePath("");
            addMarkersForList(locations.medical, "#ef4444");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <HeartHandshake size={16} /> Medical Centers
        </Button>

        <Button 
          variant={activeCategory === "food" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("food");
            setActivePath("");
            addMarkersForList(locations.food, "#f59e0b");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <Utensils size={16} /> Food Courts
        </Button>

        <Button 
          variant={activeCategory === "ada" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("ada");
            setActivePath("");
            addMarkersForList(locations.accessibility, "#6366f1");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <AccessibilityIcon size={16} /> Accessible Routes
        </Button>

        <div className="h-px bg-muted my-2" />
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Route Wayfinding</h4>

        <Button 
          variant="outline"
          onClick={() => {
            setActivePath("parkingToGate3");
            setRouteInfo("Active Route: Gate 3 Entrance Directions (~5 min walking directions)");
            drawManualPolyline(routes.gate3Route, "#10b981", "Gate 3 Entrance Directions");
          }}
          className="justify-start gap-2 text-left text-xs border-emerald-200 hover:bg-emerald-50 text-emerald-700"
        >
          <Route size={14} /> Parking to Gate 3
        </Button>

        <Button 
          variant="outline"
          onClick={() => {
            setActivePath("gate3ToSeat");
            setRouteInfo("Active Route: Seat Finder Guidance (Gate 3 to Section B) (~5 min walking directions)");
            drawManualPolyline(routes.seatRoute, "#3b82f6", "Seat Finder Guidance (Gate 3 to Section B)");
          }}
          className="justify-start gap-2 text-left text-xs border-blue-200 hover:bg-blue-50 text-blue-700"
        >
          <Route size={14} /> Gate 3 to Seat
        </Button>

        <Button 
          variant="outline"
          onClick={() => {
            setActivePath("accessiblePath");
            setRouteInfo("Active Route: Accessible Wayfinding Pathway (~5 min walking directions)");
            drawManualPolyline(routes.accessiblePath, "#6366f1", "Accessible Wayfinding Pathway");
          }}
          className="justify-start gap-2 text-left text-xs border-indigo-200 hover:bg-indigo-50 text-indigo-700"
        >
          <AccessibilityIcon size={14} /> Accessible Path
        </Button>

        <Button 
          variant="outline"
          onClick={() => {
            setActivePath("emergencyExit");
            setRouteInfo("Active Route: Emergency Evacuation Route (~5 min walking directions)");
            drawManualPolyline(routes.emergencyExit, "#ef4444", "Emergency Evacuation Route");
          }}
          className="justify-start gap-2 text-left text-xs border-red-200 hover:bg-red-50 text-red-700"
        >
          <ShieldAlert size={14} /> Evacuation Route
        </Button>
      </div>

      {/* Map Area */}
      <div className="flex-1 flex flex-col relative bg-muted rounded-lg overflow-hidden border border-border">
        {googleLoadError ? (
          <div className="w-full h-[500px] bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden select-none">
            {/* SVG Interactive Map */}
            <svg viewBox="0 0 600 400" className="w-full h-full">
              {/* Grid Background */}
              <defs>
                <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
                </pattern>
                <style>{`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -40;
                    }
                  }
                  .animated-route {
                    stroke-dasharray: 8, 4;
                    animation: dash 2s linear infinite;
                  }
                  @keyframes pulseMarker {
                    0% { r: 6; opacity: 1; }
                    100% { r: 16; opacity: 0; }
                  }
                  .pulsing-dot {
                    animation: pulseMarker 1.5s ease-out infinite;
                  }
                `}</style>
              </defs>
              <rect width="600" height="400" fill="url(#mapGrid)" />

              {/* Parking Lot A (Premium) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("parking"); setRouteInfo("Parking Lot A (Premium)"); setActivePath(""); }}>
                <rect x="25" y="325" width="50" height="40" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="2" opacity={activeCategory === "parking" ? 1 : 0.6} />
                <text x="50" y="350" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">LOT A</text>
              </g>

              {/* Parking Lot B (General) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("parking"); setRouteInfo("Parking Lot B (General / Shuttle)"); setActivePath(""); }}>
                <rect x="525" y="325" width="50" height="40" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="2" opacity={activeCategory === "parking" ? 1 : 0.6} />
                <text x="550" y="350" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">LOT B</text>
              </g>

              {/* Stadium Outer Bowl */}
              <ellipse cx="300" cy="200" rx="180" ry="130" fill="#0f172a" stroke="#334155" strokeWidth="6" />
              {/* Seating Tiers */}
              <ellipse cx="300" cy="200" rx="150" ry="105" fill="none" stroke="#1e293b" strokeWidth="4" />
              <ellipse cx="300" cy="200" rx="120" ry="85" fill="none" stroke="#1e293b" strokeWidth="3" />

              {/* Soccer Field */}
              <rect x="240" y="155" width="120" height="90" fill="#065f46" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
              <circle cx="300" cy="200" r="20" fill="none" stroke="#ffffff" strokeWidth="2" />
              <line x1="300" y1="155" x2="300" y2="245" stroke="#ffffff" strokeWidth="2" />

              {/* Gate 1 (North) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("gates"); setRouteInfo("Gate 1 (North Entrance)"); setActivePath(""); }}>
                <ellipse cx="300" cy="50" rx="18" ry="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" opacity={activeCategory === "gates" ? 1 : 0.7} />
                <text x="300" y="54" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle">GATE 1</text>
              </g>

              {/* Gate 2 (East) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("gates"); setRouteInfo("Gate 2 (East Entrance)"); setActivePath(""); }}>
                <ellipse cx="500" cy="200" rx="18" ry="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" opacity={activeCategory === "gates" ? 1 : 0.7} />
                <text x="500" y="204" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle">GATE 2</text>
              </g>

              {/* Gate 3 (South Side - Low Congestion) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("gates"); setRouteInfo("Gate 3 (South Side)"); setActivePath(""); }}>
                <ellipse cx="300" cy="350" rx="18" ry="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" opacity={activeCategory === "gates" ? 1 : 0.7} />
                <text x="300" y="354" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle">GATE 3</text>
              </g>

              {/* Gate 4 (West) */}
              <g className="cursor-pointer" onClick={() => { setActiveCategory("gates"); setRouteInfo("Gate 4 (West Entrance)"); setActivePath(""); }}>
                <ellipse cx="100" cy="200" rx="18" ry="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" opacity={activeCategory === "gates" ? 1 : 0.7} />
                <text x="100" y="204" fill="#3b82f6" fontSize="8" fontWeight="bold" textAnchor="middle">GATE 4</text>
              </g>

              {/* Route Wayfinding Lines */}
              {activePath === "parkingToGate3" && (
                <path d="M 50 350 Q 175 350 300 350" fill="none" stroke="#10b981" strokeWidth="4" className="animated-route" />
              )}
              {activePath === "gate3ToSeat" && (
                <path d="M 300 350 C 310 320 330 280 360 240" fill="none" stroke="#3b82f6" strokeWidth="4" className="animated-route" />
              )}
              {activePath === "accessiblePath" && (
                <path d="M 300 350 Q 310 340 320 330 T 360 240" fill="none" stroke="#6366f1" strokeWidth="4" className="animated-route" />
              )}
              {activePath === "emergencyExit" && (
                <path d="M 360 240 C 330 280 310 320 300 350 Q 175 350 50 350" fill="none" stroke="#ef4444" strokeWidth="4" className="animated-route" />
              )}

              {/* Active Marker Highlights based on selected category */}
              {activeCategory === "venue" && (
                <g>
                  <circle cx="300" cy="200" r="10" fill="rgba(79, 70, 229, 0.4)" className="pulsing-dot" />
                  <circle cx="300" cy="200" r="5" fill="#4f46e5" />
                </g>
              )}
              {activeCategory === "gates" && (
                <g>
                  <circle cx="300" cy="50" r="10" fill="rgba(59, 130, 246, 0.4)" className="pulsing-dot" />
                  <circle cx="300" cy="50" r="5" fill="#3b82f6" />
                  <circle cx="500" cy="200" r="10" fill="rgba(59, 130, 246, 0.4)" className="pulsing-dot" />
                  <circle cx="500" cy="200" r="5" fill="#3b82f6" />
                  <circle cx="300" cy="350" r="10" fill="rgba(59, 130, 246, 0.4)" className="pulsing-dot" />
                  <circle cx="300" cy="350" r="5" fill="#3b82f6" />
                  <circle cx="100" cy="200" r="10" fill="rgba(59, 130, 246, 0.4)" className="pulsing-dot" />
                  <circle cx="100" cy="200" r="5" fill="#3b82f6" />
                </g>
              )}
              {activeCategory === "parking" && (
                <g>
                  <circle cx="50" cy="350" r="10" fill="rgba(16, 185, 129, 0.4)" className="pulsing-dot" />
                  <circle cx="50" cy="350" r="5" fill="#10b981" />
                  <circle cx="550" cy="350" r="10" fill="rgba(16, 185, 129, 0.4)" className="pulsing-dot" />
                  <circle cx="550" cy="350" r="5" fill="#10b981" />
                </g>
              )}
              {activeCategory === "medical" && (
                <g>
                  {/* Medical Room C */}
                  <g className="cursor-pointer animate-fade-in" onClick={() => setRouteInfo("First Aid & Medical Room C")}>
                    <circle cx="300" cy="120" r="10" fill="rgba(239, 68, 68, 0.4)" className="pulsing-dot" />
                    <circle cx="300" cy="120" r="6" fill="#ef4444" />
                    <rect x="298" y="116" width="4" height="8" fill="white" />
                    <rect x="296" y="118" width="8" height="4" fill="white" />
                  </g>
                  {/* Dispatch Desk */}
                  <g className="cursor-pointer animate-fade-in" onClick={() => setRouteInfo("Emergency Dispatch Desk - Gate 3")}>
                    <circle cx="270" cy="335" r="10" fill="rgba(239, 68, 68, 0.4)" className="pulsing-dot" />
                    <circle cx="270" cy="335" r="6" fill="#ef4444" />
                    <rect x="268" y="331" width="4" height="8" fill="white" />
                    <rect x="266" y="333" width="8" height="4" fill="white" />
                  </g>
                </g>
              )}
              {activeCategory === "food" && (
                <g>
                  {/* Food Plaza */}
                  <circle cx="180" cy="100" r="10" fill="rgba(245, 158, 11, 0.4)" className="pulsing-dot" />
                  <circle cx="180" cy="100" r="5" fill="#f59e0b" />
                  <text x="180" y="85" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">FOOD PLAZA</text>
                  {/* Halal Stalls */}
                  <circle cx="420" cy="200" r="10" fill="rgba(245, 158, 11, 0.4)" className="pulsing-dot" />
                  <circle cx="420" cy="200" r="5" fill="#f59e0b" />
                  <text x="420" y="185" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">HALAL FOOD</text>
                </g>
              )}
              {activeCategory === "ada" && (
                <g>
                  {/* ADA Lift */}
                  <circle cx="360" cy="240" r="10" fill="rgba(99, 102, 241, 0.4)" className="pulsing-dot" />
                  <circle cx="360" cy="240" r="5" fill="#6366f1" />
                  <text x="360" y="225" fill="#6366f1" fontSize="8" fontWeight="bold" textAnchor="middle">ADA LIFT</text>
                  {/* Restroom */}
                  <circle cx="320" cy="330" r="10" fill="rgba(99, 102, 241, 0.4)" className="pulsing-dot" />
                  <circle cx="320" cy="330" r="5" fill="#6366f1" />
                  <text x="320" y="320" fill="#6366f1" fontSize="8" fontWeight="bold" textAnchor="middle">ADA WC</text>
                </g>
              )}
            </svg>
          </div>
        ) : (
          <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
        )}

        {routeInfo && (
          <div className="absolute top-4 left-4 bg-card/95 backdrop-blur px-4 py-2 rounded-md shadow-md border border-border text-xs font-semibold text-foreground flex items-center gap-2 max-w-sm animate-slide-in-up">
            <Route size={14} className="text-indigo-600 animate-pulse" />
            <span>{routeInfo}</span>
          </div>
        )}
      </div>
    </div>
  );
}
