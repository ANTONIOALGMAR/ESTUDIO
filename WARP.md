# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Frontend (React/TypeScript)
- `npm start` - Start development server (runs on http://localhost:3000)
- `npm run build` - Create production build
- `npm test` - Run tests in interactive watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

### Backend (Node.js/Express)
- `npm run start:backend` - Start the backend server (runs on port 5001)
- `npm run seed:services` - Seed the database with default services

### Database Seeding
The project includes a seeding script for services. Run it when setting up a new environment:
```bash
npm run seed:services
```

## Project Architecture

### Full-Stack Structure
This is a **monorepo** containing both frontend and backend code:
- `/src` - React TypeScript frontend
- `/backend` - Node.js Express backend
- `/public` - Static assets

### Authentication System
The application uses a **unified authentication system** that supports two user types:
- **Admin Users** (`User` model) - Access to admin dashboard with roles: `admin`, `funcionario`
- **Customer Users** (`Customer` model) - Access to customer dashboard

**Key Authentication Features:**
- JWT-based with access tokens (15min) and refresh tokens (7d)
- Rate limiting on login endpoints (20 attempts per 15min per IP)
- Automatic token refresh with axios interceptors
- Secure HTTP-only cookies for refresh tokens
- Input validation using Joi schemas

### Frontend Architecture

**Routing Structure:**
- Public routes: `/`, `/about`, `/services`, `/booking`, `/login`, `/register`
- Admin routes: `/admin/*` (dashboard, services, customers, employees, reports, quotes)
- Customer routes: `/customer/*` (dashboard, registration)

**State Management:**
- `AuthContext` provides global authentication state
- Custom hooks like `useMediaQuery` for responsive behavior

**Components Organization:**
- `components/` - Reusable UI components (Header, Footer, Modals, Protected Routes)
- `pages/` - Route-specific pages with `admin/` subdirectory for admin pages
- `context/` - React Context providers
- `hooks/` - Custom React hooks
- `api/` - Axios configuration and API utilities

### Backend Architecture

**API Structure:**
All API endpoints are prefixed with `/api/`:
- `/api/unified-auth` - Authentication (login, register, logout, refresh, verify-token)
- `/api/bookings` - Appointment management
- `/api/services` - Service catalog management
- `/api/customers` - Customer management
- `/api/analytics` - Reporting and analytics
- `/api/users` - Admin user management
- `/api/quotes` - Quote/estimate management

**Database Models (MongoDB/Mongoose):**
- `User` - Admin users with role-based access
- `Customer` - Customer accounts
- `Booking` - Appointments with service arrays, addresses, pickup options
- `Service` - Available services with pricing and duration
- `Quote` - Price estimates

**Security Features:**
- Helmet.js for security headers
- CORS with whitelist for allowed origins
- Express rate limiting
- Joi validation middleware
- Bcrypt password hashing
- Environment variables for secrets

**Middleware:**
- `validation.js` - Joi-based request validation
- `verifyToken.js` - JWT token verification
- `verifyAdmin.js` - Admin role verification

### Environment Configuration
The application expects these environment variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `REFRESH_TOKEN_SECRET` - Refresh token signing secret
- `PORT` - Backend server port (defaults to 5001)
- `REACT_APP_API_URL` - Frontend API URL (defaults to http://localhost:5001)

### Database Relationships
- Bookings can be associated with Customers via `customerId` reference
- Optimized indexes on `Booking` model for email and customerId queries
- Timestamps enabled on all models

### Development Setup Notes
1. Backend runs independently on port 5001
2. Frontend development server proxies API calls to backend
3. CORS is configured for both local development and production deployment
4. The project includes Portuguese language strings throughout
5. Uses TypeScript for frontend with strict configuration
6. Material-UI (MUI) and React Bootstrap for UI components

### Production Deployment
- Frontend builds to `/build` directory
- Backend configured for Render.com deployment
- Secure cookies and HTTPS enforcement in production
- Environment-based CORS origin configuration