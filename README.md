# MediAI Pro - Sindh Youth Hackathon Project

<div align="center">
  <h3>🏥 AI-Powered Hospital Triage System</h3>
  <p>A specialized healthcare assistant for symptom analysis, diagnosis assistance, and appointment scheduling</p>
</div>

## 🌟 Project Overview

MediAI Pro is an innovative AI-driven hospital triage system designed to revolutionize healthcare accessibility in Sindh. This intelligent assistant helps patients:

- 🔍 **Symptom Analysis**: Get AI-powered assessment of medical symptoms
- 📸 **Image-Based Diagnosis**: Upload medical images for preliminary analysis
- 📅 **Smart Appointment Scheduling**: Book appointments with appropriate specialists
- 🚨 **Emergency Triage**: Determine urgency levels and recommend immediate actions
- 👨‍⚕️ **Doctor Directory**: Find and connect with qualified healthcare providers

## 🏆 Sindh Youth Hackathon 2024

This project was developed for the Sindh Youth Hackathon with the goal of improving healthcare accessibility and efficiency through innovative AI technology.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 with React 19
- **AI/ML**: Google Gemini API for intelligent analysis
- **UI/UX**: Tailwind CSS with Lucide React icons
- **Database**: PostgreSQL with Neon Serverless
- **Language**: TypeScript for type safety
- **PDF Generation**: jsPDF for appointment slips

## 🚀 Features

### Core Functionality

1. **Interactive Chat Interface**: Natural conversation with AI assistant
2. **Medical Image Upload**: Support for medical images and scans
3. **Symptom Checker**: Detailed analysis of reported symptoms
4. **Emergency Detection**: Automatic identification of urgent cases
5. **Appointment Management**: Complete booking and scheduling system

### Smart Analysis

- Condition identification based on symptoms
- Urgency level classification (Low, Moderate, High, Emergency)
- Specialist recommendations
- Treatment suggestions and next steps

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Google Gemini API key

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sindh_youth_hackathon
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Environment setup**

   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
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

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgres_database_url_here  # Optional: for full functionality
```

## 📁 Project Structure

```
sindh_youth_hackathon/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── MediAIApp.tsx      # Main application component
│   └── AppointmentSlip.tsx # Appointment PDF generator
├── services/              # Backend services
│   └── geminiService.ts   # AI service integration
├── types.ts               # TypeScript type definitions
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🎯 Usage

### For Patients

1. Open the application and start chatting with the AI assistant
2. Describe your symptoms in detail
3. Upload any relevant medical images (optional)
4. Receive AI analysis and recommendations
5. Book appointments with recommended specialists
6. Download appointment confirmation slips

### Key Benefits

- **24/7 Availability**: Get medical assistance anytime, anywhere
- **Quick Triage**: Fast assessment of symptom urgency
- **Cost Effective**: Reduce unnecessary hospital visits
- **Specialist Matching**: Find the right doctor for your condition
- **Emergency Support**: Immediate guidance for critical situations

## 🤝 Contributing

This project is part of the Sindh Youth Hackathon. Contributions are welcome!

### Development Guidelines

- Follow TypeScript best practices
- Maintain clean, commented code
- Test all new features
- Ensure responsive design for all devices

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Sindh Youth Hackathon 2025** - Organizers and mentors
- **Google Gemini API** - For AI capabilities
- **Next.js Team** - For the excellent framework
- **Healthcare Professionals** - For domain expertise and validation

## 📞 Contact

For questions about this project or collaboration opportunities:

- **Hackathon Team**: Muhammad Daniyal
- **Project Repository**: [GitHub Link]
- **Email**: [24ds34@quest.edu.pk]

---

<div align="center">
  <p>Made with ❤️ for the Sindh Youth Hackathon 2025</p>
  <p>Empowering healthcare through AI innovation</p>
</div>
