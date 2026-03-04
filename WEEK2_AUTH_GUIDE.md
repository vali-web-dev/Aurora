# Authentication Week 2 - Complete Setup Guide

**Status:** Ready for Production  
**Date:** February 18, 2026  
**Framework:** Next.js 14.2.35 + NextAuth.js v5 + Supabase PostgreSQL

---

## ✅ What's Ready Now

### Authentication Infrastructure
- ✅ Email/password authentication (Credentials Provider)
- ✅ Google OAuth (configured, needs .env keys)
- ✅ GitHub OAuth (configured, needs .env keys)
- ✅ NextAuth session management with JWT
- ✅ Database adapters (Drizzle + PostgreSQL)
- ✅ Password hashing (bcryptjs)

### User Pages
- ✅ `/auth/signin` - Sign in with email/password
- ✅ `/auth/signup` - Create account with auto-avatar
- ✅ `/settings/profile` - View and edit profile
- ✅ `/settings/change-password` - Change password securely
- ✅ `/dashboard` - Dashboard with user data

### API Endpoints
- ✅ `POST /api/auth/register` - Create account
- ✅ `POST /api/auth/[...nextauth]` - NextAuth handlers
- ✅ `GET /api/users/profile` - Get current user
- ✅ `PUT /api/users/profile` - Update profile
- ✅ `POST /api/users/change-password` - Change password
- ✅ `GET /api/users/stats` - User statistics
- ✅ `GET /api/users/activity` - User activity feed

---

## 🚀 To Activate OAuth (Optional)

### Google OAuth Setup
1. Go to: https://console.cloud.google.com/
2. Create new project (or select existing)
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
6. For production, add your domain to origin URIs

### GitHub OAuth Setup
1. Go to: https://github.com/settings/developers
2. Create new OAuth App
3. Set:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Microsoft (Azure) OAuth Setup
Add to `.env.local`:
```
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=common
```

Then update `src/lib/auth.ts` to add Microsoft provider:
```typescript
import MicrosoftEntraIdProvider from "next-auth/providers/microsoft-entra-id";

// Add to providers array:
MicrosoftEntraIdProvider({
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID,
}),
```

---

## 🧪 Testing the Auth System

### 1. Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "displayName": "Test User",
    "password": "SecurePass123"
  }'
```

### 2. Test Sign In
Visit: http://localhost:3000/auth/signin
- Email: test@example.com
- Password: SecurePass123

### 3. Test Profile
Visit: http://localhost:3000/settings/profile
- Should show your profile
- Can edit display name

### 4. Test Change Password
Visit: http://localhost:3000/settings/change-password
- Current password: SecurePass123
- New password: NewPass456
- Confirm: NewPass456

---

## 📊 Authentication Flow

```
User Visit App
    ↓
Check Session (getSession)
    ↓
    ├─ Authenticated → Show Dashboard
    └─ Not Auth → Show Sign In
         ↓
    ┌─ Email/Password
    ├─ Google OAuth
    └─ GitHub OAuth
         ↓
    Create/Link Account in DB
         ↓
    Generate JWT Token
         ↓
    Create Session
         ↓
    Redirect to Dashboard
```

---

## 🔐 Security Features

✅ Passwords hashed with bcryptjs (10 rounds)  
✅ JWT tokens for session (30 day expiry)  
✅ Session validation on protected routes  
✅ OAuth provider linking support  
✅ CSRF protection from NextAuth  
✅ HTTP-only cookies for session  
✅ Database-backed sessions  

---

## 📝 Protected Route Example

```typescript
import { getSession } from '@/lib/session';

export default async function SecretPage() {
  // Automatically redirects to /auth/signin if not authenticated
  const session = await getSession();

  return <div>Welcome {session.user.email}</div>;
}
```

---

## 🛠️ Troubleshooting

### "Password authentication failed"
- Check DATABASE_URL in .env.local
- Verify Supabase connection

### OAuth not working
- Verify CLIENT_ID and CLIENT_SECRET in .env.local
- Check redirect URIs in provider settings
- Ensure http://localhost:3000 is listed

### Session not persisting
- Clear browser cookies
- Ensure NODE_ENV=development
- Check NEXTAUTH_SECRET is set (30+ char)

### Profile page shows "Not set"
- Sign in first, then reload
- Check `/api/users/profile` endpoint

---

## 📚 Example: Implementing Custom OAuth

```typescript
// In src/lib/auth.ts, add:
import CustomProvider from 'next-auth/providers/custom-provider';

// Add to providers array:
CustomProvider({
  id: 'custom',
  name: 'Custom Provider',
  type: 'oauth',
  clientId: process.env.CUSTOM_CLIENT_ID,
  clientSecret: process.env.CUSTOM_CLIENT_SECRET,
  // ... additional config
}),
```

---

## 🎯 Next Phase: Week 3

Once authentication is solid, Week 3 focuses on:
- Real-time WebSocket connections (Socket.IO)
- Social feed with notifications
- Live community chat
- Presence awareness

---

## 📦 Commands

```bash
npm run dev                    # Start development server
npm run build:ci              # Test production build
npm run lint:strict           # Check code quality
npx tsc --noEmit              # TypeScript check

# Database
npm run db:push               # Apply schema changes
npm run db:seed               # Add test data
npm run db:validate           # Test connection
```

---

## ✨ Quick Links

- [Authentication Config](src/lib/auth.ts)
- [User Schema](src/lib/schema.ts)
- [SignIn Page](src/app/auth/signin/page.tsx)
- [SignUp Page](src/app/auth/signup/page.tsx)
- [Profile Page](src/app/settings/profile/page.tsx)
- [Dashboard](src/app/dashboard/page.tsx)

---

**Status: Week 2 Authentication Ready for Launch** ✅
