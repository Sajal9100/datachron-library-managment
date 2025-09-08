

backend/
 ├─ prisma/        # Schema & migrations
 ├─ routes/        # API routes
 ├─ controllers/   # Business logic
 ├─ middlewares/   # Auth & error handlers
 ├─ index.js       # Entry point

frontend/
 ├─ src/
 │   ├─ components/ # UI components
 │   ├─ hooks/      # TanStack Query hooks
 │   ├─ store/      # Zustand store
 │   ├─ pages/      # App pages
 │   └─ App.jsx


Schema 
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id       Int      @id @default(autoincrement())
  name     String
  email    String   @unique
  password String
  role     String   @default("Member") // Admin or Member
  createdAt DateTime @default(now())
}

model Book {
  id         Int      @id @default(autoincrement())
  title      String
  author     String
  isbn       String   @unique
  available  Boolean  @default(true)
  createdAt  DateTime @default(now())
}

--------------------------------------------------------------------------------------------------------------------------------
Why This Approach?

Scalable: PostgreSQL + Prisma for reliable data modeling.

Fast development: TanStack Query removes manual data fetching logic.

Simple state management: Zustand is lightweight for UI state.

Clean structure: Backend and frontend separated for clarity.



1. User Management

Register (/api/auth/register) → Create users with ADMIN or MEMBER role

Login (/api/auth/login) → JWT-based authentication

Passwords are hashed with bcrypt

2. Book Management

Add book (POST /api/books) → Admin only

Fetch all available books (GET /api/books) → Public

Borrow book (POST /api/books/borrow/:id) → Member, updates isAvailable

Return book (POST /api/books/return/:id) → Member, updates isAvailable

3. Authorization

authMiddleware → JWT verification

adminOnly → Role-based route access

4. Database Relations

User ↔ Borrow ↔ Book → Tracks which user borrowed which book

Prisma models fully defined for PostgreSQL

5. Project Structure

Modular controllers, routes, middleware

Easy to maintain and extend

What’s Ready to Use

Backend APIs are fully functional

JWT auth works

Role-based access control implemented

Prisma + PostgreSQL integrated

Borrow/Return logic works
