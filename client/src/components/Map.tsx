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
      script.remove(); // Clean up immediately
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
    await loadMapScript();
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
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full min-h-[500px]">
      {/* Sidebar Controls */}
      <div className="flex flex-col gap-2 w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-border">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3">Map Controls</h3>
        
        <Button 
          variant={activeCategory === "venue" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("venue");
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
            addMarkersForList(locations.accessibility, "#6366f1");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <AccessibilityIcon size={16} /> Accessible Routes
        </Button>

        <div className="h-px bg-slate-200 my-2" />
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Route Wayfinding</h4>

        <Button 
          variant="outline"
          onClick={() => drawManualPolyline(routes.gate3Route, "#10b981", "Gate 3 Entrance Directions")}
          className="justify-start gap-2 text-left text-xs border-emerald-200 hover:bg-emerald-50 text-emerald-700"
        >
          <Route size={14} /> Parking to Gate 3
        </Button>

        <Button 
          variant="outline"
          onClick={() => drawManualPolyline(routes.seatRoute, "#3b82f6", "Seat Finder Guidance (Gate 3 to Section B)")}
          className="justify-start gap-2 text-left text-xs border-blue-200 hover:bg-blue-50 text-blue-700"
        >
          <Route size={14} /> Gate 3 to Seat
        </Button>

        <Button 
          variant="outline"
          onClick={() => drawManualPolyline(routes.accessiblePath, "#6366f1", "Accessible Wayfinding Pathway")}
          className="justify-start gap-2 text-left text-xs border-indigo-200 hover:bg-indigo-50 text-indigo-700"
        >
          <AccessibilityIcon size={14} /> Accessible Path
        </Button>

        <Button 
          variant="outline"
          onClick={() => drawManualPolyline(routes.emergencyExit, "#ef4444", "Emergency Evacuation Route")}
          className="justify-start gap-2 text-left text-xs border-red-200 hover:bg-red-50 text-red-700"
        >
          <ShieldAlert size={14} /> Evacuation Route
        </Button>
      </div>

      {/* Map Area */}
      <div className="flex-1 flex flex-col relative bg-slate-100 rounded-lg overflow-hidden border border-border">
        <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
        
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
