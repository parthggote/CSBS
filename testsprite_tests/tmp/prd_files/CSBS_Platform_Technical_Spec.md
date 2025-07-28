# CSBS Platform - Technical Specification Document

## 1. System Architecture Overview

### 1.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   File Storage  │    │   External APIs │
│   (Public)      │    │   (Local/Cloud) │    │   (Google AI)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Technology Stack Details

#### Frontend Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Shadcn/ui
- **State Management**: React Hooks + Context API
- **Animations**: Lottie, Framer Motion
- **Sliders**: Keen Slider
- **Icons**: Lucide React

#### Backend Technologies
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Database**: MongoDB 6.x
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloud Storage
- **Validation**: Zod

#### Development Tools
- **Package Manager**: npm/pnpm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git

## 2. Database Schema

### 2.1 User Collection
```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // hashed
  name: string;
  role: 'student' | 'faculty' | 'admin';
  avatar?: string;
  department?: string;
  studentId?: string;
  facultyId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    newsletter: boolean;
  };
}
```

### 2.2 Event Collection
```typescript
interface Event {
  _id: ObjectId;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  date: Date;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  image?: string;
  speaker?: string;
  organizer: ObjectId; // User reference
  attendees: ObjectId[]; // User references
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isPublic: boolean;
}
```

### 2.3 Quiz Collection
```typescript
interface Quiz {
  _id: ObjectId;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number;
  creator: ObjectId; // User reference
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}
```

### 2.4 Resource Collection
```typescript
interface Resource {
  _id: ObjectId;
  title: string;
  description: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: ObjectId; // User reference
  category: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.5 Forum Collection
```typescript
interface ForumPost {
  _id: ObjectId;
  title: string;
  content: string;
  author: ObjectId; // User reference
  category: string;
  tags: string[];
  likes: ObjectId[]; // User references
  replies: Reply[];
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

interface Reply {
  _id: ObjectId;
  content: string;
  author: ObjectId; // User reference
  createdAt: Date;
  updatedAt: Date;
  likes: ObjectId[]; // User references
}
```

## 3. API Endpoints Specification

### 3.1 Authentication Endpoints

#### POST /api/auth
**Purpose**: User login
**Request Body**:
```typescript
{
  email: string;
  password: string;
}
```
**Response**:
```typescript
{
  success: boolean;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

#### POST /api/users
**Purpose**: User registration
**Request Body**:
```typescript
{
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty';
  department?: string;
  studentId?: string;
  facultyId?: string;
}
```

### 3.2 Event Endpoints

#### GET /api/resources?type=events
**Purpose**: Fetch all events
**Query Parameters**:
- `type`: "events"
- `category`?: string
- `status`?: string
- `limit`?: number
- `page`?: number

#### POST /api/resources
**Purpose**: Create new event
**Request Body**:
```typescript
{
  type: "event";
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  category: string;
  image?: File;
}
```

### 3.3 Quiz Endpoints

#### POST /api/quiz-generation
**Purpose**: Generate quiz using AI
**Request Body**:
```typescript
{
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: string[];
}
```

#### POST /api/quiz-results
**Purpose**: Submit quiz results
**Request Body**:
```typescript
{
  quizId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  timeTaken: number;
}
```

### 3.4 Resource Endpoints

#### POST /api/upload
**Purpose**: Upload file
**Request**: Multipart form data
**Response**:
```typescript
{
  success: boolean;
  file: {
    _id: string;
    filename: string;
    url: string;
    size: number;
  };
}
```

#### GET /api/files/[id]
**Purpose**: Download file
**Response**: File stream

### 3.5 Chatbot Endpoints

#### POST /api/chatbot
**Purpose**: Chat with AI
**Request Body**:
```typescript
{
  message: string;
  context?: string;
  history?: Message[];
}
```

#### POST /api/chatbot-analyze-pdf
**Purpose**: Analyze PDF document
**Request**: Multipart form data with PDF file
**Response**:
```typescript
{
  analysis: string;
  summary: string;
  keyPoints: string[];
}
```

## 4. Component Architecture

### 4.1 Core Components

#### Navigation Component
```typescript
interface NavigationProps {
  currentUser?: User;
  onLogout: () => void;
}

// Features:
// - Responsive mobile menu
// - User authentication status
// - Theme toggle
// - Role-based menu items
```

#### Event Card Component
```typescript
interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
  onViewDetails: (event: Event) => void;
}

// Features:
// - Event image display
// - Registration status
// - Capacity tracking
// - Responsive design
```

#### Quiz Interface Component
```typescript
interface QuizInterfaceProps {
  quiz: Quiz;
  onSubmit: (answers: Answer[]) => void;
  onTimeUp: () => void;
}

// Features:
// - Timer countdown
// - Question navigation
// - Answer validation
// - Progress tracking
```

### 4.2 UI Component Library

#### Button Component
```typescript
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Card Component
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg';
}
```

#### Dialog Component
```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}
```

## 5. State Management

### 5.1 Global State Structure
```typescript
interface AppState {
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
  theme: {
    mode: 'light' | 'dark';
    system: boolean;
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
  };
  events: {
    upcoming: Event[];
    past: Event[];
    loading: boolean;
  };
  quizzes: {
    available: Quiz[];
    results: QuizResult[];
    loading: boolean;
  };
}
```

### 5.2 Context Providers
- **AuthContext**: User authentication state
- **ThemeContext**: Theme management
- **NotificationContext**: Notification system
- **EventContext**: Event data management

## 6. Security Implementation

### 6.1 Authentication Security
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Password Hashing
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Token Verification
const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    return null;
  }
};
```

### 6.2 Input Validation
```typescript
// Event Validation Schema
const eventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().min(1).max(200),
  capacity: z.number().min(1).max(1000),
  category: z.string().min(1).max(50),
});

// File Upload Validation
const fileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
};
```

### 6.3 CORS Configuration
```typescript
// CORS Settings
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## 7. Performance Optimization

### 7.1 Image Optimization
```typescript
// Next.js Image Component Usage
<Image
  src={event.image}
  alt={event.title}
  width={400}
  height={200}
  className="object-cover"
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 7.2 Code Splitting
```typescript
// Dynamic Imports
const LottieAnimation = dynamic(() => import('@/components/LottieAnimation'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  ssr: false,
});

const Chatbot = dynamic(() => import('@/components/Chatbot'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded" />,
});
```

### 7.3 Database Optimization
```typescript
// MongoDB Indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.events.createIndex({ "date": 1, "status": 1 });
db.events.createIndex({ "category": 1 });
db.resources.createIndex({ "category": 1, "tags": 1 });
db.forumPosts.createIndex({ "category": 1, "createdAt": -1 });
```

## 8. Error Handling

### 8.1 API Error Responses
```typescript
// Standard Error Response Format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;
```

### 8.2 Frontend Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## 9. Testing Strategy

### 9.1 Unit Testing
```typescript
// Component Testing Example
describe('EventCard Component', () => {
  it('should render event details correctly', () => {
    const mockEvent = {
      _id: '1',
      title: 'Test Event',
      description: 'Test Description',
      date: new Date(),
      capacity: 100,
      registered: 50,
    };

    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('50/100 registered')).toBeInTheDocument();
  });
});
```

### 9.2 API Testing
```typescript
// API Route Testing
describe('POST /api/auth', () => {
  it('should authenticate valid user', async () => {
    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

## 10. Deployment Configuration

### 10.1 Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/csbs-platform
MONGODB_URI_PROD=mongodb+srv://...

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Integration
GOOGLE_AI_API_KEY=your-google-ai-api-key

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Application
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 10.2 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 10.3 PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'csbs-platform',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

## 11. Monitoring & Logging

### 11.1 Application Logging
```typescript
// Logger Configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'csbs-platform' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 11.2 Performance Monitoring
```typescript
// API Response Time Monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });
  next();
});
```

---

**Document Version**: 1.0
**Last Updated**: July 2025
**Next Review**: August 2025 