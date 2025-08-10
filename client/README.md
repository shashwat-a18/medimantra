# MediMitra Pro - Frontend Client

Modern healthcare management platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features & Status

✅ **Build Successful**: All 37 pages compile without errors
✅ **SSR Compatible**: Server-side rendering with Next.js
✅ **Type-Safe**: Built with TypeScript for reliability
✅ **Environment Variables**: Consistent configuration across all files
✅ **Authentication**: JWT-based with role-based access control
✅ **Theme Support**: Light/dark mode with system preference detection

## 🛠 Tech Stack

- **Framework**: Next.js 14.2.3
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.0
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrappers

## 📦 Environment Configuration

All environment variables are properly configured and consistent across the application:

```env
NEXT_PUBLIC_API_URL=https://medimitra-y0bh.onrender.com/api
NEXT_PUBLIC_ML_SERVER_URL=https://medimitra-ml-server.onrender.com
NEXT_PUBLIC_APP_NAME=MediMitra Pro
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_CHATBOT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
NEXT_PUBLIC_SESSION_TIMEOUT=3600000
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗 Build Results

```
Route (pages)                                Size  First Load JS
┌ ○ / (Dashboard)                         5.63 kB         108 kB
├ ○ /login                                3.93 kB         106 kB
├ ○ /register                             4.08 kB         106 kB
├ ○ /admin/* (15 pages)                  2.44-5.75 kB   104-108 kB
├ ○ /doctor/* (6 pages)                  1.09-4.07 kB   103-106 kB
├ ○ /health/* (3 pages)                  3.15-6.00 kB   105-128 kB
└ ○ /ehr/* (2 pages)                     3.38-3.61 kB   105-126 kB

✅ All 37 pages successfully compiled
```

## 🌍 Deployment Ready

- **Backend API**: https://medimitra-y0bh.onrender.com/api ✅ Operational
- **ML Server**: https://medimitra-ml-server.onrender.com ✅ Ready
- **Frontend**: Ready for Vercel deployment with `vercel.json` configured

## 📁 Project Structure

```
client/
├── components/ui/        # UI components
├── context/             # AuthContext, ThemeContext  
├── pages/               # All application pages (37 total)
├── utils/api.ts         # Centralized API configuration
├── styles/              # Global styles
├── next.config.js       # Next.js configuration
├── vercel.json          # Deployment configuration
└── package.json         # Dependencies & scripts
```

## 🔐 Authentication & Security

- JWT-based authentication with session management
- Role-based access control (admin, doctor, patient)
- Automatic token expiration handling
- Secure file upload with type/size validation

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: Fresh rebuild with consistent system variables
