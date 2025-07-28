# Job Application Tracker - Backend API

A Node.js/Express backend API for managing job applications with MongoDB and Clerk authentication.

## 🚀 Features

- **User Authentication** - Integrated with Clerk
- **Job Management** - Full CRUD operations for job applications
- **Real-time Statistics** - Job application analytics
- **Advanced Filtering** - Search, sort, and filter jobs
- **Data Validation** - Comprehensive input validation
- **Error Handling** - Robust error handling and logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Clerk account for authentication

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   Copy `.env.example` to `.env` and configure:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/jobtracker
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/jobtracker

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Clerk Authentication
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

3. **Get Clerk Keys**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the Publishable Key and Secret Key to your `.env` file

## 🚦 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Health Check
Visit `http://localhost:5000/health` to verify the server is running.

## 📡 API Endpoints

### Authentication
All job-related endpoints require authentication via Clerk JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Jobs API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs for user |
| GET | `/api/jobs/stats` | Get job statistics |
| GET | `/api/jobs/:id` | Get single job |
| POST | `/api/jobs` | Create new job |
| PUT | `/api/jobs/:id` | Update job |
| PATCH | `/api/jobs/:id/status` | Update job status only |
| DELETE | `/api/jobs/:id` | Delete job |
| DELETE | `/api/jobs` | Delete multiple jobs |

### Query Parameters (GET /api/jobs)

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `status` - Filter by status (applied, interviewing, offer, rejected)
- `search` - Search in title, company, location
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction (asc/desc, default: desc)

### Job Object Structure

```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "userId": "user_2ABC123DEF456",
  "title": "Senior Frontend Developer",
  "company": "TechCorp Inc.",
  "location": "San Francisco, CA",
  "salary": "₹12L - ₹15L",
  "status": "interviewing",
  "appliedDate": "2024-01-15T00:00:00.000Z",
  "notes": "Great company culture",
  "jobUrl": "https://techcorp.com/careers/senior-frontend",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Database Schema

### Job Model
- `userId` (String, required) - Clerk user ID
- `title` (String, required, max: 100)
- `company` (String, required, max: 100)
- `location` (String, optional, max: 100)
- `salary` (String, optional, max: 50)
- `status` (Enum: applied, interviewing, offer, rejected)
- `appliedDate` (Date, default: now)
- `notes` (String, optional, max: 1000)
- `jobUrl` (String, optional, validated URL)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

## 🛡️ Security Features

- **JWT Authentication** - Clerk integration
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Configured for frontend domain
- **Error Handling** - No sensitive data in error responses
- **Rate Limiting** - Ready for implementation

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
CLERK_SECRET_KEY=your_production_clerk_secret_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env file
   - For Atlas: Check network access and credentials

2. **Authentication Errors**
   - Verify Clerk keys in .env file
   - Ensure frontend is sending proper JWT token
   - Check Clerk dashboard for API settings

3. **CORS Issues**
   - Update FRONTEND_URL in .env file
   - Check if frontend domain matches

### Logs and Debugging
```bash
# Check health
curl http://localhost:5000/health

# View logs in development
npm run dev

# Test authentication
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/jobs
```

## 📈 Performance

- **Database Indexing** - Optimized queries with proper indexes
- **Pagination** - Built-in pagination for large datasets
- **Lean Queries** - Optimized MongoDB queries
- **Error Caching** - Proper error handling to prevent crashes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
