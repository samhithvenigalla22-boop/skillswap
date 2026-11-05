# SkillSwap – Learn One. Teach One.

A peer-to-peer collaborative knowledge exchange web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, and Socket.IO.

---

## 1. Project Title
**SkillSwap – Learn One. Teach One.**

## 2. Project Description
SkillSwap is a collaborative peer-to-peer skill barter platform where users exchange practical knowledge and mentorship without financial transactions. 

For example, a user experienced in **Python Programming** who wants to learn **UI/UX Design** can discover and connect with another user who specializes in **UI/UX Design** and seeks to learn **Python**. Once matched, both users exchange swap requests, collaborate via real-time WebSocket chat, schedule learning sessions with calendar and meeting links, and submit verified ratings and reviews upon completion.

---

## 3. Problem Statement
In today's digital learning ecosystem:
1. **Financial Barriers:** High subscription fees for courses, bootcamps, and 1:1 tutoring prevent millions of aspiring learners and students from gaining new competencies.
2. **Passive Isolation:** Video courses lack real-time accountability, live Q&A, and interactive personalized feedback.
3. **Underutilized Knowledge:** Individuals possess rich domain experience (coding, design, languages, marketing) but lack a structured barter mechanism to trade skills without monetary friction.
4. **Informal Trading Friction:** Ad-hoc learning exchanges on social media lack verified credentials, scheduling tools, progress tracking, and peer reviews.

---

## 4. Project Objectives
1. **Peer-to-Peer Barter Economy:** Provide a structured platform to exchange skills without monetary transactions.
2. **Complementary Skill Matching:** Connect users through a deterministic matching algorithm based on reciprocal offers, wanted skills, proficiency levels, and category synergies.
3. **Active Collaboration Management:** Facilitate proposals, active swap tracking, session timetables, and completion milestones.
4. **Real-time Communication:** Deliver instantaneous, authenticated messaging using Socket.IO with typing indicators and online/offline status.
5. **Trust & Accountability:** Incentivize high-quality mentorship through verified 1–5 star reviews and ratings.
6. **Platform Safety & Moderation:** Provide role-based administrative oversight to manage users, suspend abusive accounts, and moderate listings.

---

## 5. Technologies Used

### Frontend
- **Framework:** React.js (v18) with Vite
- **Styling:** Tailwind CSS (Modern SaaS palette: Deep Indigo `#5145CD`, Violet `#8B5CF6`, Dark Slate `#0F172A`)
- **Routing:** React Router DOM (v6) with protected and role-guarded routes
- **HTTP Client:** Axios with request/response interceptors for JWT token injection
- **Real-time:** Socket.IO Client (v4)
- **Icons:** Lucide React
- **State Management:** React Context API (`AuthContext`, `ThemeContext`, `NotificationContext`, `SocketContext`)

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (REST API architecture)
- **Database ODM:** Mongoose (v8)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs (password hashing with salt rounds)
- **Real-time WebSockets:** Socket.IO (v4) with JWT authentication handshake
- **Security & Middleware:** Helmet, CORS, Express Rate Limit, Morgan logging

### Database
- **Primary Database:** MongoDB Atlas (Cloud Cluster)
- **Local/CI Fallback:** In-memory MongoDB support (`mongodb-memory-server`) for zero-setup local testing

### Deployment & DevOps
- **Frontend Hosting:** Vercel (Edge network, SPA rewrite rules)
- **Backend Hosting:** Render (Web Service, WebSocket support)
- **Database:** MongoDB Atlas
- **Source Code Management:** Git & GitHub

---

## 6. Features and Functionalities

1. **User Authentication & Profiles:**
   - Registration with email validation, password strength meter, and bcrypt hashing.
   - Secure login with JWT authentication, rate limiting, and session persistence.
   - Comprehensive profile management: avatar, bio, location, interests, skills offered, skills wanted, and received reviews.
   - Dual-theme system (Dark Mode & Light Mode) with instant toggle.

2. **Skill Management:**
   - Add, edit, and delete skills across **17 categories** (Programming, Web Dev, Mobile Dev, AI, ML, Data Science, UI/UX, Graphic Design, Video Editing, Digital Marketing, Languages, Business, Finance, etc.).
   - Define proficiency levels: *Beginner*, *Intermediate*, *Advanced*, *Expert*.
   - Separate tabs for skills you **Offer (Teach)** and skills you **Want (Learn)**.

3. **Explore & Discovery Marketplace:**
   - Database-driven search across skill names, descriptions, and instructors.
   - Multi-parameter filtering by Category, Proficiency Level, and Listing Type.
   - Sorting by *Newest First*, *Highest Rated Instructor*, and *Alphabetical*.
   - Responsive user profile cards with quick swap proposal trigger.

4. **Deterministic Skill Matching System:**
   - Algorithmic compatibility scoring based on:
     - Direct two-way reciprocal matches (+60%)
     - One-way complementary matches (+35%)
     - Exact skill name alignment (+16% max)
     - Teacher proficiency bonus (+12% max)
     - Profile completeness and verified reputation (+12% max)
   - Detailed breakdown explaining why two users were matched.

5. **Swap Request Workflow:**
   - Send barter proposals specifying what you offer and what you request.
   - Tabbed view for **Received Requests** and **Sent Requests**.
   - Receiver can **Accept** (initiating an Active Swap) or **Decline**.
   - Sender can **Cancel** pending proposals before acceptance.

6. **Active Swap Collaborations:**
   - Dedicated dashboard for active and completed learning exchanges.
   - Progress tracking, session countdowns, and quick chat shortcuts.
   - Mutual swap completion trigger unlocking student reviews.

7. **Real-time Socket.IO Messaging:**
   - Authenticated WebSocket rooms restricted exclusively to active swap participants.
   - Live message transmission and MongoDB persistence.
   - Online/offline presence badges and typing indicators.

8. **Learning Session Scheduler:**
   - Integrated timetable management for 1:1 barter calls.
   - Chronological validation (*End time must be after start time*).
   - Video conference link integration (Google Meet, Zoom).
   - Session status tracking (*Scheduled*, *Completed*, *Cancelled*).

9. **Verified Reviews & Ratings:**
   - 1–5 star rating scale with written feedback for completed swaps.
   - Unique database constraints preventing duplicate reviews for the same exchange.
   - Average score computation and visual star rating distributions on user profiles.

10. **In-App Notifications:**
    - Live notifications for swap proposals, acceptances, chat messages, scheduled sessions, and reviews.
    - Unread counters and "Mark All as Read" functionality.

11. **Admin Control Console:**
    - Platform telemetry: total users, skills, active swaps, completed swaps, average platform rating.
    - User management: search users, view activity, and suspend/reactivate accounts.
    - Content moderation: search and remove inappropriate or violating skill listings.

---

## 7. System Architecture

```
[ User Browser (React + Tailwind CSS + Lucide) ]
        |                              ^
        | HTTPS REST API (Axios)       | WSS (Socket.IO Events)
        v                              v
[ Node.js + Express.js API & WebSocket Gateway ]
        |
        +---> Auth Middleware (JWT Token Verification & Rate Limiting)
        +---> Controllers (Auth, User, Skill, Match, Swap, Session, Review, Admin)
        +---> Matching Algorithm Engine (Deterministic Scoring)
        +---> Socket Handler (Authenticated Rooms, Typing, Presence)
        |
        v Mongoose ODM
[ MongoDB Atlas Database (Users, Skills, Swaps, Sessions, Messages, Reviews, Notifications) ]
```

---

## 8. Database Design

### User Collection
- `name` (String, required, trim)
- `email` (String, required, unique, indexed)
- `password` (String, required, select: false, bcrypt hashed)
- `profilePicture` (String, URL)
- `bio` (String, max 500 chars)
- `location` (String)
- `interests` ([String])
- `role` (String, enum: ['user', 'admin'], default: 'user')
- `isActive` (Boolean, default: true)
- `createdAt`, `updatedAt` (Timestamps)

### Skill Collection
- `userId` (ObjectId ref User, required, indexed)
- `skillName` (String, required, trim)
- `category` (String, enum: 17 categories, indexed)
- `skillType` (String, enum: ['Offer', 'Want'], indexed)
- `proficiencyLevel` (String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'])
- `description` (String)
- Compound index: `{ skillType: 1, category: 1, skillName: 1 }`

### SwapRequest Collection
- `senderId` (ObjectId ref User, required, indexed)
- `receiverId` (ObjectId ref User, required, indexed)
- `offeredSkillId` (ObjectId ref Skill, required)
- `requestedSkillId` (ObjectId ref Skill, required)
- `message` (String)
- `status` (String, enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'], default: 'Pending')
- `createdAt`, `updatedAt` (Timestamps)

### Swap Collection
- `requestId` (ObjectId ref SwapRequest, required, unique)
- `participants` ([ObjectId ref User], length 2, indexed)
- `offeredSkill` (ObjectId ref Skill, required)
- `requestedSkill` (ObjectId ref Skill, required)
- `status` (String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active', indexed)
- `startedAt` (Date, default: Date.now)
- `completedAt` (Date)

### Message Collection
- `swapId` (ObjectId ref Swap, required, indexed)
- `senderId` (ObjectId ref User, required)
- `receiverId` (ObjectId ref User, required)
- `message` (String, required)
- `readAt` (Date, default: null)
- `createdAt`, `updatedAt` (Timestamps)

### Session Collection
- `swapId` (ObjectId ref Swap, required, indexed)
- `title` (String, required)
- `description` (String)
- `scheduledDate` (Date, required)
- `startTime` (String, required)
- `endTime` (String, required)
- `meetingLink` (String)
- `status` (String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled')
- `createdBy` (ObjectId ref User, required)

### Review Collection
- `swapId` (ObjectId ref Swap, required)
- `reviewerId` (ObjectId ref User, required)
- `revieweeId` (ObjectId ref User, required, indexed)
- `rating` (Number, min: 1, max: 5, required)
- `comment` (String)
- Compound unique index: `{ swapId: 1, reviewerId: 1 }` (Prevents duplicate reviews)

### Notification Collection
- `userId` (ObjectId ref User, required, indexed)
- `type` (String, enum: ['SWAP_REQUEST', 'SWAP_ACCEPTED', 'SWAP_REJECTED', 'SWAP_CANCELLED', 'NEW_MESSAGE', 'SESSION_SCHEDULED', 'SESSION_UPDATED', 'SWAP_COMPLETED', 'NEW_REVIEW', 'SYSTEM'])
- `title` (String, required)
- `message` (String, required)
- `relatedId` (ObjectId)
- `isRead` (Boolean, default: false, indexed)

---

## 9. API Documentation

### Authentication APIs (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Private |

### User APIs (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users` | List users with search and pagination | Public |
| `GET` | `/api/users/:id` | Get user details with skills and reviews | Public |
| `PUT` | `/api/users/profile` | Update profile information | Private |
| `PUT` | `/api/users/change-password` | Update account password | Private |

### Skill Marketplace APIs (`/api/skills`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/skills` | Create a new Offer or Want skill | Private |
| `GET` | `/api/skills` | Search, filter, and paginate skills | Public |
| `GET` | `/api/skills/my-skills` | Fetch current user's skills | Private |
| `GET` | `/api/skills/:id` | Get single skill details | Public |
| `PUT` | `/api/skills/:id` | Update skill listing | Private (Owner) |
| `DELETE` | `/api/skills/:id` | Remove skill listing | Private (Owner) |

### Matching Engine APIs (`/api/matches`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/matches` | Retrieve algorithmic skill matches | Private |
| `GET` | `/api/matches/:userId` | Match score with a specific user | Private |

### Swap Workflow APIs (`/api/swaps`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/swaps/request` | Submit skill swap proposal | Private |
| `GET` | `/api/swaps/sent` | List sent swap requests | Private |
| `GET` | `/api/swaps/received` | List received swap requests | Private |
| `GET` | `/api/swaps/active` | List active / completed swaps | Private |
| `GET` | `/api/swaps/:id` | Get swap details | Private (Participant) |
| `PUT` | `/api/swaps/:id/accept` | Accept swap and create Active Swap | Private (Receiver) |
| `PUT` | `/api/swaps/:id/reject` | Reject swap proposal | Private (Receiver) |
| `PUT` | `/api/swaps/:id/cancel` | Cancel swap proposal | Private (Sender) |
| `PUT` | `/api/swaps/:id/complete` | Mark swap exchange as completed | Private (Participant) |

### Messaging APIs (`/api/messages`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/messages/:swapId` | Get chat message history | Private (Participant) |
| `POST` | `/api/messages/:swapId` | Send a message in active swap | Private (Participant) |

### Session Scheduler APIs (`/api/sessions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/sessions` | Schedule a learning session | Private (Participant) |
| `GET` | `/api/sessions` | List sessions (optional `status` filter) | Private |
| `GET` | `/api/sessions/:id` | Get session details | Private (Participant) |
| `PUT` | `/api/sessions/:id` | Update scheduled session | Private (Participant) |
| `DELETE` | `/api/sessions/:id` | Cancel scheduled session | Private (Participant) |
| `PUT` | `/api/sessions/:id/complete` | Mark session as completed | Private (Participant) |

### Review & Rating APIs (`/api/reviews`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/reviews` | Submit 1–5 star review for completed swap | Private (Participant) |
| `GET` | `/api/reviews/user/:userId` | Get verified reviews for a user | Public |

### Notification APIs (`/api/notifications`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | Get in-app notification alerts | Private |
| `PUT` | `/api/notifications/:id/read` | Mark single notification as read | Private |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Private |

### Admin Moderation APIs (`/api/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Platform metrics & KPIs | Private (Admin) |
| `GET` | `/api/admin/users` | List users with search & filters | Private (Admin) |
| `PUT` | `/api/admin/users/:id/status` | Suspend or reactivate user | Private (Admin) |
| `GET` | `/api/admin/skills` | List all platform skill listings | Private (Admin) |
| `DELETE` | `/api/admin/skills/:id` | Remove violating skill listing | Private (Admin) |

---

## 10. Folder Structure

```
skill-swap/
├── client/                     # Frontend React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Static visual assets
│   │   ├── components/         # Reusable UI & Layout Components
│   │   │   ├── common/         # Navbar, Footer, Button, Modal, RatingStars, Badge, Toast
│   │   │   └── layout/         # AppLayout, ProtectedRoute, AdminRoute
│   │   ├── context/            # React Contexts (Auth, Theme, Notification, Socket)
│   │   ├── pages/              # 18 Full Application Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExploreSkillsPage.jsx
│   │   │   ├── SkillDetailsPage.jsx
│   │   │   ├── MyProfilePage.jsx
│   │   │   ├── EditProfilePage.jsx
│   │   │   ├── ManageSkillsPage.jsx
│   │   │   ├── SkillMatchesPage.jsx
│   │   │   ├── SwapRequestsPage.jsx
│   │   │   ├── ActiveSwapsPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── SessionSchedulingPage.jsx
│   │   │   ├── ReviewsPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/           # Axios API services for all modules
│   │   ├── utils/              # Constants, date formatters, initials
│   │   ├── App.jsx             # React Router DOM configuration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives & theme rules
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json             # Vercel SPA rewrite rules
│   ├── .env.example
│   └── package.json
│
├── server/                     # Backend Node.js & Express.js REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection with Mongo Atlas & In-Memory fallback
│   ├── controllers/            # Module controllers (Auth, Skills, Matches, Swaps, Chat, etc.)
│   ├── middleware/             # Auth, Admin RBAC, Error Handling middlewares
│   ├── models/                 # Mongoose schemas (User, Skill, Swap, Session, Message, Review, Notif)
│   ├── routes/                 # Express route definitions
│   ├── scripts/
│   │   ├── seedAdmin.js        # Administrator account provisioning
│   │   ├── seedDemoData.js     # Rich demo users, skills, swaps, sessions, reviews
│   │   └── generatePresentation.js # Generates 10-slide academic PowerPoint (.pptx)
│   ├── socket/
│   │   └── socketHandler.js    # Socket.IO room management, chat, presence, typing
│   ├── tests/
│   │   └── api.test.js         # Comprehensive 10-workflow test suite (29 test assertions)
│   ├── utils/
│   │   ├── generateToken.js    # JWT generation utility
│   │   └── matchingAlgorithm.js # Deterministic complementary match scoring engine
│   ├── render.yaml             # Render deployment configuration
│   ├── server.js               # Express application entrypoint
│   ├── .env.example
│   └── package.json
│
├── docs/                       # Project Documentation & Evaluation Assets
│   ├── presentation/
│   │   └── SkillSwap_Project_Presentation.pptx # Professional 10-slide PowerPoint
│   └── screenshots/            # Application interface screenshots
├── README.md                   # Complete Project Documentation
├── DEVELOPMENT_STATUS.md       # Implementation & Verification Tracking
└── .gitignore
```

---

## 11. Installation Requirements
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **NPM:** v9.0.0 or higher
- **Git**

---

## 12. Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/[YOUR-USERNAME]/SkillSwap.git
cd "skill swap"
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## 13. Environment Variable Configuration

### Server (`server/.env`)
Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or Local)
# Leave blank to run with local in-memory MongoDB automatically!
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=skillswap_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE=30d

# Frontend Client Origin
CLIENT_URL=http://localhost:5173

# Admin Initial Seed Credentials
ADMIN_NAME=SkillSwap Admin
ADMIN_EMAIL=admin@skillswap.com
ADMIN_PASSWORD=Admin@123456
```

### Client (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 14. How to Run the Application

### 1. Seed Demo Data & Admin (Optional but Recommended)
Populate realistic users, skills, active swaps, messages, sessions, and reviews:
```bash
cd server
npm run seed:demo
```

### 2. Run the Backend API Server
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

### 3. Run the Frontend Client
In a separate terminal:
```bash
cd client
npm run dev
# Vite development server starts on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 15. Default Demo Credentials

For testing and project evaluation, use the one-click demo login buttons on `/login` or enter:

| Role | Email | Password | Details |
|---|---|---|---|
| **Platform Admin** | `admin@skillswap.com` | `Admin@123456` | Full administrative oversight |
| **User (Alex Rivera)** | `alex@skillswap.com` | `Password@123` | Teaches Python; Wants UI/UX |
| **User (Maya Chen)** | `maya@skillswap.com` | `Password@123` | Teaches UI/UX; Wants Python |
| **User (Liam Johnson)** | `liam@skillswap.com` | `Password@123` | Teaches React.js; Wants Marketing |
| **User (Sophia Patel)** | `sophia@skillswap.com` | `Password@123` | Teaches Marketing; Wants React.js |

---

## 16. Automated Verification Tests

The project includes an automated test suite verifying all 10 core functional workflows:
```bash
cd server
npm test
```
**Test Results:**
- TEST 1: User Registration, Hashing & Duplicate Rejection: **PASS**
- TEST 2: Authentication & Password Verification: **PASS**
- TEST 3: Skill Creation, Update & Deletion: **PASS**
- TEST 4: Deterministic Skill Matching Engine: **PASS**
- TEST 5: Swap Request Workflow & Active Swap: **PASS**
- TEST 6: Real-time Messaging & Persistence: **PASS**
- TEST 7: Learning Session Scheduling & Times: **PASS**
- TEST 8: Reviews, Ratings & Duplicate Prevention: **PASS**
- TEST 9: Admin Role & Account Moderation: **PASS**
- TEST 10: In-App Notifications: **PASS**
- **Summary: 29 / 29 Assertions PASSED (100% Pass Rate)**

---

## 17. Deployment Instructions

### Deploy Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) or Render's outbound IPs.
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string into the backend environment variable `MONGODB_URI`.

### Deploy Backend: Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `CLIENT_URL`: `<Your Vercel Production URL>`
6. Deploy! Note the resulting backend URL (e.g. `https://skillswap-api.onrender.com`).

### Deploy Frontend: Vercel
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Configure Environment Variables:
   - `VITE_API_URL`: `https://skillswap-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://skillswap-api.onrender.com`
5. Deploy! Vercel will distribute the React SPA globally with full SPA rewrites via `vercel.json`.

---

## 18. PowerPoint Presentation

A professional 10-slide academic PowerPoint presentation is included in `docs/presentation/SkillSwap_Project_Presentation.pptx`.

To regenerate the presentation at any time:
```bash
cd server
npm run generate:ppt
```

**Presentation Slide Deck Outline:**
- **Slide 1:** Project Title and Team Details
- **Slide 2:** Introduction and Problem Statement
- **Slide 3:** Project Objectives and Scope
- **Slide 4:** Technology Stack & Architecture Tools
- **Slide 5:** System Architecture & Workflow Diagram
- **Slide 6:** Platform Features & Functional Modules
- **Slide 7:** Database Design & REST API Specification
- **Slide 8:** UI/UX Design System & 18 Application Pages
- **Slide 9:** Engineering Challenges & Future Enhancements
- **Slide 10:** Conclusion & Evaluation Summary

---

## 19. Team Member Details

**Team Name:** [ENTER TEAM NAME]  
**Project Title:** SkillSwap – Learn One. Teach One.  

- **Member 1 (Frontend Development & UI/UX):** [NAME AND REGISTRATION NUMBER]
- **Member 2 (Backend Development & REST APIs):** [NAME AND REGISTRATION NUMBER]
- **Member 3 (Database, Integration & DevOps):** [NAME AND REGISTRATION NUMBER]

---

## 20. Repository & Live Links
- **GitHub Repository:** [https://github.com/[YOUR-USERNAME]/SkillSwap](https://github.com/[YOUR-USERNAME]/SkillSwap)
- **Live Deployment Link:** [https://skillswap-frontend.vercel.app](https://skillswap-frontend.vercel.app) *(configured upon Vercel promotion)*
