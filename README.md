# 🏥 MediAI Pro - AI-Powered Healthcare Assistant

<div align="center">
  <h3>🤖 HEC Generative AI Training Hackathon Project</h3>
  <p><strong>A Revolutionary AI Triage System Built with OpenAI GPT-4o-mini</strong></p>
</div>

![Tech Stack](https://img.shields.io/badge/Tech-Next.js_Tailwind_Clerk-blue?style=for-the-badge)
![AI Model](https://img.shields.io/badge/AI-OpenAI_GPT--4o--mini-green?style=for-the-badge&logo=openai)

---

## 🌟 About This Project

**MediAI Pro** is an innovative AI-powered healthcare triage system developed for the **HEC Generative AI Training Hackathon** in collaboration with **Pak Angels**, **iCodeGuru**, **Aspire Pakistan**, **NCEAC**, and **ULEFUSA**.

This cutting-edge application leverages the power of **Generative AI** to transform healthcare accessibility in Pakistan, providing intelligent medical assistance through natural conversation and advanced image analysis.

### 🎯 Hackathon Vision

> *"This hands-on Hackathon is designed to spark innovation, strengthen problem-solving skills, and promote effective teamwork — all through the practical application of the powerful Generative AI skills you gained from the HEC Gen-AI Training."*

---

## 🚀 Key Features

### 🤖 Core AI Capabilities
- **🧠 Intelligent Symptom Analysis** - Advanced AI-powered medical assessment using GPT-4o-mini
- **📸 Medical Image Analysis** - Upload and analyze medical reports, scans, and images
- **🔥 Emergency Triage Detection** - Automatically identify critical medical conditions
- **💬 Natural Conversational Interface** - Chat with AI in Urdu, English, or mixed languages
- **📊 Smart Diagnosis Assistance** - Get preliminary assessments and specialist recommendations

### 👨‍⚕️ Healthcare Management
- **📅 Appointment Booking System** - Schedule appointments with verified doctors
- **🏥 Specialist Directory** - Find the right healthcare providers
- **📋 Digital Prescription Slips** - Generate PDF appointment confirmations
- **📈 Health Dashboard** - Track your medical history and appointments
- **🔔 Smart Reminders** - Never miss important health checkups

### 🔐 Enterprise-Grade Features
- **🛡️ Secure Authentication** - Built with Clerk for enterprise-level security
- **💾 Persistent Database** - Neon PostgreSQL for reliable data storage
- **🌐 Multi-language Support** - Designed for Pakistani users
- **📱 Responsive Design** - Works perfectly on all devices
- **🌙 Dark/Light Mode** - Comfortable viewing in any environment

---

## 🛠️ Technology Stack

### Frontend & UI
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - Modern React with hooks and concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon components

### AI & Machine Learning
- **[OpenAI GPT-4o-mini](https://openai.com/)** - Advanced language model for medical analysis
- **[OpenAI Vision API](https://openai.com/)** - Image analysis for medical reports
- **Custom AI Prompts** - Specialized for Pakistani healthcare context

### Backend & Database
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL
- **[Clerk Authentication](https://clerk.dev/)** - User management and security
- **Next.js API Routes** - Serverless backend
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation for appointment slips

### Development & Deployment
- **[Vercel](https://vercel.com/)** - Deployment platform
- **ESLint & Prettier** - Code quality tools
- **Git Version Control** - Professional development workflow

---

## 📁 Project Architecture

```
MediAI-Pro/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # API Routes
│   │   ├── 📂 ai/                   # AI-powered endpoints
│   │   │   ├── analyze-symptoms/    # Symptom analysis API
│   │   │   ├── analyze-image/       # Image analysis API
│   │   │   └── chat/               # Conversational AI
│   │   ├── 📂 appointments/         # Appointment management
│   │   └── 📂 admin/               # Admin dashboard APIs
│   ├── 📂 admin/                   # Admin interface
│   ├── 📂 dashboard/               # User dashboard
│   ├── 📂 sign-in/ & sign-up/      # Authentication pages
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── 📂 components/                  # React Components
│   ├── 📂 ui/                      # Reusable UI components
│   ├── MediAIApp.tsx              # Main application
│   ├── LandingPage.tsx            # Marketing page
│   ├── AdminDashboard.tsx         # Admin interface
│   ├── AppointmentSlip.tsx        # PDF generator
│   └── ConversationSidebar.tsx     # Chat history
├── 📂 services/                    # Business Logic
│   ├── openai_client.ts           # OpenAI integration
│   ├── appointmentApi.ts          # Appointment management
│   ├── conversationApiService.ts  # Chat handling
│   └── pdfService.ts              # PDF generation
├── 📂 database/                    # Database setup
├── 📂 types.ts                     # TypeScript definitions
├── 📂 next.config.js              # Next.js configuration
├── 📂 tailwind.config.js          # Tailwind configuration
├── 📂 tsconfig.json               # TypeScript configuration
└── 📂 package.json                # Dependencies and scripts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- OpenAI API key with GPT-4o-mini access
- Neon PostgreSQL account (free tier available)
- Clerk account for authentication

### Installation Steps

1. **🚀 Clone the Repository**
   ```bash
   git clone https://github.com/your-username/mediai-pro.git
   cd mediai-pro
   ```

2. **📦 Install Dependencies**
   ```bash
   npm install
   ```

3. **🔑 Environment Configuration**

   Create a `.env.local` file:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_REQUESTS_PER_MINUTE=15
   OPENAI_RATE_LIMIT_ENABLED=false

   # Database Configuration
   DATABASE_URL=your_neon_postgresql_url_here

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

4. **🗄️ Database Setup**
   ```bash
   npm run db:create
   ```

5. **🌐 Start Development Server**
   ```bash
   npm run dev
   ```

6. **🎉 Launch Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🌟 Production Deployment

### Deploy to Vercel (Recommended)

1. **🔗 Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **⚙️ Configure Environment Variables**
   In Vercel Dashboard > Settings > Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_neon_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```

3. **🚀 Deploy**
   ```bash
   vercel --prod
   ```

Your app will be live at `your-app.vercel.app`! 🎉

---

## 💡 Key Innovations & Features

### 🧠 Advanced AI Integration
- **Context-Aware Conversations**: Remembers patient history across sessions
- **Multilingual Support**: Seamlessly handles Urdu, English, and Roman Urdu
- **Medical Image Analysis**: Analyzes lab reports, X-rays, and medical documents
- **Emergency Detection**: Automatically identifies life-threatening conditions

### 🏥 Healthcare Specific Features
- **Pakistani Medical Context**: Trained on local healthcare practices
- **Specialist Recommendation System**: Matches symptoms with appropriate doctors
- **Appointment Triage**: Prioritizes appointments based on medical urgency
- **Digital Health Records**: Maintains patient consultation history

### 🔒 Enterprise Security
- **HIPAA-Compliant Architecture**: Designed with patient privacy in mind
- **Secure Authentication**: Enterprise-grade user management
- **Data Encryption**: All patient data is encrypted at rest and transit
- **Audit Logging**: Complete access tracking for compliance

---

## 🎯 Hackathon Impact & Goals

### 🇵🇰 Solving Pakistani Healthcare Challenges
- **Rural Healthcare Access**: Brings specialist consultation to remote areas
- **Reducing Wait Times**: AI triage helps prioritize urgent cases
- **Cost-Effective Healthcare**: Minimizes unnecessary hospital visits
- **Healthcare Literacy**: Educates patients about their conditions

### 📊 Expected Outcomes
- **24/7 Medical Assistance**: Round-the-clock AI healthcare support
- **Faster Diagnosis**: Quick preliminary assessments
- **Better Resource Allocation**: Efficient use of medical facilities
- **Improved Patient Outcomes**: Early detection and intervention

---

## 🤝 Development Team

### 👨‍💻 Lead Developer
**Muhammad Daniyal** - *Full-Stack Developer & AI Engineer*
- 📧 Email: 24ds34@quest.edu.pk
- 🐙 GitHub: [@daniyalxdev](https://github.com/Danii9790)
- 💼 LinkedIn: [Muhammad Daniyal](https://www.linkedin.com/in/daniyalxdev)

### 🏆 Hackathon Organizers
- **🇵🇰 HEC Pakistan** - Higher Education Commission
- **🚀 Pak Angels** - Hackathon Organization
- **💻 iCodeGuru** - Technical Leadership
- **🌟 Aspire Pakistan** - Program Management
- **📚 NCEAC** - Accreditation & Standards
- **🤝 ULEFUSA** - International Collaboration

---

## 📸 Project Screenshots & Demos

### Main Features
1. **💬 AI Chat Interface** - Natural conversation with medical AI
2. **📸 Image Upload** - Medical report analysis
3. **📅 Appointment Booking** - Doctor appointment system
4. **👤 User Dashboard** - Personal health tracking
5. **🛡️ Admin Panel** - Complete administrative control

### UI/UX Highlights
- **Modern Clean Design** - Intuitive and accessible interface
- **Dark Mode Support** - Comfortable for all lighting conditions
- **Mobile Responsive** - Works on smartphones and tablets
- **Accessibility Compliant** - WCAG 2.1 AA standards

---

## 🔧 API Documentation

### Core Endpoints

#### AI Analysis APIs
- `POST /api/ai/analyze-symptoms` - Symptom analysis
- `POST /api/ai/analyze-image` - Medical image analysis
- `POST /api/ai/chat` - Conversational AI

#### Appointment Management
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/[id]` - Update appointment

#### Admin APIs
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/appointments` - All appointments

---

## 🧪 Testing & Quality Assurance

### Code Quality
- **TypeScript Strict Mode** - Type safety throughout
- **ESLint Configuration** - Consistent code style
- **Prettier Formatting** - Automated code formatting
- **Husky Git Hooks** - Pre-commit quality checks

### Testing Strategy
- **Unit Tests** - Component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Testing** - Complete user flows
- **Performance Testing** - Load and stress testing

---

## 📈 Future Enhancements

### Phase 2 Features
- **📱 Mobile Applications** - React Native apps
- **🔗 Hospital Integrations** - Connect with real hospitals
- **💳 Payment Processing** - Online consultation fees
- **👨‍⚕️ Doctor Portal** - Dedicated interface for doctors
- **📊 Analytics Dashboard** - Advanced health insights

### Advanced AI Features
- **🎯 Voice Recognition** - Hands-free interaction
- **🧬 Genetic Analysis** - DNA report interpretation
- **🩺 Wearable Integration** - Apple Watch & Fitbit sync
- **🌐 Telemedicine** - Video consultation platform

---

## 📞 Contact & Support

### For Hackathon Participants
- **📧 Technical Support**: [hecsupport@pakangels.com](mailto:hecsupport@pakangels.com)
- **💬 Discord Community**: [Join our Discord](https://discord.gg/pakangels)
- **📱 WhatsApp Group**: +92 3XX XXXXXXX

### Project Collaboration
- **🔗 GitHub Repository**: [MediAI Pro](https://github.com/Danii9790/sindh_youth_hackathon/)
- **🌐 Live Demo**: [medi.ail.app](https://www.doctoragent.systems/)
- **📋 Project Issues**: [GitHub Issues](https://github.com/Danii9790/sindh_youth_hackathon)

---

## 📄 License & Disclaimer

### 📜 License
This project is open-source and available under the [MIT License](LICENSE).

### ⚠️ Medical Disclaimer
**MediAI Pro is an AI assistant designed for preliminary medical guidance and should not replace professional medical consultation.**

- Always consult with qualified healthcare professionals for medical diagnosis and treatment
- Emergency situations require immediate medical attention
- The AI provides suggestions, not definitive medical advice
- User privacy and data security are our top priorities

---

## 🙏 Acknowledgments & Gratitude

### 🏆 Hackathon Leadership
- **HEC Pakistan** - For organizing this transformative GenAI training program
- **Pak Angels** - For excellent hackathon organization and mentorship
- **iCodeGuru** - For providing outstanding technical leadership and guidance
- **Aspire Pakistan** - For program management and support
- **NCEAC** - For ensuring quality standards and accreditation
- **ULEFUSA** - For international collaboration and opportunities

### 🤝 Technical Contributors
- **OpenAI Team** - For the amazing GPT-4o-mini model
- **Vercel Team** - For excellent deployment platform
- **Clerk Team** - For authentication solutions
- **Neon Team** - For modern database services
- **Next.js Team** - For the incredible React framework

### 👨‍🏫 Mentors & Guides
- Special thanks to all the mentors who guided us through the Generative AI training
- Healthcare professionals who provided valuable domain expertise
- Fellow hackathon participants for their support and collaboration

---

<div align="center">
  <h3>🎉 Made with ❤️ for HEC Generative AI Training Hackathon 2025</h3>
  <p><strong>Empowering Pakistani Healthcare Through AI Innovation</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Pakistan-🇵🇰-green?style=for-the-badge" alt="Pakistan Flag"/>
    <img src="https://img.shields.io/badge/Innovation-💡-blue?style=for-the-badge" alt="Innovation"/>
    <img src="https://img.shields.io/badge/Healthcare-🏥-red?style=for-the-badge" alt="Healthcare"/>
    <img src="https://img.shields.io/badge/AI-🤖-purple?style=for-the-badge" alt="AI"/>
  </div>
</div>

---

*"The best way to predict the future is to create it."* - Peter Drucker

**Let's create a healthier Pakistan together! 🇵🇰🏥**
