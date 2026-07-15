# StadiumIQ AI - API Documentation

This document describes the API endpoints exposed by the StadiumIQ AI backend server (running on `http://localhost:5000/api` by default).

---

## 1. Authentication APIs (`/api/auth`)

### Register User
* **Method & URL**: `POST /auth/register`
* **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+15550001",
    "password": "SecurePassword123!",
    "role": "fan",
    "country": "USA"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60d5ec4b1234567890abcdef",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+15550001",
      "role": "fan",
      "country": "USA"
    }
  }
  ```

### Login User
* **Method & URL**: `POST /auth/login`
* **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60d5ec4b1234567890abcdef",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+15550001",
      "role": "fan",
      "country": "USA"
    }
  }
  ```

### Get User Profile
* **Method & URL**: `GET /auth/profile`
* **Headers**: `Authorization: Bearer <access_token>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "60d5ec4b1234567890abcdef",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+15550001",
      "role": "fan",
      "country": "USA",
      "stadiumPreferences": ["Section B - Row 12"],
      "favoriteTeam": "USA"
    }
  }
  ```

### Refresh Session Token
* **Method & URL**: `POST /auth/refresh-token`
* **Headers**: Sent with HttpOnly `refresh_token` cookie.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

---

## 2. User Management APIs (`/api/users`)

### Get All Users
* **Method & URL**: `GET /users`
* **Role Restrict**: Organizer, Admin
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "id": "60d5ec4b1234567890abcdef",
          "fullName": "Demo Volunteer",
          "email": "volunteer@demo.stadiumiq.ai",
          "role": "volunteer"
        }
      ],
      "totalDocs": 1,
      "page": 1,
      "pages": 1
    }
  }
  ```

---

## 3. Matches & Stadium APIs

### Get All Scheduled Matches
* **Method & URL**: `GET /matches`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "docs": [
        {
          "id": "60d5ec4b1234567890abc001",
          "homeTeam": "USA",
          "awayTeam": "Mexico",
          "date": "2026-06-18T18:00:00.000Z",
          "kickoffTime": "8:00 PM",
          "stadiumId": {
            "name": "MetLife Stadium",
            "city": "East Rutherford"
          },
          "seatAvailability": 15400,
          "weather": "Clear, 72°F",
          "status": "scheduled"
        }
      ]
    }
  }
  ```

---

## 4. Tickets API (`/api/tickets`)

### Book Ticket
* **Method & URL**: `POST /tickets`
* **Request Body**:
  ```json
  {
    "matchId": "60d5ec4b1234567890abc001",
    "section": "Section B",
    "row": "Row 12",
    "seatNumber": "15"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Ticket booked successfully",
    "data": {
      "id": "60d5ec4b1234567890abc999",
      "userId": "60d5ec4b1234567890abcdef",
      "matchId": "60d5ec4b1234567890abc001",
      "section": "Section B",
      "row": "Row 12",
      "seatNumber": "15",
      "ticketStatus": "active"
    }
  }
  ```

---

## 5. SOS Emergency Services API (`/api/sos`)

### Dispatch SOS Alert
* **Method & URL**: `POST /sos`
* **Request Body**:
  ```json
  {
    "location": "Section B - Row 12",
    "emergencyType": "Medical Help"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "SOS dispatch signal transmitted successfully",
    "data": {
      "id": "60d5ec4b1234567890abcsos",
      "userId": "60d5ec4b1234567890abcdef",
      "location": "Section B - Row 12",
      "emergencyType": "Medical Help",
      "status": "active"
    }
  }
  ```

### Resolve / Assign SOS Responder
* **Method & URL**: `PUT /sos/:id`
* **Role Restrict**: Volunteer, Organizer, Admin
* **Request Body**:
  ```json
  {
    "status": "resolved"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "SOS status updated",
    "data": {
      "id": "60d5ec4b1234567890abcsos",
      "status": "resolved"
    }
  }
  ```

---

## 6. Generative AI APIs (`/api/ai`)

### AI Assistant Query (Chat / Assist)
* **Method & URL**: `POST /ai/chat`
* **Request Body**:
  ```json
  {
    "prompt": "How do I get to Gate 3 from Parking Lot A?",
    "feature": "navigation",
    "language": "en"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "prompt": "How do I get to Gate 3 from Parking Lot A?",
      "response": "To get to Gate 3 from Parking Lot A, proceed east along the outer concourse loop. Walk about 400 meters following the green line markers on the pathway. The gate will be directly in front of you.",
      "feature": "navigation"
    }
  }
  ```

### Get AI Conversation History
* **Method & URL**: `GET /ai/history?feature=chat`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "prompt": "How do I get to Gate 3 from Parking Lot A?",
        "response": "To get to Gate 3...",
        "feature": "navigation",
        "timestamp": "2026-07-15T20:30:00.000Z"
      }
    ]
  }
  ```

---

## 7. System Analytics API (`/api/admin`)

### Get Operational Analytics
* **Method & URL**: `GET /admin/analytics`
* **Role Restrict**: Admin
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "visitors": 45230,
      "AIRequests": 12450,
      "crowdReports": 86,
      "incidents": 23,
      "popularRoutes": ["Gate 3 to Section B", "Metro Station to Gate 1"],
      "foodOrders": 324
    }
  }
  ```
