# BulkBuddy - B2B Group Buying Web App

A professional industrial B2B group buying platform that helps SME businesses slash raw material costs by 20% through collaborative pool-based purchasing.

## 🎯 Overview

BulkBuddy is a Next.js-powered web application that enables:
- **SME Buyers**: Discover and join group buying pools for better material prices
- **Suppliers**: Create deals with dynamic pricing tiers based on volume milestones
- **Real-time Gamification**: Watch prices drop as pool volumes increase

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI + Lucide React Icons
- **Theme**: Professional Industrial (Deep Blue + Emerald Green)
- **Runtime**: Node.js + TypeScript

## 📁 Project Structure

```
Semicolon-BulkBuddy/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout with providers
│   ├── globals.css                       # Global theme & styles
│   ├── sign-in/page.tsx                  # Buyer/Supplier login
│   ├── sign-up/page.tsx                  # Registration (Buyer/Supplier)
│   ├── buyer-dashboard/page.tsx          # Mobile-first buyer dashboard
│   ├── pool/[id]/page.tsx               # Pool detail page with gamification
│   └── supplier-dashboard/page.tsx       # Desktop-first supplier dashboard
├── components/
│   ├── providers.tsx                     # App providers (themes, etc.)
│   ├── common/                           # Shared components
│   ├── derived/                          # Extended components
│   ├── ui/                               # Base UI components
│   └── visuals/                          # Visual/design components
├── lib/
│   └── utils.ts                          # Utility functions
├── public/                               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts                    # Tailwind configuration
├── next.config.ts
└── README.md
```

## 🎨 Color Theme

**Professional Industrial Design**

| Element | Light Mode | Dark Mode |
|---------|-----------|----------|
| Primary (Deep Blue) | #1e3a8a | #1e40af |
| Primary Light | #3b82f6 | #60a5fa |
| Secondary (Emerald) | #059669 | #047857 |
| Secondary Light | #10b981 | #34d399 |
| Accent (Amber) | #f59e0b | #fbbf24 |
| Background | #f8fafc | #0f172a |
| Foreground | #0f172a | #f1f5f9 |

## 📱 Core Features

### 1. Landing Page (Public)
- **Hero Section**: "Slash Raw Material Costs by 20%"
- **How It Works**: 3-step visual guide
  1. Join Pool
  2. Price Drops
  3. Save Big
- **CTAs**: "Login as Buyer" / "Login as Supplier"
- **Features Overview**: Transparent pricing, verified suppliers, mobile-first, real-time updates
- **Responsive Design**: Full mobile support

### 2. SME Buyer Dashboard (Mobile-First)

**Key Components:**
- **Header**: User location (e.g., "Pune MIDC") + Wallet Balance
- **Location Card**: Show user's industrial zone
- **Wallet Card**: Display available balance
- **Interactive Map Placeholder**: Shows nearby active pools (expandable feature)
- **Search Bar**: Filter pools by product name
- **Active Pools Grid**: 
  - Product name, image placeholder
  - Current volume progress bar
  - Retail vs Current price comparison
  - Savings amount highlighted
  - "Ending in X hours" urgency badge
  - "View Pool" CTA button

**Features:**
- Mobile-responsive card layout
- Real-time search filtering
- Sticky header navigation
- Touch-friendly buttons and inputs

### 3. Pool Detail Page (Gamification Screen)

**Main Sections:**
- **Product Header**: 
  - Product image/icon
  - Product name
  - Description
  - Supplier info
  - Specifications

- **Dynamic Price Tracker**:
  - Large volume progress bar (0-100%)
  - Retail Price (strikethrough)
  - **Current Price** (highlighted, high contrast)
  - **Next Tier Price** with target volume
  - Savings visualization

- **Sidebar (Sticky)**:
  - Quantity input field
  - Real-time cost calculation
  - "Join Pool Now" CTA button
  - Minimum order info
  - Payment method details
  - Success state with "Continue Shopping"

- **Participants List**:
  - Avatar + company name
  - Quantity joined
  - "+X more businesses" counter
  - Scrollable/expandable list

**Key Design Elements:**
- **High-contrast pricing**: Bold fonts, color-coded prices
- **Sticky sidebar** on mobile
- **Prominent CTA**: Large blue "Join Pool Now" button
- **Real-time calculations**: Shows cost based on current price

### 4. Supplier Dashboard (Desktop-First)

**Stats Overview Cards:**
- **Total Sales**: ₹XXXX (this month)
- **Active Deals**: Number of running pools
- **Pending Deliveries**: Ready-to-ship orders

**Create Deal Section:**
- Form fields:
  - Product Name
  - Base Price (₹)
  - Tier 1: Volume + Discount %
  - Tier 2 (optional): Volume + Discount %
- Toggle-able form (New Deal button)
- Create/Cancel actions

**Active Deals Management:**
- Expandable deal cards showing:
  - Product name & status badge
  - Base price & tier count
  - Pricing tier details when expanded
  - Edit & Delete buttons per deal

**Orders Table** (Desktop view):
- Columns: Product, Volume, Amount, Participants, Status
- Status badges: Ready, In Transit, Delivered
- Sortable/filterable
- Icons for visual clarity

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun package manager

### Installation

1. **Navigate to project directory:**
```bash
cd "c:\Users\Tanay\OneDrive\Desktop\BulkBuudy\Semicolon-BulkBuddy"
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint:biome   # Run Biome linter
npm run lint:ts      # TypeScript type checking
npm run format       # Auto-format code
```

## 🎯 User Flows

### Buyer Flow
1. **Landing Page** → Click "Login as Buyer"
2. **Sign In/Sign Up** → Enter credentials
3. **Buyer Dashboard** → Browse pools by location
4. **Search** → Filter products
5. **Pool Detail** → View price tiers and participant list
6. **Join Pool** → Enter quantity and confirm
7. **Success** → Order added to account

### Supplier Flow
1. **Landing Page** → Click "Login as Supplier"
2. **Sign In/Sign Up** → Enter company details
3. **Supplier Dashboard** → View sales metrics
4. **Create Deal** → Add product with pricing tiers
5. **Manage Deals** → Edit/delete active pools
6. **Orders Table** → Monitor dispatch status

## 🎨 Design Highlights

### Mobile-First Approach
- **Buyer Dashboard**: Optimized for mobile phones
- Responsive grid layouts (1 col mobile, 2-3 col desktop)
- Sticky headers and CTAs on mobile
- Touch-friendly input fields and buttons

### Desktop-First Supplier Features
- Wide table layouts for order management
- Expandable deal cards for detail view
- Side-by-side comparisons

### Accessibility
- High-contrast text on all backgrounds
- Semantic HTML structure
- ARIA labels for icons
- Keyboard navigation support
- Dark/Light mode support

### Performance
- Next.js Turbopack for fast builds
- Image optimization
- Code splitting per route
- Client-side state management where needed

## 🔐 Authentication

Current implementation includes:
- Sign-in page with email/password
- Sign-up with role selection (Buyer/Supplier)
- Form validation
- Redirect to appropriate dashboard

**Note**: Backend authentication (JWT, OAuth) can be integrated via Better Auth or Auth.js

## 📊 Mock Data

All pages use realistic mock data:
- **Pools**: Industrial materials (Steel, Aluminum, Copper, Rubber)
- **Pricing**: Real-world B2B pricing scenarios
- **Participants**: Anonymous business names with quantities
- **Orders**: Various dispatch statuses

## 🔄 Future Enhancements

- [ ] Backend API integration
- [ ] Real user authentication
- [ ] Payment gateway integration
- [ ] Map integration (Google Maps API)
- [ ] WebSocket for real-time price updates
- [ ] Order tracking & notifications
- [ ] User reviews & ratings
- [ ] Dashboard analytics
- [ ] Email notifications
- [ ] Admin panel

## 📝 Notes

- Theme colors defined in `app/globals.css` as CSS variables
- All components use Tailwind CSS utility classes
- Icons from Lucide React (24x24 default size)
- No external dependencies for UI (using Shadcn components)
- Fully responsive and mobile-optimized

## 📄 License

This project is part of the BulkBuddy initiative.

---

**Built with ❤️ for SME Businesses**
