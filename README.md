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
- **AI/ML**: OpenAI GPT-4o-mini for intelligent analysis
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
- OpenAI API key

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
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
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

### Deploy to Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com?utm_source=github&utm_medium=github&utm_campaign=deploy-once-deploy-everywhere).

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**

   ```bash
   vercel
   ```

   Follow the prompts to link your project to Vercel. Make sure to set your environment variables in the Vercel dashboard:

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEON_POSTGRES_URL`: Your PostgreSQL database URL (if using)

3. **Environment Variables**

   Add these in your Vercel project settings under Environment Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEON_POSTGRES_URL=your_postgres_database_url_here
   ```

Your app will be automatically deployed and available at a `.vercel.app` URL.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=your_postgres_database_url_here  # Optional: for full functionality
```

## 📁 Project Structure

```
sindh_youth_hackathon/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   └── AppointmentSlip.tsx # Appointment PDF generator
├── services/              # Backend services
│   └── openai_model.ts   # AI service integration
├── types.ts               # TypeScript type definitions
├── next.config.js         # Next.js configuration
├── vercel.json            # Vercel deployment configuration
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
- **OpenAI GPT-4o-mini** - For AI capabilities
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
