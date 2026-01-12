# Worlds AI Bot - Frontend

React-based Learning Management System with AI-powered features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd worlds_ai_bot_frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## 📱 Application Routes

### 🌐 Public Pages

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with courses, bootcamps, features |
| `/all-courses` | All Courses | Browse all available courses |
| `/course/:id` | Course Detail | View course details |
| `/bootcamp/:id` | Bootcamp Detail | View bootcamp details |
| `/all-recordings/:id` | Recordings | View course recordings |
| `/recording/:id` | Recording Player | Play course recording |
| `/jobs` | Jobs | Browse job listings |
| `/jobs/:id` | Job Detail | View job details |
| `/roadmap/:id` | Roadmap | View learning roadmap |
| `/privacy-policy` | Privacy Policy | Terms and privacy |
| `/contact` | Contact Us | Contact form |
| `/free-class` | Free Class Registration | Register for free class |
| `/thanks` | Thank You | Post-registration thank you |

### 🔐 Authentication

| URL | Page | Description |
|-----|------|-------------|
| `/signin` | Sign In | User login |
| `/signup` | Sign Up | User registration |
| `/reset-password` | Reset Password | Password reset with token |

### 👤 Student Dashboard (`/student-dashboard/...`)

| URL | Page | Description |
|-----|------|-------------|
| `/student-dashboard` | Dashboard | Student dashboard home |
| `/student-dashboard/profile` | Profile | View/edit profile |
| `/student-dashboard/profile/resume` | Resume Builder | AI-powered resume builder |
| `/student-dashboard/profile/interview-preparation` | AI Interview | AI mock interviews |
| `/student-dashboard/profile/editor` | Code Editor | Practice coding problems |
| `/student-dashboard/profile/awards` | Awards | View certificates |
| `/student-dashboard/profile/my-recordings` | My Recordings | Enrolled course recordings |

### ⚙️ Admin Dashboard (`/admin-dashboard/...`)

| URL | Page | Description |
|-----|------|-------------|
| `/admin-dashboard` | Admin Home | Admin dashboard home |
| `/admin-dashboard/profile` | Admin Profile | Admin profile settings |

#### Course Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-cc` | Create Course |
| `/admin-dashboard/profile/all-courses` | All Courses |
| `/admin-dashboard/profile/update-cc/:id` | Update Course |

#### Recording Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-pc` | Create Recording |
| `/admin-dashboard/profile/all-pc` | All Recordings |
| `/admin-dashboard/profile/update-pc/:id` | Update Recording |

#### Bootcamp Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-bootcamp` | Create Bootcamp |
| `/admin-dashboard/profile/all-bootcamps` | All Bootcamps |
| `/admin-dashboard/profile/update-bootcamp/:id` | Update Bootcamp |

#### Roadmap Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-road-map` | Create Roadmap |
| `/admin-dashboard/profile/all-road-maps` | All Roadmaps |
| `/admin-dashboard/profile/update-road-map/:id` | Update Roadmap |

#### Roadmap Topics
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-road-map-topics` | Create Topic |
| `/admin-dashboard/profile/all-road-map-topics` | All Topics |
| `/admin-dashboard/profile/update-road-map-topics/:id` | Update Topic |

#### Job Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-job` | Create Job |
| `/admin-dashboard/profile/all-jobs` | All Jobs |
| `/admin-dashboard/profile/update-job/:id` | Update Job |

#### Interview Questions
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-data` | Create Interview Topic |
| `/admin-dashboard/profile/all-data` | All Interview Topics |
| `/admin-dashboard/profile/update-data/:id` | Update Interview Topic |

#### Coding Tests
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-invoice` | Create Coding Test |
| `/admin-dashboard/profile/all-invoices` | All Coding Tests |
| `/admin-dashboard/profile/update-invoice/:id` | Update Coding Test |

#### Success Videos
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-video` | Create Video |
| `/admin-dashboard/profile/all-videos` | All Videos |
| `/admin-dashboard/profile/update-video/:id` | Update Video |

#### Company Logos
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-company-logo` | Create Logo |
| `/admin-dashboard/profile/all-company-logos` | All Logos |
| `/admin-dashboard/profile/update-company/:id` | Update Logo |

#### Content Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/create-contact` | Create Contact Info |
| `/admin-dashboard/profile/all-contact` | All Contact Info |
| `/admin-dashboard/profile/update-contact/:id` | Update Contact Info |
| `/admin-dashboard/profile/create-privacy` | Create Privacy Policy |
| `/admin-dashboard/profile/all-privacy` | All Privacy Policies |
| `/admin-dashboard/profile/update-privacy/:id` | Update Privacy Policy |

#### User Management
| URL | Page |
|-----|------|
| `/admin-dashboard/profile/all-profiles` | All Users |
| `/admin-dashboard/profile/update-profile/:id` | Update User |
| `/admin-dashboard/profile/all-registers` | All Registrations |
| `/admin-dashboard/profile/all-feedbacks` | User Feedbacks |

---

## 🎨 Features

- ✅ **AI-Powered Interview Prep** - Practice with Gemini AI
- ✅ **Resume Builder** - Multiple premium templates
- ✅ **Code Editor** - Monaco editor with test cases
- ✅ **Course Management** - Complete LMS features
- ✅ **Payment Integration** - Razorpay gateway
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark Theme** - Modern glassmorphism UI

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📁 Project Structure

```
worlds_ai_bot_frontend/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components
│   ├── pages/
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── student/       # Student dashboard pages
│   │   └── authentication/# Auth pages
│   ├── services/          # API service
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── config/
│   └── constant.js        # Environment config
├── index.html
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API URL | Yes |
| `VITE_RAZORPAY_KEY` | Razorpay public key | Yes |

---

## 📝 License

MIT License - See LICENSE file for details.
