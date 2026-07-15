export interface User {
  id: string;
  name: string;
  email: string;
  role: "fan" | "volunteer" | "organizer" | "admin";
  seat?: string;
  language: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface GateStatus {
  gate: string;
  crowd: "Low" | "Medium" | "High";
  visitors: number;
  status: "live" | "caution" | "unavailable";
}

export interface SOSAlert {
  id: string;
  userId?: string;
  userRole?: string;
  location: string;
  timestamp: Date;
  status: "active" | "pending" | "resolved";
}

export interface FoodStall {
  id: number;
  name: string;
  category: string;
  queueTime: number;
  rating: number;
  distance: string;
  location: string;
  price: string;
}

export interface TransportOption {
  id: number;
  type: string;
  icon: string;
  waitTime: string;
  fare: string;
  distance: string;
  rating: number;
}
