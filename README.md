# ARC - Advanced Resource & Community Management Platform

A comprehensive, modern web application designed to streamline campus operations and enhance the educational experience for students, teachers, and administrative staff. Built with cutting-edge technologies and AI-powered features, ARC delivers an intuitive interface for managing academic schedules, canteen operations, parking, events, and personalized learning support.

---

## 🎯 Overview

ARC (Advanced Resource & Community Management) is an all-in-one campus management platform that bridges the gap between students, faculty, and institutional services. With integrated AI mentorship, real-time notifications, and role-based dashboards, ARC transforms how educational institutions operate and how stakeholders interact within them.

---

## 📹 Demo

Watch the ARC platform in action:

- \*\*[Demo Video & Resources]
  https://drive.google.com/drive/folders/1oIR6s3RreYCWm6Vy1ZrBXr4e4zL4LSW4

---

### Key Features

- **AI-Powered Learning Support**: Intelligent AI mentor with voice integration for personalized academic guidance
- **Student Portal**: Comprehensive access to classroom materials, schedule management, event bookings, and campus resources
- **Teacher Dashboard**: Streamlined tools for classroom management, resource distribution, and student attendance tracking
- **Canteen Management**: Digital menu browsing, order placement, demand forecasting, and inventory management
- **Campus Parking**: Smart parking allocation, availability tracking, and booking system
- **Event Management**: Centralized event discovery, booking, and attendance tracking
- **Real-time Analytics**: Data-driven insights for institutional decision-making
- **Secure Authentication**: NextAuth.js integration with role-based access control
- **Payment Integration**: Razorpay integration for seamless online transactions

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**

- **Framework**: [Next.js 15.5.14](https://nextjs.org/) – React-based framework with server-side rendering
- **UI Library**: [React 19](https://react.dev/) – Modern UI component architecture
- **Language**: [TypeScript](https://www.typescriptlang.org/) – Type-safe development
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- **Component Library**: [Radix UI](https://www.radix-ui.com/) – Accessible, unstyled component primitives
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) – Type-safe form validation
- **Animation**: [Framer Motion](https://www.framer.com/motion/) – Smooth, performant animations
- **Charts & Data Visualization**: [Recharts](https://recharts.org/) – Composable charting library

**Backend & Services:**

- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) – Flexible authentication framework
- **AI Integration**: [OpenAI API](https://openai.com/api/) – For AI mentor and content generation
- **Voice**: [Vapi AI](https://vapi.ai/) – Voice conversation integration
- **Payments**: [Razorpay](https://razorpay.com/) – Payment gateway for transactions
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) – For receipt and document generation
- **QR Codes**: [QRCode.js](https://davidshimjs.github.io/qrcodejs/) – Dynamic QR code generation

**DevOps & Tooling:**

- **Package Manager**: pnpm
- **Build Tool**: Next.js built-in build system
- **Linting**: ESLint with Next.js config
- **CSS Processing**: PostCSS + Autoprefixer
- **Analytics**: Vercel Analytics

---

## 📁 Project Structure

```
CODEKNIGHT_ARC/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── canteen/                  # Canteen management module
│   │   │   ├── dashboard/            # Canteen dashboard
│   │   │   ├── menu/                 # Menu management
│   │   │   ├── orders/               # Order management
│   │   │   └── stocks/               # Inventory management
│   │   ├── student/                  # Student portal
│   │   │   ├── ai-mentor/            # AI-powered learning assistant
│   │   │   ├── attendance/           # Attendance tracking
│   │   │   ├── classroom/            # Course materials & discussions
│   │   │   ├── dashboard/            # Student dashboard
│   │   │   ├── events/               # Event discovery & booking
│   │   │   ├── food/                 # Canteen integration
│   │   │   ├── internships/          # Internship opportunities
│   │   │   ├── map/                  # Campus map
│   │   │   ├── materials/            # Educational resources
│   │   │   ├── parking/              # Parking booking
│   │   │   ├── resources/            # Digital library
│   │   │   ├── schedule/             # Class schedule viewer
│   │   │   └── timetable/            # Personal timetable
│   │   ├── teacher/                  # Teacher portal
│   │   │   ├── classroom/            # Class management
│   │   │   ├── dashboard/            # Teacher dashboard
│   │   │   ├── food/                 # Canteen access
│   │   │   ├── parking/              # Parking access
│   │   │   └── timetable/            # Schedule management
│   │   ├── login/                    # Authentication pages
│   │   │   └── page.tsx              # Login interface
│   │   └── signup/                   # Registration
│   │       └── page.tsx              # Signup interface
│   ├── components/                  # Reusable React components
│   │   ├── ui/                       # Base UI components (Radix-based)
│   │   ├── ai-mentor/                # AI mentor specific components
│   │   ├── home/                     # Homepage components
│   │   ├── magicui/                  # Animated UI components
│   │   ├── admin-sidebar.tsx         # Admin navigation
│   │   ├── student-sidebar.tsx       # Student navigation
│   │   ├── teacher-sidebar.tsx       # Teacher navigation
│   │   ├── session-provider.tsx      # NextAuth session provider
│   │   ├── theme-provider.tsx        # Theme management
│   │   └── [other components]        # Feature-specific components
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.ts             # Mobile detection
│   │   ├── use-toast.ts              # Toast notifications
│   │   └── useVapi.ts                # Vapi integration hook
│   ├── lib/                         # Utility functions & libraries
│   │   ├── db.ts                     # Database connection
│   │   ├── auth-client.ts            # Client-side auth utilities
│   │   ├── auth-middleware.ts        # Auth middleware
│   │   ├── arc-ai.ts                 # AI integration utilities
│   │   ├── models.ts                 # Data models & types
│   │   ├── order-models.ts           # Order-related models
│   │   ├── parking-models.ts         # Parking-related models
│   │   └── [other utilities]         # Feature-specific utilities
│   ├── public/                       # Static assets
│   ├── styles/                       # Global styles
│   ├── config/                       # Environment and app configuration
│   └── services/                     # Shared backend services
├── public/                          # Static assets
├── styles/                          # Global styles
├── package.json                     # Project dependencies
├── tsconfig.json                    # TypeScript configuration
├── next.config.mjs                  # Next.js configuration
└── postcss.config.mjs               # PostCSS configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18 or higher
- **pnpm**: v9 or higher (or npm/yarn as alternatives)
- **Git**: For version control
- **Environment Variables**: See [Configuration](#-configuration) section

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ansh-10-p/CODEKNIGHT_ARC.git
   cd CODEKNIGHT_ARC
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the required environment variables (see [Configuration](#-configuration) section).

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

---

## ⚙️ Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# OpenAI Integration
OPENAI_API_KEY=your_openai_api_key

# Vapi Integration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Razorpay Integration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Production
pnpm build            # Build optimized production bundle
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint on the codebase
```

---

## 🎓 Core Modules

### Student Portal

The comprehensive platform for students to manage their academic and campus life:

- **Dashboard**: Quick overview of schedules, upcoming events, and important notifications
- **AI Mentor**: Interactive voice and chat-based AI assistant for academic support powered by OpenAI
- **Classroom**: Access course materials, assignments, and collaborate with peers
- **Attendance**: Real-time attendance tracking and historical records
- **Schedule & Timetable**: Personalized class schedule and timetable management
- **Events**: Discover and book campus events
- **Food Ordering**: Browse canteen menu and place food orders with payment integration
- **Internships**: Curated internship opportunities and application tracking
- **Parking**: Reserve parking spots and manage parking information
- **Resources**: Access digital library and educational materials
- **Campus Map**: Interactive campus navigation

### Teacher Portal

Tools designed to enhance teaching efficiency and student engagement:

- **Dashboard**: Overview of classes, student progress, and administrative tasks
- **Classroom Management**: Upload course materials, manage assignments, and track student performance
- **Attendance**: Mark and manage student attendance
- **Timetable**: View and manage teaching schedules
- **Resource Distribution**: Share educational materials with students

### Canteen Management System

Streamline food service operations:

- **Menu Management**: Digital menu with item descriptions, pricing, and images
- **Order Processing**: Real-time order tracking and preparation status
- **Demand Forecasting**: AI-driven demand prediction for inventory planning
- **Stock Management**: Track inventory levels and receive low-stock alerts
- **Analytics**: Sales trends and popular items analysis

---

## 🔐 Security Features

- **Authentication**: Secure NextAuth.js implementation with JWT tokens
- **Authorization**: Role-based access control (RBAC) for students, teachers, and admins
- **Password Security**: bcryptjs for secure password hashing
- **Environment Variables**: Sensitive data stored securely using environment variables
- **HTTPS Ready**: Configured for secure production deployments
- **Data Validation**: Zod schema validation on all data inputs

---

## 🎨 UI/UX

- **Responsive Design**: Mobile-first approach ensuring compatibility across all devices
- **Accessibility**: WCAG compliant components from Radix UI
- **Dark Mode Support**: Built-in dark/light theme switching
- **Smooth Animations**: Framer Motion for polished user interactions
- **Modern Design System**: Consistent styling with Tailwind CSS utility classes
- **Interactive Components**: MagicUI components for enhanced visual appeal

---

## 🤖 AI & Advanced Features

### AI Mentor

- Real-time voice conversation for academic guidance
- Context-aware responses using OpenAI GPT models
- Chat history and personalized learning paths
- 24/7 availability for student support

### Smart Analytics

- Data visualization with Recharts
- Real-time dashboard metrics
- Predictive analytics for canteen demand
- Student performance insights for teachers

---

## 📊 Database Schema

The application uses MongoDB with Mongoose for data persistence:

- **User Models**: Students, Teachers, Admins with role-based properties
- **Course Models**: Courses, Classrooms, Materials
- **Order Models**: Food orders, order history, transaction records
- **Parking Models**: Parking slots, bookings, availability
- **Event Models**: Events, registrations, attendance
- **Transaction Models**: Payment records with Razorpay integration

---

## 🌐 Deployment

### Recommended Platforms

- **Vercel**: Optimal for Next.js applications
- **AWS**: For enterprise-scale deployments
- **Digital Ocean**: Cost-effective alternative
- **Railway**: Simple deployment with automatic CI/CD

### Deployment Checklist

- [ ] Set up production environment variables
- [ ] Configure MongoDB Atlas for production database
- [ ] Set up Razorpay production keys
- [ ] Configure OpenAI API for production
- [ ] Enable HTTPS and security headers
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test authentication flows
- [ ] Performance optimization and caching
- [ ] Setup CI/CD pipeline

---

## 🚧 Development Status

**Current Version**: 0.1.8 (Beta)

This is an active development project. Features are being continuously added and improved. Please report bugs and suggest features through the GitHub issues tab.

---

## 🤝 Contributing

We welcome contributions to improve ARC! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

---

## 📝 License

This project is private and proprietary. Unauthorized copying or distribution is prohibited.

---

## 📧 Support & Contact

For support, feature requests, or bug reports, please contact the development team or open an issue on GitHub.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility CSS framework
- [OpenAI](https://openai.com/) - AI capabilities
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built by the CODEKNIGHT team**
