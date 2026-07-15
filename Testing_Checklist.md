# StadiumIQ AI - Quality Assurance & Testing Checklist

This document details the automated tests and manual testing scenarios to verify the functionality, security, and performance of StadiumIQ AI before submission.

---

## 1. Automated Testing

You can run automated syntax, compilation, and integration tests locally.

### A. TypeScript Verification
Ensure there are no compilation or type safety violations in both the frontend and backend:
```bash
pnpm run check
```

### B. REST API Integration Verification
Verify that the server routes, database connection, schema validations, and controllers are responsive:
1. Start the server: `pnpm run dev:server` (ensure it runs on `http://localhost:5000`)
2. Run the integration test suite in a separate terminal:
   ```bash
   pnpm run test:api
   ```
This automated script tests the following endpoints:
* `POST /api/auth/login` (Authentication verification)
* `GET /api/auth/profile` (Profile fetching and header injection)
* `GET /api/stadiums` (Stadium schemas verification)
* `GET /api/matches` (Match database entries check)
* `GET /api/food` (Food vendor database fetch)
* `GET /api/transport` (Transit options fetch)
* `POST /api/sos` (SOS distress dispatch mechanism)
* `GET /api/notifications` (Announcements check)

---

## 2. Manual QA Verification Checklist

Use these test cases to manually inspect dashboards during judging.

### Case 1: Fan Experience (Quick Judging)
1. **Demo Login**:
   * Navigate to `http://localhost:3000/login`.
   * Click **Fan Demo**. Verify you are logged in as `Demo Fan (Alex)` and redirected to `/dashboard`.
2. **Map Interaction**:
   * Go to the **Live Map** tab.
   * Click **Entrance Gates**, **Parking Lots**, and **Medical Centers**. Verify that the Leaflet map dynamically draws colored circular markers.
   * Click **Parking to Gate 3** route. Verify that an emerald polyline is drawn on the map with start/end popups.
3. **AI Chat Assistant**:
   * Go to the **AI Chat** tab.
   * Enter a query: *"Where can I buy vegan food?"*. Verify that the Gemini AI answers with the correct stall (e.g. Halal & Vegan Stalls Court) and details.
4. **Ticket Booking**:
   * Navigate to **My Tickets** tab.
   * Select a match (e.g. USA vs Mexico), choose Section B, and click **Book Ticket**. Verify that a ticket is generated immediately and appears in the list.

### Case 2: Volunteer Operations
1. **Demo Login**:
   * Go to the login screen and click **Volunteer Demo**. Verify redirection to `/volunteer`.
2. **Task Board**:
   * Verify that active SOS alerts are visible under the **Assigned Emergency Tasks** panel.
   * Click **Accept Task** on an active alert. Verify that the task status updates in real-time.
3. **Lost & Found Submission**:
   * Fill out the **Report Found Item** form (e.g., "Silver keys" at "Gate 3").
   * Submit. Verify that it appears instantly under the reported items log.
4. **AI Translator**:
   * Enter a phrase into the AI Translator (e.g. *"First aid is on its way"* and choose Spanish).
   * Verify that the AI translates the emergency phrase correctly.

### Case 3: Organizer Dashboard
1. **Demo Login**:
   * Click **Organizer Demo**. Verify redirection to `/organizer`.
2. **Broadcast Advisory**:
   * Write an advisory: *"Gate 1 is currently full, please use Gate 3."* and click **Send Broadcast**.
   * Open the Fan Dashboard in another window (or look at the notifications center). Verify that the advisory is received instantly via WebSockets.
3. **Emergency Monitor**:
   * Verify that the organizer can view all active SOS distress events with coordinates.

### Case 4: Admin Dashboard
1. **Demo Login**:
   * Click **Admin Demo**. Verify redirection to `/admin`.
2. **Operational Stats**:
   * Verify that visitor statistics, AI API counts, and incident logs load correctly on the analytics grid.
3. **Search Indexing**:
   * Search for "Gate" in the admin dashboard search bar. Verify that matches, stadiums, and vendors containing "Gate" are returned instantly.
