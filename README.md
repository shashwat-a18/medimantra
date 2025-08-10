# Medical Health Tracker (MediMantra)

## Project Creator
**Shashwat Awasthi**
- 🔗 **GitHub**: [https://github.com/shashwat-a18](https://github.com/shashwat-a18)
- 💼 **LinkedIn**: [https://www.linkedin.com/in/shashwat-awasthi18/](https://www.linkedin.com/in/shashwat-awasthi18/)

## Project Overview
A comprehensive Medical Health Tracker platform enabling users to track health vitals, receive ML-based health risk predictions, upload/manage health documents, chat with an AI assistant, and get smart health reminders.

**Tech Stack:**
- Frontend: Next.js 15+ (TypeScript, Tailwind CSS)
- Backend: Express.js (Node.js, MongoDB) with integrated chatbot
- ML Server: Flask (Python with scikit-learn)
- Chatbot: Node.js with NLP (integrated into backend)

**Features:**
- Multi-role system (Patient/Doctor/Admin)
- JWT-based authentication & authorization
- Health data tracking & visualization
- ML-powered health risk predictions
- Document management system
- Intelligent chatbot assistant
- Smart reminders & notifications
- Comprehensive admin & doctor dashboards
- Inventory management & supplier tracking
- Appointment scheduling system

**Fully self-hosted solution with no external API dependencies.**

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- MongoDB (local or cloud)

### Installation
1. **Clone Repository:**
   ```bash
   git clone https://github.com/shashwat-a18/medimantra.git
   cd medimantra
   ```

2. **Install Dependencies:**
   ```bash
   # Install all dependencies
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   cd ml-server && pip install -r requirements.txt && cd ..
   ```

3. **Environment Configuration:**
   - Copy `.env.example` to `.env` in root directory
   - Create `client/.env.local` with frontend environment variables
   - Create `server/.env` with backend environment variables
   - Configure MongoDB connection string

4. **Database Setup:**
   ```bash
   # Navigate to server directory
   cd server
   
   # Create admin user
   node create-admin.js
   ```

### Development Mode
```bash
# Terminal 1 - Start Frontend (Port 3000)
cd client && npm run dev

# Terminal 2 - Start Backend (Port 5000)
cd server && npm start

# Terminal 3 - Start ML Server (Port 8000)
cd ml-server && python app.py
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

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### ML Predictions
- `POST /api/predict` - Generate health risk prediction
- `GET /api/predict` - Get user predictions
- `GET /api/predict/:id` - Get specific prediction

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/history` - Get chat history

### Inventory (Admin)
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Suppliers (Admin)
- `GET /api/suppliers` - Get suppliers
- `POST /api/suppliers` - Add supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status

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
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │    │     Server      │    │   ML Server     │
│   (Next.js)     │◄──►│   (Express)     │◄──►│    (Flask)      │
│   Port 3000     │    │   Port 5000     │    │   Port 8000     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Routes    │    │ • ML Models     │
│ • Authentication│    │ • JWT Auth      │    │ • Predictions   │
│ • Dashboards    │    │ • File Upload   │    │ • Health Risk   │
│ • Forms & UI    │    │ • Chatbot NLP   │    │   Assessment    │
└─────────────────┘    │ • Business Logic│    └─────────────────┘
                       └─────────────────┘
                               │
                       ┌─────────────────┐
                       │    Database     │
                       │   (MongoDB)     │
                       │   Port 27017    │
                       │                 │
                       │ • User Data     │
                       │ • Health Records│
                       │ • Appointments  │
                       │ • Inventory     │
                       │ • Chat History  │
                       └─────────────────┘
```

### Key Components:
- **Frontend**: React/Next.js with TypeScript and Tailwind CSS
- **Backend**: Express.js server with integrated chatbot using Natural NLP
- **ML Service**: Flask server with scikit-learn for health predictions
- **Database**: MongoDB for data persistence
- **Authentication**: JWT-based with role-based access control

---

## Project Structure

```
medimantra/
├── client/                 # Next.js Frontend Application
│   ├── components/         # Reusable React components
│   ├── pages/             # Next.js pages and API routes
│   ├── styles/            # CSS and styling files
│   ├── context/           # React context providers
│   └── utils/             # Utility functions
│
├── server/                # Express.js Backend Server
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API route definitions
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic services
│   └── utils/            # Server utilities
│
├── ml-server/            # Flask ML Prediction Server
│   ├── models/           # ML model files
│   ├── explainability/   # Model interpretation
│   └── app.py            # Flask application
│
└── docs/                 # Project documentation
```

## Features Overview

### For Patients:
- Personal health dashboard
- Vital signs tracking and visualization
- ML-powered health risk assessments
- Appointment booking and management
- Document upload and organization
- AI chatbot for health queries
- Smart medication reminders
- Health history and trends

### For Doctors:
- Patient management dashboard
- Appointment scheduling system
- Access to patient health records
- Prescription management
- AI-assisted diagnosis support
- Patient communication tools

### For Administrators:
- User and role management
- System analytics and reports
- Inventory management
- Supplier relationship management
- Order processing and tracking
- System configuration and monitoring

---

## Development Guidelines

### Code Standards:
1. **TypeScript**: Use TypeScript for type safety in frontend development
2. **Error Handling**: Implement comprehensive error handling across all components
3. **Authentication**: JWT-based authentication with role-based access control
4. **Environment Variables**: All configuration through environment variables
5. **API Design**: RESTful API design with consistent response formats
6. **Security**: Input validation, sanitization, and secure data handling

### Best Practices:
- Follow consistent naming conventions
- Write clean, documented code
- Implement proper logging and monitoring
- Use proper error boundaries in React components
- Validate all user inputs on both client and server
- Implement proper database indexing for performance

## Technology Stack Details

### Frontend (Next.js)
- **Framework**: Next.js 15+ with React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Forms**: Custom form handling with validation
- **Charts**: Chart.js for data visualization

### Backend (Express.js)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Multer middleware
- **Chatbot**: Natural NLP library
- **Validation**: Custom validation middleware

### ML Server (Flask)
- **Language**: Python 3.8+
- **Framework**: Flask
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **Model Storage**: joblib for model persistence

## Troubleshooting

### Common Development Issues:

#### Frontend Issues:
- **CORS Errors**: Verify `NEXT_PUBLIC_API_URL` in `client/.env.local`
- **Build Errors**: Check TypeScript types and import paths
- **Styling Issues**: Ensure Tailwind CSS is properly configured

#### Backend Issues:
- **Database Connection**: Verify MongoDB connection string
- **Authentication**: Check JWT secret and token expiration
- **File Upload**: Ensure upload directory permissions

#### ML Server Issues:
- **Python Dependencies**: Install requirements with `pip install -r requirements.txt`
- **Model Loading**: Verify model files exist in `/models` directory
- **Memory Issues**: Consider model optimization for large datasets

### Development Commands:
```bash
# Frontend development
cd client && npm run dev

# Backend development with auto-reload
cd server && npm run dev

# ML server development
cd ml-server && python app.py

# Database operations
cd server && node create-admin.js

# Full system restart
# Kill all processes on ports 3000, 5000, 8000 first, then restart
```

---

## Contact

For queries, suggestions, or support:
📧 **Email**: shashwatawasthi18@gmail.com

---

**Made with ❤️ for better healthcare management**
