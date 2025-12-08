# 🎉 Event Mania

**The Ultimate Campus Event Management Platform**

Event Mania is a comprehensive event management platform designed for educational institutions, enabling seamless event creation, registration, and management across multiple user roles. From cultural fests to hackathons – we bring everything under one roof.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0.2-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Features

### 🎪 Event Discovery & Registration
- Browse and discover exciting events from colleges across the country
- Filter events by category (Technical, Cultural, Sports, Workshops)
- Separate intra-college and inter-college events
- One-click event registration with instant confirmation
- Real-time event updates and notifications

### 👥 Multi-Role Support
- **Students** - Discover and register for events
- **College Admins** - Create and manage college events
- **Super Admins** - Oversee platform operations and approvals
- **Companies** - Organize inter-college events

### 🔐 Secure Authentication
- Google OAuth integration via Firebase Auth
- Role-based access control (RBAC)
- Student verification by college admins
- College admin approval by super admins

### 📊 Analytics Dashboard
- Event-wise participation tracking
- Registration statistics
- Popular events insights
- Platform-wide analytics for super admins

### 🔔 Real-time Notifications
- Event registration confirmations
- Account verification updates
- Event reminders
- Admin approval notifications

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Dark mode support
- Mobile-first approach

## � Screenshots

### Landing Page
<!-- ![Landing Page](./screenshots/landing-page.png) -->
<img width="1440" height="781" alt="image" src="https://github.com/user-attachments/assets/500bd658-461a-44a7-91f0-044410352cbc" />


### Event Discovery
<!-- ![Event Discovery](./screenshots/event-discovery.png) -->
<img width="1440" height="778" alt="image" src="https://github.com/user-attachments/assets/c71ba9fb-df5d-4981-bdea-5891cb470186" />


### Event Details
<!-- ![Event Details](./screenshots/event-details.png) -->
<img width="1440" height="814" alt="image" src="https://github.com/user-attachments/assets/05be3536-6a0c-4b0e-93ca-cf00d3450e4c" />


### Student Dashboard
<!-- ![Dashboard](./screenshots/dashboard.png) -->
<img width="1439" height="813" alt="image" src="https://github.com/user-attachments/assets/ac1a5a77-6a42-4944-ae5f-c117ab5a0e11" />

### College Admin Dashboard

<img width="1440" height="777" alt="image" src="https://github.com/user-attachments/assets/795397ca-42c0-43a6-b82d-b684b6365cdd" />


### Event Creation
<!-- ![Event Creation](./screenshots/event-creation.png) -->
<img width="1440" height="777" alt="image" src="https://github.com/user-attachments/assets/bf3dd377-3081-4f6a-8542-1357f7f860e9" />


### Registration Management
<!-- ![Registration Management](./screenshots/registration-management.png) -->
<img width="1440" height="778" alt="image" src="https://github.com/user-attachments/assets/dae35176-35b1-4711-80da-73f0ff192ea0" />


## �🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16.0.7 |
| **Frontend** | React 19.2.0 |
| **Styling** | Tailwind CSS 4.0 |
| **Animations** | Framer Motion 11.15.0 |
| **Backend** | Firebase (Firestore) |
| **Authentication** | Firebase Auth + Google OAuth |
| **Database** | Firebase Firestore |
| **Image Storage** | imgbb API |
| **Charts** | Recharts 2.15.0 |
| **Notifications** | React Hot Toast 2.4.1 |
| **Icons** | React Icons 5.4.0 |
| **Date Handling** | date-fns 4.1.0 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- imgbb API key (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kushyanthpothi/EventMania.git
   cd EventMania
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Admin SDK
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
   
   # imgbb API
   NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
event-mania/
├── app/
│   ├── components/          # Reusable components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Common UI components
│   │   ├── events/         # Event-related components
│   │   └── layout/         # Layout components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── firebase/       # Firebase configuration
│   │   ├── imgbb/          # Image upload utilities
│   │   └── utils/          # Helper functions
│   ├── dashboard/          # Dashboard pages
│   ├── events/             # Event pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── about/              # About page
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── next.config.mjs         # Next.js configuration
```

## 🔑 Key Features Explained

### User Roles & Permissions

#### Students
- ✅ View all eligible events (intra & inter)
- ✅ Register for events
- ✅ Edit profile (photo, registration number)
- ✅ View participation history
- ✅ Receive email/SMS notifications
- ❌ Cannot cancel registrations

#### College Admins
- ✅ Create **Intra Events** (instant approval)
- ✅ Create **Inter Events** (requires Super Admin approval)
- ✅ Verify students from their college
- ✅ View registered students
- ✅ Access event analytics

#### Super Admins
- ✅ Approve/reject College Admins
- ✅ Approve/reject Inter Events
- ✅ Platform-wide analytics
- ✅ Manage all users and events

### Authentication Flow

```
1. Student Signs Up (Google OAuth)
2. Selects College from Dropdown
3. Uploads Profile Photo
4. Enters Registration Number
5. Verification Request Sent to College Admin
6. College Admin Reviews & Approves
7. Student Account Activated
8. Email/SMS Confirmation Sent
```

## 👥 Team

Meet the passionate minds behind Event Mania:

- **Praveen Kumar** - Team Leader
- **MahendraNath** - Co-Leader
- **Venkatesh** - Developer
- **Joshi** - Designer
- **Kushyanth** - Backend Developer

## 📊 Database Schema

### Collections

- **users** - User profiles and authentication data
- **colleges** - College information and admin details
- **events** - Event details and metadata
- **registrations** - Event registration records
- **notifications** - User notifications
- **verificationRequests** - Student verification requests

## 🔒 Security

- Firebase Authentication with Google OAuth
- Firestore Security Rules for data protection
- Role-based access control (RBAC)
- Protected API routes
- Secure session management

## 🎨 Design Philosophy

- **Modern & Clean** - Minimalist design with focus on content
- **Responsive** - Mobile-first approach
- **Accessible** - WCAG 2.1 AA compliant
- **Fast** - Optimized loading and animations
- **Intuitive** - Easy navigation and clear CTAs

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For any questions or suggestions, please contact the team.

## 📧 Contact

For support or inquiries, reach out to us at:
- Email: kushyanthpothineni2003@gmail.com
- GitHub: [@kushyanthpothi](https://github.com/kushyanthpothi)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for the robust backend infrastructure
- Tailwind CSS for the beautiful styling system
- All contributors and supporters of this project

---

**Made with ❤️ by the Event Mania Team**
