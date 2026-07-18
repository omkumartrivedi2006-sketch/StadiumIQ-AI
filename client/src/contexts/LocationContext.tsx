import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./AuthContext";
import { socketService } from "@/services/socket";
import { apiClient } from "@/api/client";

export type TrackingStatus = "granted" | "denied" | "prompt";

interface LocationContextType {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  isTracking: boolean;
  trackingStatus: TrackingStatus;
  lastUpdated: Date | null;
  requestPermission: () => Promise<boolean>;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopTracking: () => void;
  deleteHistory: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(() => {
    const saved = localStorage.getItem("stadium_location_permission");
    return (saved as TrackingStatus) || "prompt";
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Sync coords to server via Socket/HTTP
  const syncLocation = async (lat: number, lng: number, acc: number, head: number | null, spd: number | null) => {
    if (!user) return;

    // Send through Socket.IO
    socketService.emit("update-location", {
      latitude: lat,
      longitude: lng,
      accuracy: acc,
      heading: head,
      speed: spd,
    });

    // Also sync via HTTP API as a backup
    try {
      await apiClient.post("/location/update", {
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        heading: head,
        speed: spd,
      });
    } catch (err) {
      console.warn("HTTP Location Sync Error:", err);
    }
  };

  const startWatching = () => {
    if (watchIdRef.current !== null) return;
    if (!("geolocation" in navigator)) {
      console.warn("Browser does not support Geolocation API");
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc, heading: head, speed: spd } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(acc);
        setHeading(head);
        setSpeed(spd);
        setLastUpdated(new Date());

        // Sync with backend
        syncLocation(lat, lng, acc, head, spd);
      },
      (error) => {
        console.warn("Geolocation watch error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const requestPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setTrackingStatus("denied");
        localStorage.setItem("stadium_location_permission", "denied");
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTrackingStatus("granted");
          localStorage.setItem("stadium_location_permission", "granted");
          
          const { latitude: lat, longitude: lng, accuracy: acc, heading: head, speed: spd } = position.coords;
          setLatitude(lat);
          setLongitude(lng);
          setAccuracy(acc);
          setHeading(head);
          setSpeed(spd);
          setLastUpdated(new Date());
          
          startWatching();
          resolve(true);
        },
        (error) => {
          setTrackingStatus("denied");
          localStorage.setItem("stadium_location_permission", "denied");
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const pauseTracking = () => {
    stopWatching();
  };

  const resumeTracking = () => {
    if (trackingStatus === "granted") {
      startWatching();
    }
  };

  const stopTracking = async () => {
    stopWatching();
    setLatitude(null);
    setLongitude(null);
    setAccuracy(null);
    setHeading(null);
    setSpeed(null);
    try {
      await apiClient.delete("/location/stop");
    } catch (err) {
      console.warn("Error notifying backend of location stop:", err);
    }
  };

  const deleteHistory = async () => {
    await stopTracking();
    setTrackingStatus("prompt");
    localStorage.removeItem("stadium_location_permission");
  };

  // Auto-start tracking on load/auth if already granted
  useEffect(() => {
    if (user && trackingStatus === "granted") {
      startWatching();
    } else {
      stopWatching();
    }

    return () => stopWatching();
  }, [user, trackingStatus]);

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        isTracking,
        trackingStatus,
        lastUpdated,
        requestPermission,
        pauseTracking,
        resumeTracking,
        stopTracking,
        deleteHistory,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
