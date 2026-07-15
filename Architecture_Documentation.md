# StadiumIQ AI - System Architecture Documentation

This document describes the architectural design and structural patterns of the StadiumIQ AI platform.

---

## 1. High-Level Architectural Flow

```text
       [ React Client (SPA) ]  <======== (WebSocket Events) ========> [ Socket.IO Server ]
                 |                                                           |
           (HTTP Requests)                                             (Role Rooms)
                 v                                                           v
       [ Express API Server ]                                      [ Fan, Vol, Org, Admin ]
                 |
        +--------+--------+
        |                 |
  (Auth / JWT)    (Service Layer)
        |                 |
        |        +--------+--------+
        |        |                 |
        v        v                 v
   [ Mongoose ] [ Gemini AI ]  [ Repositories (Persist / Mock) ]
        |
        v
   [ MongoDB ]
```

---

## 2. Frontend Architecture (React)

The frontend is a single-page application built on **React 19** and **Vite 7**, leveraging TypeScript.

### State & Contexts
* **[AuthContext](file:///c:/Users/OM%20TRIVEDI/Desktop/promptwar%204/client/src/contexts/AuthContext.tsx)**: Manages logged-in user profile state, session tokens, login/logout transitions, and establishes WebSocket connections on auth state changes.
* **ThemeContext**: Handles light/dark styling state.

### Routing & Security Guard
* **Wouter**: A lightweight, fast routing library.
* **[authGuard.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/promptwar%204/client/src/middleware/authGuard.tsx)**: Higher-Order component that checks if a user is authenticated and verifies that their role permits access to the requested view (e.g. restricting `/admin` to administrators).

### Components Layout
* **Shared Views**:
  * **[Map.tsx](file:///c:/Users/OM%20TRIVEDI/Desktop/promptwar%204/client/src/components/Map.tsx)**: Standardized Leaflet and OpenStreetMap rendering component, managing custom marker categories and path polylines.
  * **Navigation**: Responsive navbar with role-specific items.
  * **NotificationCenter**: Real-time notifications popover.
* **Dashboards**: Specific customized layouts for Fans, Volunteers, Organizers, and Admins.

---

## 3. Backend Architecture (Express)

The backend is built with **Node.js** and **Express**, using ES Modules. It implements the **Controller-Service-Repository (CSR)** pattern:

```text
Route (HTTP) ──> Controller (Parse/Validate) ──> Service (Business Logic) ──> Repository (Database Access)
```

1. **Routes Layer**: Declares paths and binds them to validation middleware and controllers.
2. **Controllers Layer**: Parses incoming HTTP requests, extracts parameters, coordinates service calls, and returns standardized JSON responses.
3. **Services Layer**: Encapsulates core business rules, coordinates calls to the Gemini AI API, and logs operations.
4. **Repositories Layer**: Inherits from a unified `BaseRepository`. Directs commands to Mongoose models or delegates to an in-memory array store when Mongoose/MongoDB is disconnected.

---

## 4. Database Architecture (Mongoose & Mock Fallback)

### Mongoose Schema Schemas
* **User**: Full profile details, role, verification flags, hashed passwords, and active refresh token.
* **Stadium**: Stadium name, capacity, coordinates, and lists of gates, parking lots, food zones, and medical stations.
* **Match**: Teams, date, stadium reference, kickoff time, weather, and remaining seats.
* **Ticket**: Binds a user to a match with seat coordinates (section, row, seat).
* **SOSReport**: Real-time distress logs including location, type, responder assignment, and status.
* **CrowdReport**: Volunteer density reports at specific gates or zones.
* **AIChatHistory**: Prompts and responses tagged by user role and functional feature to maintain conversation context.

### In-Memory Fallback Mode
When local MongoDB is unavailable, [baseRepository.ts](file:///c:/Users/OM%20TRIVEDI/Desktop/promptwar%204/server/repositories/baseRepository.ts) automatically falls back to an in-memory database store. It replicates basic queries, regex lookups, pagination, soft deletes, and document mutations, ensuring the system runs immediately in zero-dependency environments.

---

## 5. Security & Authentication Flow

1. **Login & Registration**: User enters credentials. Server hashes password with `bcryptjs` (cost factor 10).
2. **JWT Issuance**: On login, server returns:
   * **Access Token**: Short-lived (15 mins) payload containing `id` and `role`, attached in HTTP headers by Axios.
   * **Refresh Token**: Long-lived (7 days) payload, sent as a signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
3. **Automatic Re-auth Interceptor**:
   * Axios intercepts responses.
   * If a `401 Unauthorized` is returned (expired Access Token), it pauses queue requests, calls `/api/auth/refresh-token` to exchange the refresh cookie for a new access token, and retries the original request.
   * If refresh fails, it redirects to `/login`.

---

## 6. Real-time Communication (Socket.IO)

1. **Connection**: Triggered automatically in `AuthContext` upon successful login.
2. **Room Assignment**:
   * The client connects and sends user metadata.
   * The server assigns the socket to specific room channels based on the user's role:
     * `fan`: Receives global announcements and transit alerts.
     * `volunteer`: Receives dispatched SOS emergency events.
     * `organizer` / `admin`: Receives incoming SOS alerts, volunteer check-ins, and crowd reports.
3. **Incident Management**:
   * A Fan clicks **Trigger SOS**.
   * Backend writes the SOS log and broadcasts the event to the `volunteer`, `organizer`, and `admin` rooms.
   * A Volunteer accepts the SOS. The backend updates the database and broadcasts the assignment to all rooms, updating UI state in real-time.
