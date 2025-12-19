# CourseBoy - Online Learning Platform

A full-stack course management platform built with Next.js, Express.js, TypeScript, and PostgreSQL.

## 🚀 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation

### Backend

- **Express.js** - Node.js web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Infrastructure

- **Docker** - Containerization
- **Redis** - Caching (optional)

## 📁 Project Structure

```
courseboy/
├── backend/                 # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # UI components
│   │   ├── lib/            # Utilities and API
│   │   │   └── store/      # Zustand stores
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment variables template
├── .env                    # Local environment variables
├── package.json            # Root package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)
- PostgreSQL (if running locally without Docker)

### Quick Start with Docker

1. **Clone and navigate to the project:**

   ```bash
   cd courseboy
   ```

2. **Start the services:**

   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/v1
   - Prisma Studio: `cd backend && npx prisma studio`

### Local Development (Without Docker)

1. **Install dependencies:**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

2. **Set up the database:**

   ```bash
   # Start PostgreSQL (ensure it's running)
   # Update DATABASE_URL in .env if needed

   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Start development servers:**

   ```bash
   # From root directory
   npm run dev

   # Or start individually:
   # Terminal 1: cd backend && npm run dev
   # Terminal 2: cd frontend && npm run dev
   ```

## 🔒 Security Features

- **JWT Authentication** - Access and refresh tokens
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevent brute force attacks
- **CORS** - Configured cross-origin requests
- **Helmet** - Security headers
- **HPP** - HTTP Parameter Pollution prevention
- **Input Validation** - Zod schema validation
- **Role-Based Access Control** - Admin, VIP, Member roles

## 📚 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/change-password` - Change password

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update profile
- `GET /api/v1/users/progress` - Get learning progress

### Courses

- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/:id` - Get course details
- `POST /api/v1/courses` - Create course (Admin)
- `PATCH /api/v1/courses/:id` - Update course (Admin)
- `DELETE /api/v1/courses/:id` - Delete course (Admin)

### Lessons

- `GET /api/v1/lessons/:id` - Get lesson
- `PATCH /api/v1/lessons/:id/progress` - Update watch progress

## 🗄️ Database Schema

The database includes the following main entities:

- **AppUser** - User accounts
- **Role** - User roles (Member, VIP, SuperVIP, Admin)
- **Course** - Course information
- **CourseCategory** - Course sections/modules
- **Lesson** - Individual lessons with video content
- **Quiz** - Quizzes for each category
- **Certificate** - Earned certificates
- **CourseFeedback** - Course ratings and reviews

## 🧪 Default Admin Account

After running seeds:

- Email: `admin@courseboy.com`
- Password: `admin123`

## 📝 Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing (change in production!)
- `CORS_ORIGIN` - Allowed frontend origin
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose build

# View logs
docker-compose logs -f

# Access specific service logs
docker-compose logs -f backend
```

## 📦 Scripts

### Root

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both projects
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers

### Backend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## 📄 License

MIT
