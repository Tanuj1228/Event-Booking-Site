# EventEase 🎟️

EventEase is a robust, real-time web-based Event Ticket Booking and Seat Management portal. It enables users to browse events, select seats interactively, and securely book tickets while preventing double-booking through high-concurrency controls.

## Features
- **Role-Based Access Control:** Secure JWT authentication for Admins and Users.
- **Real-Time Seat Synchronization:** Instant broadcast of seat availability using Socket.IO.
- **Concurrency Control:** Redis in-memory caching for atomic seat-locking to prevent double-booking.
- **Admin Dashboard:** Centralized management for creating and monitoring events.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Caching:** Redis
- **Real-Time:** Socket.IO
- **Testing:** Jest
- **Frontend:** HTML5, CSS3, Vanilla JavaScript

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd eventease
   ```
2. **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
Configure .env file with your MONGO_URI, REDIS_HOST, REDIS_PORT, and JWT_SECRET.

3. **Start the application:**

```bash
# Make sure Redis server is running locally or configured remotely
npm run dev
```
4. **Frontend:**
Open frontend/index.html in any modern web browser or serve via Live Server.