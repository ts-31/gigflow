# GigFlow

GigFlow is a freelance marketplace application where users can post gigs, place bids, and hire freelancers. The platform features real-time notifications and secure hiring transactions.

## Live Demo

- **Frontend (Render – Static)**:  
  👉 https://gigflow-1-58e6.onrender.com/

- **Backend API (Render – Express)**:  
  👉 https://gigflow-sqra.onrender.com  
  ⚠️ *Note: Backend is hosted on Render free tier and may take a few seconds to spin up on first request.*

- **Demo Video (2 mins)**:  
  🎥 https://drive.google.com/file/d/1lTdm5Iao43s6bzm1yupqiP4pnOpVW3F-/view

---

## Features

- **Authentication**: Secure user registration and login using JWT and HttpOnly cookies.
- **Gig Management**: Create and browse gigs.
- **Bidding System**: Freelancers can submit bids on open gigs with messages.
- **Hiring Logic (Bonus 1)**: Uses MongoDB transactions to ensure atomic updates and prevent race conditions and double-hiring.
- **Real-time Notifications (Bonus 2)**: Instant "gig:hired" alerts for freelancers using Socket.io.

## Tech Stack

- **Frontend**: React, Vite, Axios, React Hot Toast, Lucide React, Socket.io-client.
- **Backend**: Node.js, Express.js, JWT, Cookie-parser, Socket.io.
- **Database**: MongoDB with Mongoose (Replica Set required for Transactions).

## Folder Structure

```text
gigFlow/
├── client/      # React frontend (Vite)
└── server/      # Node.js backend (Express)
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/ts-31/gigflow
cd gigflow
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

### 3. Environment Variables

Create a `.env` file in the `server` directory based on `server/.env.example`.

**Server `.env` example:**
```env
PORT=5000
MONGODB_URI=mongodb://your_replica_set_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

Create a `.env` file in the `client` directory based on `client/.env.example`.

**Client `.env` example:**
```env
VITE_BACKEND_URL=your_backend_url # Leave empty for local development to use Vite proxy
```

### 4. Run the Application

**Run Backend:**
```bash
cd server
npm run dev
```

**Run Frontend:**
```bash
cd client
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/gigs` | List all open gigs | Public |
| POST | `/api/gigs` | Create a new gig | Private |
| POST | `/api/bids` | Submit a bid | Private |
| GET | `/api/bids/:gigId` | Get bids for a gig | Private |
| PATCH | `/api/bids/:bidId/hire` | Hire for a bid | Private |

## Notes

- **MongoDB Transactions**: A MongoDB Replica Set is required for the hiring transaction logic to function.
- **Socket.io**: Real-time notification socket connects on login and disconnects on logout.

