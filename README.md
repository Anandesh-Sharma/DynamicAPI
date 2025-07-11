# TaskManager - Asana-like Task Management Application

A modern, full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. This application provides comprehensive project and task management capabilities with real-time collaboration features.

## 🚀 Features

### ✨ Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Project Management** - Create, organize, and manage projects with team collaboration
- **Task Management** - Full CRUD operations with priorities, due dates, and assignments
- **Team Collaboration** - Team creation, member management, and real-time updates
- **Multiple Views** - List, Board (Kanban), Calendar, and Timeline views
- **Real-time Updates** - WebSocket integration for live collaboration
- **Notifications** - In-app notifications for task updates and mentions
- **File Attachments** - Upload and manage task attachments
- **Comments & Discussions** - Task-level commenting system
- **Advanced Filtering** - Filter tasks by status, priority, assignee, and more

### 🎨 UI/UX Features
- **Modern Design** - Clean, Asana-inspired interface with Tailwind CSS
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support** - Built-in theme switching capability
- **Drag & Drop** - Intuitive task management with @dnd-kit
- **Keyboard Shortcuts** - Power user features for efficiency
- **Accessibility** - WCAG compliant design with screen reader support

## 🏗 Architecture

### Backend Stack
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database
- **Prisma** - Modern ORM with type safety
- **JWT** - Authentication tokens
- **Socket.IO** - Real-time communication
- **Winston** - Structured logging
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Frontend Stack
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe frontend development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Navigation and routing
- **React Hook Form** - Form management
- **@dnd-kit** - Drag and drop functionality
- **Headless UI** - Accessible UI components
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── logs/                # Application logs
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── projects/    # Project management
│   │   │   ├── tasks/       # Task management
│   │   │   ├── teams/       # Team management
│   │   │   └── layout/      # Layout components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API communication
│   │   ├── stores/          # State management
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
│
└── docs/                    # Documentation
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   
   # Setup database
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed  # Optional: seed with sample data
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Development Servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=5000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### Database Setup

The application uses PostgreSQL with Prisma ORM. The schema includes:

- **Users** - Authentication and user profiles
- **Teams** - Team organization and membership
- **Projects** - Project management with privacy settings
- **Tasks** - Task management with dependencies and subtasks
- **Comments** - Task discussions
- **Attachments** - File management
- **Notifications** - Real-time updates

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Core Resource Endpoints
- `GET/POST /api/projects` - Project management
- `GET/POST /api/tasks` - Task management
- `GET/POST /api/teams` - Team management
- `GET /api/users/profile` - User profile
- `GET /api/notifications` - Notifications

### Real-time Features
- WebSocket connection for live updates
- Real-time task status changes
- Live team collaboration
- Instant notifications

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

### Manual Deployment

1. **Backend Production Build**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Frontend Production Build**
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with a static server
   ```

3. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

## 🔐 Security

The application implements several security measures:
- JWT-based authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- SQL injection prevention via Prisma
- XSS protection

## 🎯 Performance

- **Frontend**: Code splitting, lazy loading, optimized bundle size
- **Backend**: Database query optimization, caching, connection pooling
- **Real-time**: Efficient WebSocket management
- **Images**: Optimized image handling and CDN integration

## 🔄 Development Workflow

1. **Code Structure**: Feature-based organization
2. **Type Safety**: Comprehensive TypeScript usage
3. **Error Handling**: Centralized error management
4. **Logging**: Structured logging with Winston
5. **Validation**: Input validation on both frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Asana's clean and intuitive design
- Built with modern web development best practices
- Focused on developer experience and code maintainability

## 📞 Support

For support, email support@taskmanager.com or create an issue in the repository.

---

**Built with ❤️ by the TaskManager Team**