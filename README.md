# Medical Health Tracker (MediMitra)

## Project Creator
**Shashwat Awasthi**
- 🔗 **GitHub**: [https://github.com/shashwat-a18](https://github.com/shashwat-a18)
- 💼 **LinkedIn**: [https://www.linkedin.com/in/shashwat-awasthi18/](https://www.linkedin.com/in/shashwat-awasthi18/)

## Project Overview
A full-stack, offline-capable Medical Health Tracker platform enabling users to track health vitals, receive ML-based health risk predictions, upload/manage health documents, chat with an AI assistant, and get smart health reminders.

**Tech Stack:**
- Frontend: Next.js (TypeScript, Tailwind CSS)
- Backend: Express.js (Node.js, MongoDB)
- ML Server: Flask (Python)
- Chatbot: Rasa

**Features:**
- User/Doctor/Admin roles
- JWT authentication
- Health data tracking & visualization
- ML risk prediction (Diabetes, Heart Disease, Stroke)
- Document upload & management
- AI chatbot assistant
- Smart reminders & alerts
- Doctor/Admin dashboards

**No external APIs. Fully self-hosted.**

---

## Quick Start

### Development (Local)
1. **Clone and Install Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set Environment Variables:**
   - Copy `.env.example` to `.env` and configure your settings
   - Update `client/.env.local` with API URLs

3. **Start Services:**
   ```bash
   # Start all services concurrently
   npm run dev:client    # Frontend (port 3000)
   npm run dev:server    # Backend (port 5000)
   npm run dev:ml        # ML Server (port 8000)
   npm run dev:chatbot   # Chatbot (port 5005)
   ```

### Production (Docker)
```bash
# Build and start all services
docker-compose up --build

# Or use npm scripts
npm run docker:up
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Health Records
- `GET /api/health` - Get health records
- `POST /api/health` - Create health record
- `PUT /api/health/:id` - Update health record
- `DELETE /api/health/:id` - Delete health record

### ML Predictions
- `POST /api/predict` - Generate health risk prediction
- `GET /api/predict` - Get user predictions
- `GET /api/predict/:id` - Get specific prediction

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `DELETE /api/documents/:id` - Delete document

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - Get user reminders
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

---

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  ML Server  │
│  (Next.js)  │◄──►│ (Express)   │◄──►│   (Flask)   │
│   Port 3000 │    │  Port 5000  │    │  Port 8000  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                   ┌─────────────┐    ┌─────────────┐
                   │  Database   │    │  Chatbot    │
                   │ (MongoDB)   │    │   (Rasa)    │
                   │ Port 27017  │    │  Port 5005  │
                   └─────────────┘    └─────────────┘
```

---

## Development Guidelines

1. **Environment Variables:** Always use environment variables for configuration
2. **Error Handling:** Implement proper error handling in all components
3. **Authentication:** All protected routes require JWT authentication
4. **CORS:** Configured for development and production environments
5. **Logging:** Use structured logging for debugging and monitoring

---

## Troubleshooting

### Common Issues:
1. **CORS Errors:** Check `NEXT_PUBLIC_API_URL` in client `.env.local`
2. **Database Connection:** Ensure MongoDB is running on correct port
3. **ML Server:** Python dependencies must be installed correctly
4. **Chatbot:** Rasa models need to be trained before running

### Development Commands:
```bash
# Install dependencies
npm run install:all

# Docker operations
npm run docker:build
npm run docker:up
npm run docker:down
npm run docker:logs

# Individual services
npm run dev:client
npm run dev:server
npm run dev:ml
npm run dev:chatbot
```

---

## Contributing
1. Follow the existing code structure and naming conventions
2. Add proper error handling and validation
3. Update documentation for new features
4. Test thoroughly before submitting changes

---

## License
MIT License - see LICENSE file for details
