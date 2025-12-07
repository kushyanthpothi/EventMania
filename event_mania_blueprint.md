# 🎉 Event Mania - Complete Master Blueprint

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Authentication & Verification Flow](#authentication--verification-flow)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [Folder Structure](#folder-structure)
8. [API Routes](#api-routes)
9. [UI/UX Requirements](#uiux-requirements)
10. [Security & Best Practices](#security--best-practices)

---

## 🎯 Overview

**Event Mania** is a comprehensive event management platform designed for educational institutions, enabling seamless event creation, registration, and management across multiple user roles.

### Target Audience
- **Students** - Discover and register for events
- **College Admins** - Create and manage college events
- **Super Admins** - Oversee platform operations and approvals
- **Companies** - Organize inter-college events

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 14+ (JavaScript) |
| **Backend** | Firebase (Firestore/Realtime Database) |
| **Authentication** | Firebase Auth + Google OAuth |
| **Database** | Firebase Firestore |
| **Payments** | Stripe |
| **Image Storage** | imgbb API |
| **Styling** | Tailwind CSS + Framer Motion |
| **Hosting** | Firebase Hosting |
| **Email/SMS** | Firebase Cloud Functions + Twilio/SendGrid |

---

## 👥 User Roles & Permissions

### 1️⃣ **Students**
#### Permissions
- ✅ View all eligible events (intra & inter)
- ✅ Register for events
- ✅ Edit profile (photo, registration number)
- ✅ View participation history
- ✅ Receive email/SMS notifications
- ❌ Cannot cancel registrations

#### Registration Process
1. Sign up with Google OAuth
2. Select college from dropdown (only approved colleges)
3. Upload profile photo
4. Enter college registration number
5. Wait for College Admin verification
6. Account activated after approval

---

### 2️⃣ **College Admins**
#### Permissions
- ✅ Create **Intra Events** (instant approval)
- ✅ Create **Inter Events** (requires Super Admin approval)
- ✅ Verify students from their college
- ✅ View registered students
- ✅ Access event analytics
- ✅ Manage college profile

#### Approval Process
1. Register as College Admin
2. Wait for Super Admin approval
3. Once approved, college appears in student dropdown
4. Can create events and verify students

---

### 3️⃣ **Super Admins**
#### Permissions
- ✅ Approve/reject College Admins
- ✅ Approve/reject Inter Events
- ✅ Approve/reject Companies
- ✅ Approve/reject Company Events
- ✅ Create national-level events
- ✅ Platform-wide analytics
- ✅ Dashboard with pending approvals
- ✅ Manage all users and events

---

### 4️⃣ **Companies**
#### Permissions
- ✅ Organize Inter Events (requires Super Admin approval)
- ✅ Brand showcase on platform
- ✅ View event registrations
- ✅ Access analytics for their events

#### Approval Process
1. Register as Company
2. Submit company details and documentation
3. Wait for Super Admin approval
4. Create and manage events after approval

---

## 🔐 Authentication & Verification Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│ 1. College Admin Registers                                   │
│ 2. Super Admin Reviews Application                           │
│ 3. Super Admin Approves College Admin                        │
│ 4. College Name Added to Dropdown                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     STUDENT WORKFLOW                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Student Signs Up (Google OAuth)                           │
│ 2. Selects College from Dropdown (only approved colleges)    │
│ 3. Uploads Profile Photo                                     │
│ 4. Enters Registration Number                                │
│ 5. Verification Request Sent to College Admin                │
│ 6. College Admin Reviews & Approves                          │
│ 7. Student Account Activated                                 │
│ 8. Email/SMS Confirmation Sent                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     EVENT REGISTRATION                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Student Browses Events                                    │
│ 2. Registers for Event                                       │
│ 3. Payment (if required via Stripe)                          │
│ 4. Email/SMS Confirmation                                    │
│ 5. No Cancellation Allowed                                   │
└─────────────────────────────────────────────────────────────┘
```

### Approval Hierarchy

```
Super Admin (Top Level)
    │
    ├── Approves College Admins → College in Dropdown
    ├── Approves Companies → Can Create Events
    ├── Approves Inter Events
    └── Approves Company Events
    
College Admin (Mid Level)
    │
    ├── Verifies Students → Account Activation
    ├── Creates Intra Events (Auto-approved)
    └── Creates Inter Events (Needs Super Admin Approval)

Student (Base Level)
    │
    └── Registers for Events
```

---

## 🎯 Core Features

### 🏠 Landing Page
- **Hero Section** with call-to-action
- **Upcoming Events** carousel
- **Featured Events** (top-rated/popular)
- **Search & Filter**
  - Event type (Intra/Inter)
  - College
  - Category (Technical, Cultural, Sports, etc.)
  - Date range
- **Company Showcase** section
- **Statistics** (Total events, students, colleges)
- **Testimonials**

---

### 🎪 Event Management

#### Event Creation (College Admin)
**Intra Events:**
- Instant creation (no approval needed)
- Only students from same college can register

**Inter Events:**
- Requires Super Admin approval
- Open to students from all colleges
- Approval notification sent to admin

#### Event Details
- Event name
- Description
- Category (Technical, Cultural, Sports, Workshop, etc.)
- Type (Intra/Inter)
- Date & Time
- Venue (Physical/Virtual)
- Registration required (Yes/No)
- Max participants
- Registration fee (optional)
- Event banner image
- Rules & regulations
- Contact information

#### Event Registration
- Students can view eligible events
- One-click registration
- Payment via Stripe (if paid event)
- Email/SMS confirmation
- **No cancellation allowed**
- View registration status

---

### 📊 Analytics Dashboard

#### College Admin Analytics
- Total events created
- Total registrations
- Event-wise participation
- Students registered per event
- Popular events
- Revenue (if paid events)

#### Super Admin Analytics
- Platform-wide statistics
- Total colleges, students, events
- Approval pending count
- Event distribution (Intra vs Inter)
- College-wise participation
- Revenue analytics
- Growth metrics

---

### 🔔 Notification System

#### Email Notifications
- Student account verification approved
- Event registration confirmation
- Event reminder (1 day before)
- Admin approval notifications
- Payment receipt

#### SMS Notifications
- Registration confirmation with event details
- Event reminder

#### In-App Notifications
- Real-time notifications for pending approvals
- Event updates
- Registration status

---

### 💳 Payment Integration (Stripe)

#### Features
- Secure payment processing
- Support for multiple currencies
- Payment receipt generation
- Refund handling (admin only)
- Payment history

#### Flow
```
Student Registers → Payment Required? 
    ↓ Yes                    ↓ No
Stripe Checkout         Direct Registration
    ↓
Payment Success
    ↓
Registration Confirmed
    ↓
Email/SMS Sent
```

---

## 🗄️ Database Schema

### Firestore Collections

#### **1. Users Collection**
```javascript
users/{userId}
{
  uid: "firebase_uid_123",
  name: "John Doe",
  email: "john@college.edu",
  role: "student", // student | college_admin | super_admin | company
  
  // Student-specific fields
  collegeId: "college_123",
  registrationNumber: "REG2025001",
  profileImg: "https://imgbb.com/image.png",
  verified: false, // Verified by College Admin
  phone: "+91-9876543210",
  
  // College Admin-specific fields
  collegeName: "XYZ College",
  collegeLocation: "City, State",
  approvedBySuper: false, // Approved by Super Admin
  
  // Company-specific fields
  companyName: "Tech Corp",
  companyLogo: "https://imgbb.com/logo.png",
  companyWebsite: "https://techcorp.com",
  
  // Common fields
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

#### **2. Colleges Collection**
```javascript
colleges/{collegeId}
{
  id: "college_123",
  name: "XYZ College",
  adminId: "admin_uid_123",
  location: "City, State",
  address: "Full Address",
  website: "https://xyzcollege.edu",
  logo: "https://imgbb.com/logo.png",
  approved: false, // Approved by Super Admin
  approvedAt: timestamp,
  approvedBy: "super_admin_uid",
  createdAt: timestamp,
  totalStudents: 0,
  totalEvents: 0
}
```

#### **3. Events Collection**
```javascript
events/{eventId}
{
  id: "event_123",
  title: "Tech Fest 2025",
  description: "Annual technical festival",
  category: "Technical", // Technical, Cultural, Sports, Workshop
  type: "inter", // intra | inter
  
  // Organization details
  collegeId: "college_123",
  collegeName: "XYZ College",
  createdBy: "admin_uid_123",
  organizerType: "college", // college | company
  companyId: "company_123", // if organized by company
  
  // Event details
  startDate: timestamp,
  endDate: timestamp,
  venue: "College Auditorium",
  venueType: "physical", // physical | virtual
  virtualLink: "https://zoom.us/...", // if virtual
  
  // Registration
  registrationRequired: true,
  registrationFee: 500, // 0 for free
  maxParticipants: 100,
  currentRegistrations: 0,
  registrationDeadline: timestamp,
  
  // Media
  bannerImage: "https://imgbb.com/banner.png",
  images: ["url1", "url2"],
  
  // Status
  status: "pending", // pending | approved | rejected | completed
  approvedBy: "super_admin_uid", // if inter event
  approvedAt: timestamp,
  
  // Additional
  rules: "Event rules and regulations",
  contactEmail: "event@college.edu",
  contactPhone: "+91-9876543210",
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **4. Registrations Collection**
```javascript
registrations/{registrationId}
{
  id: "reg_123",
  eventId: "event_123",
  studentId: "student_uid_123",
  studentName: "John Doe",
  studentEmail: "john@college.edu",
  studentCollege: "XYZ College",
  
  // Payment
  paymentRequired: true,
  paymentAmount: 500,
  paymentStatus: "completed", // pending | completed | failed
  paymentId: "stripe_payment_id",
  
  // Status
  status: "confirmed", // confirmed | cancelled | attended
  
  // Timestamps
  registeredAt: timestamp,
  paymentAt: timestamp
}
```

#### **5. Notifications Collection**
```javascript
notifications/{notificationId}
{
  id: "notif_123",
  userId: "user_uid_123",
  type: "approval", // approval | registration | event_update | payment
  title: "Account Verified",
  message: "Your account has been verified by college admin",
  read: false,
  link: "/dashboard", // Optional link to redirect
  createdAt: timestamp
}
```

#### **6. Verification Requests Collection**
```javascript
verificationRequests/{requestId}
{
  id: "req_123",
  studentId: "student_uid_123",
  studentName: "John Doe",
  studentEmail: "john@college.edu",
  collegeId: "college_123",
  collegeName: "XYZ College",
  registrationNumber: "REG2025001",
  profileImg: "https://imgbb.com/image.png",
  status: "pending", // pending | approved | rejected
  reviewedBy: "admin_uid_123", // College Admin who reviewed
  reviewedAt: timestamp,
  createdAt: timestamp
}
```

#### **7. Companies Collection**
```javascript
companies/{companyId}
{
  id: "company_123",
  name: "Tech Corp",
  description: "Leading technology company",
  logo: "https://imgbb.com/logo.png",
  website: "https://techcorp.com",
  adminId: "company_admin_uid",
  adminEmail: "admin@techcorp.com",
  approved: false, // Approved by Super Admin
  approvedAt: timestamp,
  approvedBy: "super_admin_uid",
  totalEvents: 0,
  createdAt: timestamp
}
```

---

## 📁 Folder Structure

```
event-mania/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Sidebar.js
│   │   │   └── DashboardLayout.js
│   │   │
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.js
│   │   │   ├── SignUpForm.js
│   │   │   ├── ProfileSetup.js
│   │   │   └── ProtectedRoute.js
│   │   │
│   │   ├── landing/
│   │   │   ├── HeroSection.js
│   │   │   ├── UpcomingEvents.js
│   │   │   ├── FeaturedEvents.js
│   │   │   ├── SearchFilter.js
│   │   │   ├── CompanyShowcase.js
│   │   │   └── Statistics.js
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.js
│   │   │   ├── EventDetails.js
│   │   │   ├── EventForm.js
│   │   │   ├── EventList.js
│   │   │   ├── EventRegistration.js
│   │   │   └── EventFilters.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── MyRegistrations.js
│   │   │   │   ├── ProfileEdit.js
│   │   │   │   └── ParticipationHistory.js
│   │   │   │
│   │   │   ├── college-admin/
│   │   │   │   ├── CollegeAdminDashboard.js
│   │   │   │   ├── CreateEvent.js
│   │   │   │   ├── ManageEvents.js
│   │   │   │   ├── VerifyStudents.js
│   │   │   │   ├── StudentList.js
│   │   │   │   └── AnalyticsDashboard.js
│   │   │   │
│   │   │   ├── super-admin/
│   │   │   │   ├── SuperAdminDashboard.js
│   │   │   │   ├── ApproveColleges.js
│   │   │   │   ├── ApproveEvents.js
│   │   │   │   ├── ApproveCompanies.js
│   │   │   │   ├── PlatformAnalytics.js
│   │   │   │   └── ManageUsers.js
│   │   │   │
│   │   │   └── company/
│   │   │       ├── CompanyDashboard.js
│   │   │       ├── CreateCompanyEvent.js
│   │   │       └── CompanyAnalytics.js
│   │   │
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   ├── Card.js
│   │   │   ├── Loader.js
│   │   │   ├── Toast.js
│   │   │   ├── Dropdown.js
│   │   │   ├── DatePicker.js
│   │   │   └── ImageUpload.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationBell.js
│   │   │   ├── NotificationList.js
│   │   │   └── NotificationItem.js
│   │   │
│   │   ├── analytics/
│   │   │   ├── StatsCard.js
│   │   │   ├── ChartComponent.js
│   │   │   └── AnalyticsTable.js
│   │   │
│   │   └── payment/
│   │       ├── StripeCheckout.js
│   │       ├── PaymentSuccess.js
│   │       └── PaymentFailed.js
│   │
│   ├── (pages)/
│   │   ├── page.js (Landing Page)
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── signup/
│   │   │   └── page.js
│   │   ├── events/
│   │   │   ├── page.js (All Events)
│   │   │   └── [id]/
│   │   │       └── page.js (Event Details)
│   │   ├── dashboard/
│   │   │   ├── page.js (Role-based Dashboard)
│   │   │   ├── profile/
│   │   │   │   └── page.js
│   │   │   ├── events/
│   │   │   │   ├── create/
│   │   │   │   │   └── page.js
│   │   │   │   └── manage/
│   │   │   │       └── page.js
│   │   │   ├── analytics/
│   │   │   │   └── page.js
│   │   │   └── approvals/
│   │   │       └── page.js
│   │   └── about/
│   │       └── page.js
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/
│   │   │   │   └── route.js
│   │   │   └── signup/
│   │   │       └── route.js
│   │   ├── events/
│   │   │   ├── create/
│   │   │   │   └── route.js
│   │   │   ├── [id]/
│   │   │   │   └── route.js
│   │   │   └── register/
│   │   │       └── route.js
│   │   ├── users/
│   │   │   ├── verify/
│   │   │   │   └── route.js
│   │   │   └── profile/
│   │   │       └── route.js
│   │   ├── approvals/
│   │   │   ├── college/
│   │   │   │   └── route.js
│   │   │   ├── event/
│   │   │   │   └── route.js
│   │   │   └── company/
│   │   │       └── route.js
│   │   ├── payments/
│   │   │   ├── create-intent/
│   │   │   │   └── route.js
│   │   │   └── webhook/
│   │   │       └── route.js
│   │   └── notifications/
│   │       └── route.js
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.js
│   │   │   ├── auth.js
│   │   │   ├── firestore.js
│   │   │   └── storage.js
│   │   ├── stripe/
│   │   │   └── config.js
│   │   ├── imgbb/
│   │   │   └── upload.js
│   │   └── utils/
│   │       ├── validators.js
│   │       ├── helpers.js
│   │       └── constants.js
│   │
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── EventContext.js
│   │   └── NotificationContext.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useEvents.js
│   │   ├── useNotifications.js
│   │   └── useFirestore.js
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── layout.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── firebase/
│   └── functions/
│       ├── index.js
│       └── notifications/
│           ├── email.js
│           └── sms.js
│
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/user` - Get current user

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/[id]` - Get event details
- `POST /api/events/create` - Create new event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/events/register` - Register for event

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/verify` - Verify student account
- `GET /api/users/college/[id]` - Get students by college

### Approvals
- `GET /api/approvals/pending` - Get pending approvals
- `POST /api/approvals/college` - Approve college admin
- `POST /api/approvals/event` - Approve event
- `POST /api/approvals/company` - Approve company

### Colleges
- `GET /api/colleges` - Get approved colleges
- `GET /api/colleges/[id]` - Get college details
- `POST /api/colleges/create` - Create college

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment
- `POST /api/payments/webhook` - Stripe webhook

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/[id]/read` - Mark as read

---

## 🎨 UI/UX Requirements

### Design Principles
- **Modern & Clean** - Minimalist design with focus on content
- **Responsive** - Mobile-first approach
- **Accessible** - WCAG 2.1 AA compliant
- **Fast** - Optimized loading and animations
- **Intuitive** - Easy navigation and clear CTAs

### Animation Requirements
- **Page Transitions** - Smooth fade-in/slide-in effects
- **Micro-interactions** - Hover effects, button clicks
- **Loading States** - Skeleton screens, spinners
- **Success/Error Feedback** - Toast notifications with animations
- **Modal Animations** - Scale and fade effects
- **Card Animations** - Stagger animations for lists

### Color Scheme
```
Primary: #6366f1 (Indigo)
Secondary: #ec4899 (Pink)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Background: #f9fafb (Light Gray)
Text: #111827 (Dark Gray)
```

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: Fira Code

### Components to Build
- ✅ Responsive Navbar with role-based menu
- ✅ Hero section with animated background
- ✅ Event cards with hover effects
- ✅ Search bar with autocomplete
- ✅ Filter sidebar with checkboxes
- ✅ Modals for forms and confirmations
- ✅ Dashboard with stats cards
- ✅ Charts and graphs for analytics
- ✅ Notification dropdown
- ✅ User profile dropdown
- ✅ File upload with preview
- ✅ Payment form with Stripe elements
- ✅ Toast notifications
- ✅ Loading skeletons

---

## 🔒 Security & Best Practices

### Authentication Security
- ✅ Firebase Auth with Google OAuth
- ✅ Protected API routes with middleware
- ✅ Role-based access control (RBAC)
- ✅ Secure session management
- ✅ Token expiration and refresh

### Data Security
- ✅ Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Only verified students can read events
    match /events/{eventId} {
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.verified == true;
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'college_admin';
    }
    
    // Only college admins can verify students
    match /verificationRequests/{requestId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'college_admin';
    }
    
    // Only super admins can approve
    match /colleges/{collegeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
  }
}
```

### Input Validation
- ✅ Client-side validation with Yup/Zod
- ✅ Server-side validation for all API routes
- ✅ Sanitize user inputs
- ✅ Prevent XSS and SQL injection

### Payment Security
- ✅ Never store card details
- ✅ Use Stripe's secure checkout
- ✅ Webhook signature verification
- ✅ PCI compliance

### Image Upload Security
- ✅ File type validation
- ✅ File size limits (max 5MB)
- ✅ Image optimization before upload
- ✅ Secure imgbb API key storage

### Performance Optimization
- ✅ Next.js Image component for lazy loading
- ✅ Dynamic imports for code splitting
- ✅ Debounce search inputs
- ✅ Pagination for large lists
- ✅ Caching with React Query / SWR
- ✅ Minimize bundle size

---

## 📝 Development Workflow

### Phase 1: Setup & Authentication (Week 1)
- ✅ Next.js project setup
- ✅ Firebase configuration
- ✅ Google OAuth integration
- ✅ User registration flow
- ✅ Protected routes setup

### Phase 2: Core Features (Week 2-3)
- ✅ Landing page with animations
- ✅ Event creation and management
- ✅ Student verification system
- ✅ Approval workflows
- ✅ College dropdown implementation

### Phase 3: Advanced Features (Week 4)
- ✅ Payment integration
- ✅ Notification system
- ✅ Analytics dashboard
- ✅ Email/SMS notifications

### Phase 4: Testing & Deployment (Week 5)
- ✅ Unit and integration testing
- ✅ Performance optimization
- ✅ Security audit
- ✅ Firebase hosting deployment

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Firebase project setup
- [ ] Stripe account configured
- [ ] imgbb API key obtained
- [ ] Firebase Security Rules implemented
- [ ] Firebase Cloud Functions deployed
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Analytics tracking setup
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy implemented

---

## 📞 Support & Contact

For any queries or support, contact:
- **Email**: support@eventmania.com
- **Phone**: +91-XXXXXXXXXX

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Ready for Development 🚀