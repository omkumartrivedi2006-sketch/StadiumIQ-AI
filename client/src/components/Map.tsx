/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation as useGeoLocation } from "@/contexts/LocationContext";
import { socketService } from "@/services/socket";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import { 
  MapPin, 
  Compass, 
  ParkingCircle, 
  HeartHandshake, 
  Utensils, 
  Accessibility as AccessibilityIcon,
  ShieldAlert,
  Route,
  Search,
  Navigation,
  Info,
  Clock,
  CheckCircle,
  HelpCircle
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
      console.warn("Failed to load Google Maps script");
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

const VENUE_COORDS = { lat: 40.8135, lng: -74.0744 };

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

  const { user } = useAuth();
  const { latitude, longitude } = useGeoLocation();
  const [liveLocations, setLiveLocations] = useState<any[]>([]);
  const liveMarkersRef = useRef<Record<string, google.maps.Marker>>({});

  const [activeCategory, setActiveCategory] = useState<string>("venue");
  const [googleLoadError, setGoogleLoadError] = useState(false);
  const [activePath, setActivePath] = useState<string>("");

  // DB Loaded States
  const [dbMarkers, setDbMarkers] = useState<any[]>([]);
  const [dbParking, setDbParking] = useState<any[]>([]);
  const [dbFood, setDbFood] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbRoutes, setDbRoutes] = useState<any[]>([]);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [activeNavigation, setActiveNavigation] = useState<any | null>(null);

  // Load database entities
  const loadMapData = async () => {
    try {
      const [markersRes, parkingRes, foodRes, servicesRes, routesRes] = await Promise.all([
        apiClient.get("/map/markers"),
        apiClient.get("/map/parking"),
        apiClient.get("/map/food"),
        apiClient.get("/map/services"),
        apiClient.get("/map/routes")
      ]);

      if (markersRes.data?.success) setDbMarkers(markersRes.data.data);
      if (parkingRes.data?.success) setDbParking(parkingRes.data.data);
      if (foodRes.data?.success) setDbFood(foodRes.data.data);
      if (servicesRes.data?.success) setDbServices(servicesRes.data.data);
      if (routesRes.data?.success) setDbRoutes(routesRes.data.data);
    } catch (err) {
      console.error("Failed to load map database objects:", err);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const clearOverlays = () => {
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];
    polylines.current.forEach(p => p.setMap(null));
    polylines.current = [];
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] } as any);
    }
    setActiveNavigation(null);
  };

  const addMarkersForList = (list: any[], category: string) => {
    clearOverlays();
    if (!map.current || !window.google?.maps) return;

    list.forEach(loc => {
      const lat = loc.latitude || loc.lat;
      const lng = loc.longitude || loc.lng;
      if (lat === undefined || lng === undefined) return;

      let pinColor = "#4f46e5";
      if (category === "gates") pinColor = "#3b82f6";
      else if (category === "parking") pinColor = "#10b981";
      else if (category === "medical") pinColor = "#ef4444";
      else if (category === "food") pinColor = "#f59e0b";
      else if (category === "services") pinColor = "#14b8a6";
      else if (category === "ada") pinColor = "#6366f1";

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map.current!,
        title: loc.name || loc.parkingName || loc.vendorName,
        animation: window.google.maps.Animation.DROP,
      });

      const name = loc.name || loc.parkingName || loc.vendorName;
      const desc = loc.description || loc.category || `${category.toUpperCase()} Point`;

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: sans-serif; min-width: 180px;">
            <h4 style="font-weight: 600; color: #1e293b; margin: 0 0 4px 0;">${name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">${desc}</p>
            <button 
              id="nav-btn-${name.replace(/\s+/g, '-')}" 
              style="background-color: #4f46e5; color: white; border: none; padding: 4px 8px; font-size: 11px; border-radius: 4px; cursor: pointer; width: 100%; font-weight: 500;"
            >
              Directions Here
            </button>
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(map.current, marker);
        
        // Wait for infoWindow DOM to register button click
        setTimeout(() => {
          const btn = document.getElementById(`nav-btn-${name.replace(/\s+/g, '-')}`);
          if (btn) {
            btn.onclick = () => {
              infoWindow.close();
              handleNavigateTo({
                name,
                latitude: lat,
                longitude: lng
              });
            };
          }
        }, 100);
      });

      markers.current.push(marker);
    });

    if (list.length > 0) {
      const firstLat = list[0].latitude || list[0].lat;
      const firstLng = list[0].longitude || list[0].lng;
      map.current.panTo({ lat: firstLat, lng: firstLng });
    }
  };

  const drawManualPolyline = (path: any[], color: string, name: string) => {
    clearOverlays();
    if (!map.current || !window.google?.maps) return;

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map: map.current
    });

    polylines.current.push(polyline);

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

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.current.fitBounds(bounds);
  };

  // Perform backend navigation routing
  const handleNavigateTo = async (destination: any) => {
    setSelectedDestination(destination);
    const startLat = latitude || 40.8135;
    const startLng = longitude || -74.0744;

    try {
      const response = await apiClient.post("/map/navigation", {
        startLat,
        startLng,
        endLat: destination.latitude || destination.lat,
        endLng: destination.longitude || destination.lng,
        category: activeCategory === "ada" ? "wheelchair" : "pedestrian"
      });

      if (response.data?.success) {
        const navData = response.data.data;
        setActiveNavigation(navData);
        
        if (map.current && !googleLoadError) {
          drawManualPolyline(navData.waypoints, "#4f46e5", navData.name);
        }
        toast.success(`Route calculated to ${destination.name}`);
      } else {
        toast.error("Failed to calculate navigation route.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error retrieving directions.");
    }
  };

  // Trigger evacuation route immediately
  const handleTriggerEmergencyEvacuation = async () => {
    const exits = dbMarkers.filter(m => m.category === "emergency" || m.category === "exit");
    if (exits.length === 0) {
      toast.error("No emergency exits configured in system.");
      return;
    }

    const startLat = latitude || 40.8135;
    const startLng = longitude || -74.0744;

    // Find nearest exit
    let closestExit = exits[0];
    let minDist = Infinity;
    
    exits.forEach(exit => {
      const d = Math.sqrt(Math.pow(exit.latitude - startLat, 2) + Math.pow(exit.longitude - startLng, 2));
      if (d < minDist) {
        minDist = d;
        closestExit = exit;
      }
    });

    toast.warning("🚨 EMERGENCY ROUTE TRIGGERED. EVACUATING TO NEAREST EXIT.");
    setActiveCategory("medical");
    await handleNavigateTo({
      name: `Emergency Assembly Point (${closestExit.name})`,
      latitude: closestExit.latitude,
      longitude: closestExit.longitude
    });
  };

  // Search input change handler
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const query = val.toLowerCase();
    const results: any[] = [];

    dbMarkers.forEach(m => {
      if (m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)) {
        results.push({ name: m.name, latitude: m.latitude, longitude: m.longitude, category: m.category, type: "location" });
      }
    });

    dbParking.forEach(p => {
      if (p.parkingName.toLowerCase().includes(query)) {
        results.push({ name: p.parkingName, latitude: p.latitude, longitude: p.longitude, category: "parking", type: "parking" });
      }
    });

    dbFood.forEach(f => {
      if (f.vendorName.toLowerCase().includes(query) || f.category.toLowerCase().includes(query)) {
        results.push({ name: f.vendorName, latitude: f.latitude, longitude: f.longitude, category: "food", type: "food" });
      }
    });

    dbServices.forEach(s => {
      if (s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)) {
        results.push({ name: s.name, latitude: s.latitude, longitude: s.longitude, category: s.category.toLowerCase(), type: "service" });
      }
    });

    setSearchResults(results.slice(0, 8));
    setShowSearchDropdown(true);
  };

  const getSvgCoords = (lat: number, lng: number) => {
    const scaleX = 35000;
    const scaleY = -45000;
    const dx = lng - (-74.0744);
    const dy = lat - 40.8135;
    return { x: 300 + dx * scaleX, y: 200 + dy * scaleY };
  };

  const getSvgPathFromWaypoints = (wps: { lat: number; lng: number }[]) => {
    if (!wps || wps.length === 0) return "";
    return wps.map((wp, idx) => {
      const { x, y } = getSvgCoords(wp.lat, wp.lng);
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const updateGoogleLiveMarkers = () => {
    if (!map.current || !window.google?.maps) return;

    const currentIds = new Set<string>();
    if (latitude && longitude) {
      currentIds.add("current-user");
    }
    
    liveLocations.forEach(loc => {
      if (loc.online && loc.userId !== user?.id) {
        currentIds.add(loc.userId);
      }
    });

    Object.keys(liveMarkersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        liveMarkersRef.current[id].setMap(null);
        delete liveMarkersRef.current[id];
      }
    });

    if (latitude && longitude) {
      const pos = { lat: latitude, lng: longitude };
      if (liveMarkersRef.current["current-user"]) {
        liveMarkersRef.current["current-user"].setPosition(pos);
      } else {
        const marker = new window.google.maps.Marker({
          position: pos,
          map: map.current,
          title: "My Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4f46e5",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        liveMarkersRef.current["current-user"] = marker;
      }
    }

    liveLocations.forEach(loc => {
      if (!loc.online || loc.userId === user?.id) return;
      const pos = { lat: loc.latitude, lng: loc.longitude };
      const id = loc.userId;

      let color = "#ef4444";
      let title = "User";
      if (loc.role === "volunteer") {
        color = "#10b981";
        title = `Volunteer (${loc.userId.substring(0, 4)})`;
      } else if (loc.role === "organizer") {
        color = "#f59e0b";
        title = `Organizer (${loc.userId.substring(0, 4)})`;
      } else if (loc.role === "fan") {
        color = "#8b5cf6";
        title = `Fan (Crowd Movement)`;
      }

      if (liveMarkersRef.current[id]) {
        liveMarkersRef.current[id].setPosition(pos);
      } else {
        const marker = new window.google.maps.Marker({
          position: pos,
          map: map.current,
          title: title,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 1.5,
            rotation: loc.heading || 0,
          },
        });
        liveMarkersRef.current[id] = marker;
      }
    });
  };

  useEffect(() => {
    if (!user) return;

    const fetchLiveLocations = async () => {
      try {
        const resp = await apiClient.get("/location/live");
        if (resp.data?.success && Array.isArray(resp.data.data)) {
          setLiveLocations(resp.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live locations:", err);
      }
    };
    
    fetchLiveLocations();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleLocationUpdated = (updatedLoc: any) => {
      setLiveLocations(prev => {
        const idx = prev.findIndex(item => item.userId === updatedLoc.userId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = updatedLoc;
          return updated;
        }
        return [...prev, updatedLoc];
      });
    };

    const handleLocationOffline = ({ userId }: { userId: string }) => {
      setLiveLocations(prev => prev.filter(item => item.userId !== userId));
    };

    const handleCrowdMovementUpdated = (crowdPoint: any) => {
      setLiveLocations(prev => {
        const newPoint = {
          userId: Math.random().toString(),
          role: "fan",
          latitude: crowdPoint.latitude,
          longitude: crowdPoint.longitude,
          accuracy: crowdPoint.accuracy,
          online: true,
          updatedAt: crowdPoint.updatedAt,
        };
        return [...prev.filter(item => item.role !== "fan"), newPoint].slice(-100);
      });
    };

    // Socket listeners for Parking updates
    const handleParkingUpdated = (updatedPark: any) => {
      setDbParking(prev => {
        return prev.map(p => p._id === updatedPark._id ? updatedPark : p);
      });
    };

    // Socket listeners for gate crowd status
    const handleGateCrowdUpdated = ({ gate, crowdLevel }: { gate: string; crowdLevel: string }) => {
      setDbMarkers(prev => {
        return prev.map(m => {
          if (m.name.includes(gate)) {
            return { ...m, description: `${m.description.split(" - ")[0]} - Live Crowd: ${crowdLevel}` };
          }
          return m;
        });
      });
    };

    socketService.on("location-updated", handleLocationUpdated);
    socketService.on("location-offline", handleLocationOffline);
    socketService.on("crowd-movement-updated", handleCrowdMovementUpdated);
    socketService.on("parking-updated", handleParkingUpdated);
    socketService.on("crowd-status-updated", handleGateCrowdUpdated);

    return () => {
      socketService.off("location-updated", handleLocationUpdated);
      socketService.off("location-offline", handleLocationOffline);
      socketService.off("crowd-movement-updated", handleCrowdMovementUpdated);
      socketService.off("parking-updated", handleParkingUpdated);
      socketService.off("crowd-status-updated", handleGateCrowdUpdated);
    };
  }, [user]);

  useEffect(() => {
    updateGoogleLiveMarkers();
  }, [latitude, longitude, liveLocations]);

  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      if (!window.google?.maps) {
        throw new Error("Google Maps script not fully loaded");
      }
      if (!mapContainer.current) return;

      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
        mapId: "DEMO_MAP_ID",
      });

      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: map.current,
        suppressMarkers: false
      });

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
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Map Layers</h3>
        
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
          <Compass size={16} /> Stadium Concourse
        </Button>

        <Button 
          variant={activeCategory === "gates" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("gates");
            setActivePath("");
            addMarkersForList(dbMarkers.filter(m => m.category === "gate"), "gates");
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
            addMarkersForList(dbParking, "parking");
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
            addMarkersForList(dbMarkers.filter(m => m.category === "medical" || m.category === "emergency"), "medical");
          }}
          className="justify-start gap-2 text-left text-sm animate-pulse-soft"
        >
          <HeartHandshake size={16} /> Medical Rooms
        </Button>

        <Button 
          variant={activeCategory === "food" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("food");
            setActivePath("");
            addMarkersForList(dbFood, "food");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <Utensils size={16} /> Food stalls
        </Button>

        <Button 
          variant={activeCategory === "services" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("services");
            setActivePath("");
            addMarkersForList(dbServices, "services");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <Compass size={16} /> Service Points
        </Button>

        <Button 
          variant={activeCategory === "ada" ? "default" : "outline"}
          onClick={() => {
            setActiveCategory("ada");
            setActivePath("");
            addMarkersForList(dbMarkers.filter(m => m.category === "seating" || m.category === "restroom" || m.category === "gate"), "ada");
          }}
          className="justify-start gap-2 text-left text-sm"
        >
          <AccessibilityIcon size={16} /> ADA Accessibility
        </Button>

        <div className="h-px bg-muted my-2" />
        <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Interactive Wayfinding</h4>

        {dbRoutes.map(route => {
          let borderTheme = "border-indigo-200 text-indigo-700 hover:bg-indigo-50";
          if (route.category === "wheelchair") borderTheme = "border-blue-200 text-blue-700 hover:bg-blue-50";
          else if (route.category === "evacuation") borderTheme = "border-emerald-200 text-emerald-700 hover:bg-emerald-50";

          return (
            <Button 
              key={route._id}
              variant="outline"
              onClick={() => {
                setActivePath(route.name);
                handleNavigateTo({
                  name: route.name,
                  latitude: route.endLatitude,
                  longitude: route.endLongitude
                });
              }}
              className={cn("justify-start gap-2 text-left text-xs", borderTheme)}
            >
              <Route size={14} /> {route.name}
            </Button>
          );
        })}

        <Button 
          variant="destructive"
          onClick={handleTriggerEmergencyEvacuation}
          className="justify-start gap-2 text-left text-xs font-semibold mt-4 btn-press"
        >
          <ShieldAlert size={14} /> Evacuate Stadium
        </Button>
      </div>

      {/* Map Area */}
      <div className="flex-1 flex flex-col relative bg-muted rounded-lg overflow-hidden border border-border">
        
        {/* Search Bar Container */}
        <div className="absolute top-4 right-4 z-10 w-80 max-w-full">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search gates, food, restrooms..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-card/95 backdrop-blur shadow-md"
            />
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(res.name);
                      setShowSearchDropdown(false);
                      handleNavigateTo(res);
                    }}
                    className="p-3 text-xs hover:bg-muted cursor-pointer flex items-center justify-between border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{res.name}</p>
                      <p className="text-muted-foreground uppercase text-[9px] tracking-wide mt-0.5">{res.category}</p>
                    </div>
                    <Navigation size={12} className="text-indigo-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Rendering Panel */}
        {googleLoadError ? (
          <div className="w-full h-[500px] bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden select-none">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <defs>
                <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.12)" strokeWidth="1" />
                </pattern>
                <style>{`
                  @keyframes dash {
                    to { stroke-dashoffset: -40; }
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

              {/* Seeded Parking Zones in SVG */}
              {dbParking.map(p => {
                const { x, y } = getSvgCoords(p.latitude, p.longitude);
                return (
                  <g key={p._id} className="cursor-pointer" onClick={() => handleNavigateTo(p)}>
                    <rect x={x - 20} y={y - 15} width="40" height="30" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" opacity={activeCategory === "parking" ? 1 : 0.6} />
                    <text x={x} y={y + 3} fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">LOT</text>
                  </g>
                );
              })}

              {/* Stadium Outer Ring */}
              <ellipse cx="300" cy="200" rx="180" ry="130" fill="#0f172a" stroke="#334155" strokeWidth="5" />
              <ellipse cx="300" cy="200" rx="150" ry="105" fill="none" stroke="#1e293b" strokeWidth="3" />
              <ellipse cx="300" cy="200" rx="120" ry="85" fill="none" stroke="#1e293b" strokeWidth="2" />

              {/* Pitch */}
              <rect x="240" y="155" width="120" height="90" fill="#14532d" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
              <circle cx="300" cy="200" r="18" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="300" y1="155" x2="300" y2="245" stroke="#ffffff" strokeWidth="1.5" />

              {/* Seeding Gate Pins in SVG */}
              {dbMarkers.filter(m => m.category === "gate").map(gate => {
                const { x, y } = getSvgCoords(gate.latitude, gate.longitude);
                return (
                  <g key={gate._id} className="cursor-pointer" onClick={() => handleNavigateTo(gate)}>
                    <ellipse cx={x} cy={y} rx="18" ry="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                    <text x={x} y={y + 3} fill="#3b82f6" fontSize="6" fontWeight="bold" textAnchor="middle">{gate.name.split(" ")[0].toUpperCase()}</text>
                  </g>
                );
              })}

              {/* Active Route drawing on SVG map */}
              {activeNavigation && activeNavigation.waypoints && (
                <path 
                  d={getSvgPathFromWaypoints(activeNavigation.waypoints)} 
                  fill="none" 
                  stroke={activeCategory === "ada" ? "#6366f1" : activeCategory === "medical" ? "#ef4444" : "#4f46e5"} 
                  strokeWidth="4" 
                  className="animated-route" 
                />
              )}

              {/* Active Landmark category markers */}
              {activeCategory === "medical" && dbMarkers.filter(m => m.category === "medical" || m.category === "emergency").map(med => {
                const { x, y } = getSvgCoords(med.latitude, med.longitude);
                return (
                  <g key={med._id} className="cursor-pointer" onClick={() => handleNavigateTo(med)}>
                    <circle cx={x} cy={y} r="8" fill="rgba(239, 68, 68, 0.3)" className="pulsing-dot" />
                    <circle cx={x} cy={y} r="5" fill="#ef4444" />
                  </g>
                );
              })}

              {activeCategory === "food" && dbFood.map(food => {
                const { x, y } = getSvgCoords(food.latitude || 40.8135, food.longitude || -74.0744);
                return (
                  <g key={food._id} className="cursor-pointer" onClick={() => handleNavigateTo(food)}>
                    <circle cx={x} cy={y} r="8" fill="rgba(245, 158, 11, 0.3)" className="pulsing-dot" />
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" />
                  </g>
                );
              })}

              {activeCategory === "services" && dbServices.map(srv => {
                const { x, y } = getSvgCoords(srv.latitude, srv.longitude);
                return (
                  <g key={srv._id} className="cursor-pointer" onClick={() => handleNavigateTo(srv)}>
                    <circle cx={x} cy={y} r="8" fill="rgba(20, 184, 166, 0.3)" className="pulsing-dot" />
                    <circle cx={x} cy={y} r="5" fill="#14b8a6" />
                  </g>
                );
              })}

              {activeCategory === "ada" && dbMarkers.filter(m => m.category === "seating" || m.category === "restroom").map(ada => {
                const { x, y } = getSvgCoords(ada.latitude, ada.longitude);
                return (
                  <g key={ada._id} className="cursor-pointer" onClick={() => handleNavigateTo(ada)}>
                    <circle cx={x} cy={y} r="8" fill="rgba(99, 102, 241, 0.3)" className="pulsing-dot" />
                    <circle cx={x} cy={y} r="5" fill="#6366f1" />
                  </g>
                );
              })}

              {/* Current user coordinate dot projection */}
              {latitude && longitude && (() => {
                const { x, y } = getSvgCoords(latitude, longitude);
                const cx = Math.max(10, Math.min(590, x));
                const cy = Math.max(10, Math.min(390, y));
                return (
                  <g key="user-dot">
                    <circle cx={cx} cy={cy} r="10" fill="rgba(79, 70, 229, 0.35)" className="pulsing-dot" />
                    <circle cx={cx} cy={cy} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={cx} y={cy - 12} fill="#818cf8" fontSize="8" fontWeight="bold" textAnchor="middle">You</text>
                  </g>
                );
              })()}

              {/* Live Staff / Volunteers rotation marker */}
              {liveLocations.map(loc => {
                if (!loc.online || loc.userId === user?.id) return null;
                const { x, y } = getSvgCoords(loc.latitude, loc.longitude);
                const cx = Math.max(10, Math.min(590, x));
                const cy = Math.max(10, Math.min(390, y));
                
                let color = "#ef4444";
                let tag = "User";
                if (loc.role === "volunteer") { color = "#10b981"; tag = "Volunteer"; }
                else if (loc.role === "organizer") { color = "#f59e0b"; tag = "Organizer"; }

                return (
                  <g key={loc.userId}>
                    <circle cx={cx} cy={cy} r="7" fill={`${color}33`} className="pulsing-dot" />
                    <circle cx={cx} cy={cy} r="4" fill={color} stroke="#ffffff" strokeWidth="1" />
                    <text x={cx} y={cy - 9} fill={color} fontSize="6" fontWeight="semibold" textAnchor="middle">{tag}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
        )}

        {/* Live Navigation step by step display */}
        {activeNavigation && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur p-4 rounded-lg shadow-lg border border-border max-w-lg mx-auto animate-slide-in-up">
            <div className="flex items-start justify-between border-b border-border pb-2 mb-2">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="text-indigo-600 h-4 w-4" />
                  Directions to {selectedDestination?.name || "Destination"}
                </h4>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5"><Clock size={10} /> {activeNavigation.walkTime} min walk</span>
                  <span>•</span>
                  <span>{activeNavigation.distance} meters</span>
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={clearOverlays} className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
            </div>
            
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {activeNavigation.steps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-[9px] mt-0.5 shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
