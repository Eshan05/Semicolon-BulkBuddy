# BulkBuddy Authentication System

## Overview
BulkBuddy has a complete user authentication system with sign-up, sign-in, and protected routes. The system uses localStorage for demo/development purposes with demo credentials.

---

## Demo Credentials (For Testing)

### Buyer Account
- **Email**: `demo@bulkbuddy.com`
- **Password**: `demo123`
- **Role**: Buyer
- **Company**: Demo Company

### Supplier Account
- **Email**: `supplier@bulkbuddy.com`
- **Password**: `demo123`
- **Role**: Supplier
- **Company**: Demo Supplies Inc

---

## Authentication Flow

### 1. **Sign Up** (`/sign-up`)
New users can create an account by:

#### Step 1: Navigate to Sign Up Page
- Click "Sign up" link on landing page
- Or go directly to `http://localhost:3000/sign-up`

#### Step 2: Select User Type
- **Buyer**: For purchasing groups
- **Supplier**: For creating deals and managing orders

#### Step 3: Fill in Registration Form
- **Full Name**: Your name
- **Email Address**: Unique email
- **Company Name**: Your company (required for suppliers)
- **Password**: Min 6 characters
- **Confirm Password**: Must match password

#### Step 4: Account Created
- Redirected to appropriate dashboard
- `/buyer-dashboard` for buyers
- `/supplier-dashboard` for suppliers
- Session stored in localStorage

---

### 2. **Sign In** (`/sign-in`)
Existing users can log in by:

#### Step 1: Navigate to Sign In Page
- Click "Sign in" link on landing page
- Or go directly to `http://localhost:3000/sign-in`

#### Step 2: Enter Credentials
- **Email Address**: Your registered email
- **Password**: Your password

#### Step 3: Forgot Password
- Click "Forgot password?" link (future feature)

#### Step 4: Sign In
- Redirected to buyer-dashboard
- Session stored in localStorage
- User menu shows in header

---

## Architecture

### Core Files

#### 1. **Auth Context Provider** (`lib/auth-context.tsx`)
Global state management for authentication.

**Exports:**
- `AuthProvider` - Wraps the app with auth state
- `useAuth()` - Hook to access auth context
- `User` interface - User type definition

**Methods:**
```typescript
signUp(data: SignUpData) -> Promise<void>
// Create new account

signIn(email: string, password: string) -> Promise<void>
// Log in existing user

signOut() -> Promise<void>
// Log out current user
```

**State:**
```typescript
user: User | null           // Current logged-in user
loading: boolean            // Loading state
isAuthenticated: boolean    // Is user logged in?
```

---

#### 2. **Sign In Component** (`components/features/auth/sign-in.tsx`)
Beautiful sign-in form with validation and error handling.

**Features:**
- Email validation
- Password input with eye toggle (future)
- Error messages with error icon
- Loading state
- Links to sign-up and forgot-password pages
- Demo credentials hint at bottom

---

#### 3. **Sign Up Component** (`components/features/auth/sign-up.tsx`)
Registration form with user type selection.

**Features:**
- User type toggle (Buyer/Supplier)
- Full name input
- Email validation
- Company name field (required for suppliers)
- Password strength validation (min 6 chars)
- Password confirmation matching
- Error messages with validation feedback
- Responsive design

---

#### 4. **Protected Route Wrapper** (`components/protected-route.tsx`)
Component to protect pages from unauthorized access.

**Usage:**
```tsx
<ProtectedRoute requiredUserType="buyer">
  <BuyerDashboard />
</ProtectedRoute>
```

**Features:**
- Redirects unauthenticated users to sign-in
- Checks user type (buyer/supplier)
- Loading fallback while checking auth
- Smooth transitions

---

#### 5. **User Menu** (`components/features/user-menu.tsx`)
Dropdown menu in dashboard headers showing user info.

**Features:**
- User avatar with first initial
- User name and role
- Profile link (future)
- Settings link (future)
- Sign Out button
- Click-outside to close
- Responsive design

---

#### 6. **Demo User Initialization** (`lib/demo-init.ts`)
Initializes demo users on first app load.

**Demo Users Created:**
- `demo@bulkbuddy.com` (Buyer)
- `supplier@bulkbuddy.com` (Supplier)

**Function:** `initializeDemoUser()`
- Runs once on app start
- Only if no users exist in localStorage
- Automatically adds demo credentials

---

## Protected Pages

### Buyer Dashboard (`/buyer-dashboard`)
- **Required Role**: Buyer
- **Redirects To**: `/sign-in` if not authenticated
- **Features**:
  - View available pools
  - Search and filter pools
  - Interactive Google Maps (nearby suppliers)
  - User menu with sign-out
  - Mobile-responsive navigation

### Supplier Dashboard (`/supplier-dashboard`)
- **Required Role**: Supplier
- **Redirects To**: `/sign-in` if not authenticated
- **Features**:
  - Create and manage deals
  - View orders
  - Track sales
  - User menu with sign-out
  - Mobile-responsive navigation

---

## Data Storage

### localStorage Keys

**User Session:**
- `bulkbuddy_token` - Session token (base64 encoded)
- `bulkbuddy_user` - Current user object (JSON)

**All Users Database:**
- `bulkbuddy_users` - Object with all registered users

### Data Structure

```typescript
interface User {
  id: string                    // Unique ID
  name: string                  // Full name
  email: string                 // Email address
  userType: 'buyer' | 'supplier'
  company?: string              // Company name
  location?: string             // Location (default: "Pune MIDC")
  createdAt: string            // Creation timestamp
}
```

---

## Security Features

### Current (Demo)
✅ Email validation
✅ Password confirmation matching
✅ Minimum password length (6 chars)
✅ Session persistence
✅ Protected routes by user type
✅ Logout functionality
✅ Error handling and user feedback

### Future Improvements
🔲 Password hashing (bcrypt)
🔲 JWT tokens
🔲 Backend API integration
🔲 Email verification
🔲 Forgot password recovery
🔲 Two-factor authentication
🔲 Password reset flow
🔲 Session expiration

---

## Testing the Authentication

### Test Sign Up
1. Go to `http://localhost:3000`
2. Click "Sign Up" button
3. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Type: "Buyer"
   - Password: "test123"
4. Click "Create Account"
5. ✅ Redirected to `/buyer-dashboard`

### Test Sign In with Demo Account
1. Go to `http://localhost:3000/sign-in`
2. Enter demo credentials:
   - Email: `demo@bulkbuddy.com`
   - Password: `demo123`
3. Click "Sign In"
4. ✅ Redirected to buyer dashboard
5. ✅ User menu shows "John Doe - Buyer"

### Test Protected Routes
1. Open browser DevTools → Applications → localStorage
2. Delete `bulkbuddy_token` and `bulkbuddy_user`
3. Navigate to `/buyer-dashboard`
4. ✅ Automatically redirected to `/sign-in`

### Test Sign Out
1. While logged in on dashboard
2. Click user avatar/menu in header
3. Click "Sign Out"
4. ✅ Logged out, session cleared
5. ✅ Redirected to home page

---

## Integration with Dashboards

### Buyer Dashboard Integration
- **File**: `app/buyer-dashboard/page.tsx`
- **User Menu**: Shows current buyer
- **Protected**: Requires buyer role
- **Features**: Pools, maps, search

### Supplier Dashboard Integration
- **File**: `app/supplier-dashboard/page.tsx`
- **User Menu**: Shows current supplier
- **Protected**: Requires supplier role
- **Features**: Deals, orders, analytics

---

## Key Components in Action

### 1. Provider Setup (app/layout.tsx)
```tsx
import { Providers } from '@/components/providers';

export default function RootLayout() {
  return (
    <html>
      <body>
        <Providers>
          {/* App content */}
        </Providers>
      </body>
    </html>
  );
}
```

The `Providers` component includes:
- `AuthProvider` - Provides auth context
- `QueryClientProvider` - For data fetching
- `Toaster` - For notifications

### 2. Using Auth in Components
```tsx
'use client';
import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  return (
    <>
      {isAuthenticated && <p>Hello, {user?.name}!</p>}
      <button onClick={signOut}>Sign Out</button>
    </>
  );
}
```

### 3. Protecting Pages
```tsx
import { ProtectedRoute } from '@/components/protected-route';

export default function ProtectedPage() {
  return (
    <ProtectedRoute requiredUserType="buyer">
      <BuyerContent />
    </ProtectedRoute>
  );
}
```

---

## Common Workflows

### Workflow 1: New User Registration
1. User lands on `/` (homepage)
2. Clicks "Join as Buyer" or "Become a Supplier"
3. Redirected to `/sign-up`
4. Selects user type (Buyer/Supplier)
5. Fills registration form
6. Clicks "Create Account"
7. Account created in localStorage
8. Redirected to appropriate dashboard
9. ✅ Can now use platform features

### Workflow 2: Existing User Login
1. User on `/` homepage
2. Clicks "Sign In"
3. Enters email & password
4. Session created
5. Redirected to `/buyer-dashboard`
6. ✅ Can access all buyer features

### Workflow 3: User Logout
1. While on dashboard
2. Clicks user menu (avatar in header)
3. Clicks "Sign Out"
4. Session cleared from localStorage
5. Redirected to homepage
6. ✅ Must sign in again to access dashboards

---

## File Structure
```
app/
├── layout.tsx                    # Root layout with Providers
├── (auth)/
│   ├── sign-in/
│   │   └── page.tsx             # Sign-in page
│   └── sign-up/
│       └── page.tsx             # Sign-up page
├── buyer-dashboard/
│   └── page.tsx                 # Protected buyer page
└── supplier-dashboard/
    └── page.tsx                 # Protected supplier page

components/
├── features/
│   ├── auth/
│   │   ├── sign-in.tsx          # Sign-in form component
│   │   └── sign-up.tsx          # Sign-up form component
│   └── user-menu.tsx            # User dropdown menu
└── protected-route.tsx          # Route protection wrapper

lib/
├── auth-context.tsx             # Auth state & hooks
└── demo-init.ts                 # Demo user initialization
```

---

## URLs to Test

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing page | ✅ Public |
| `/sign-in` | Login page | ✅ Public |
| `/sign-up` | Registration page | ✅ Public |
| `/buyer-dashboard` | Buyer dashboard | 🔒 Protected (buyer) |
| `/supplier-dashboard` | Supplier dashboard | 🔒 Protected (supplier) |
| `/pool/[id]` | Pool details | ✅ Public |

---

## Environment Variables
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

---

## Next Steps (Future Enhancements)

1. **Backend Integration**
   - Replace localStorage with API
   - Use proper database (MongoDB, PostgreSQL)
   - Implement JWT authentication

2. **Security**
   - Password hashing (bcrypt)
   - Email verification
   - Rate limiting
   - CSRF protection

3. **Features**
   - Profile page
   - Settings page
   - Password reset
   - Two-factor authentication
   - Social login (Google, GitHub)

4. **Email**
   - Welcome emails
   - Verification emails
   - Password reset emails
   - Order notifications

---

## Support
For issues or questions about authentication, check:
- [Auth Context](lib/auth-context.tsx)
- [Sign In Component](components/features/auth/sign-in.tsx)
- [Sign Up Component](components/features/auth/sign-up.tsx)
- [Protected Routes](components/protected-route.tsx)

---

**Last Updated**: January 14, 2026
