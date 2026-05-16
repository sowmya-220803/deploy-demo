# Smart Leads Dashboard

A robust, full-stack Lead Management Dashboard built using the MERN stack. Designed with clean architecture, strict TypeScript usage, scalable code practices, and a highly polished professional user interface.

## 🚀 Features

-   **Secure Authentication System:** User registration, login with JWT, and password hashing via `bcrypt`.
-   **Role-Based Access Control (RBAC):** Distinct privileges for "Admin" and "Sales User" roles.
-   **Leads Management (CRUD):** Complete interface to Create, Read, Update, and Delete leads.
-   **Advanced Filtering & Search:**
    -   Globally debounced search by Name or Email.
    -   Filter dynamically by Lead Status (New, Contacted, Qualified, Lost).
    -   Filter by Source (Website, Instagram, Referral).
    -   Multi-filter combinations support natively.
    -   Sort results chronologically (Latest/Oldest).
-   **Robust Pagination:** Backend-enforced pagination out of the box (10 records per page).
-   **CSV Export:** Instantly download filtered lead queries as a fully formatted `.csv` file.
-   **Polished UI/UX:** Built with TailwindCSS v4. Includes micro-animations, glassmorphic effects, toast notifications, loading skeletons, and interactive states.
-   **Dark Mode Support:** Clean, toggleable native Dark Theme.

## 🛠 Tech Stack

**Frontend:**
- React.js 19
- TypeScript
- Vite
- TailwindCSS v4
- Axios (API Client)
- React Router DOM
- Lucide React (Icons)

**Backend:**
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Zod (Request Validation)
- JSON Web Token (JWT)

## 📁 Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # DB setup
│   │   ├── controllers/     # Route logic
│   │   ├── middlewares/     # Auth & Error handling
│   │   ├── models/          # Mongoose Schema
│   │   ├── routes/          # Express Routes
│   │   └── utils/           # Helpers (JWT)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Layouts
│   │   ├── context/         # AuthProvider & ThemeProvider
│   │   ├── hooks/           # useDebounce
│   │   ├── pages/           # Dashboard, Login, Register
│   │   ├── services/        # Axios configurations
│   │   └── App.tsx          # Router setup
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml       # Orchestrates entire application
```

## ⚙️ Environment Configuration

Ensure you have a `.env` file situated inside the `backend/` directory looking similar to this:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=super_secret_jwt_key_12345
NODE_ENV=development
```
*(Note: If using Docker, `MONGODB_URI` points to `mongodb:27017` as defined in compose)*

## 🚦 Running the Project

You can run this application entirely within Docker or manually on your local system.

### Option 1: Docker Compose (Recommended)
Ensure Docker Desktop is running locally.
1. Navigate to the root directory `smart-leads-dashboard/`
2. Run the compose engine:
   ```bash
   docker-compose up --build -d
   ```
3. Open `http://localhost:3000` to view the frontend.
4. The api resolves implicitly to `http://localhost:5000`.

### Option 2: Local Development
Ensure **MongoDB** is running locally on port `27017` and **Node.js** is installed.

**1. Run the Backend API:**
```bash
cd backend
npm install
npm run dev
```

**2. Run the Frontend Dashboard:**
*(In a separate terminal)*
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

## 📖 API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user Account.
- `POST /api/auth/login` - Authenticate and receive JWT.

### Leads
- `GET /api/leads` - Get leads (supports `page`, `limit`, `search_term`, `status`, `source`, `sort_by` queries).
- `POST /api/leads` - Create a new lead.
- `GET /api/leads/:id` - Fetch single lead by ID.
- `PUT /api/leads/:id` - Update existing lead.
- `DELETE /api/leads/:id` - Delete lead (Admin only).
- `GET /api/leads/export` - Export current query to direct `.csv` file.
