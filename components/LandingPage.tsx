'use client';

import React from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import {
  Activity,
  Shield,
  Heart,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Stethoscope,
  FileImage,
  Calendar,
  Users,
  Brain,
  Lock,
  Zap,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export const LandingPage: React.FC = () => {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <SignedIn>
        <RedirectToSignIn />
      </SignedIn>

      <SignedOut>
        {/* Navigation Header */}
        <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                MediAI Pro
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <button className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all shadow-lg">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Trusted by 50,000+ users worldwide
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Medical AI Assistant
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get instant medical guidance, symptom analysis, and appointment booking with advanced AI technology.
              Your health companion, available 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/sign-up">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-emerald-700 transition-all shadow-xl flex items-center justify-center gap-2">
                  Start Free Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">50K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">4.8★</div>
                <div className="text-sm text-slate-600">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
                <div className="text-sm text-slate-600">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">99%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Advanced AI-Powered Medical Features
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Experience the future of healthcare with our cutting-edge AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Symptom Analysis</h3>
                <p className="text-slate-600 mb-4">
                  Get instant AI-powered evaluation of your symptoms with professional medical guidance and recommendations.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Comprehensive symptom assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Personalized recommendations
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <FileImage className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Medical Report Analysis</h3>
                <p className="text-slate-600 mb-4">
                  Upload medical reports, lab results, or images of symptoms for instant AI interpretation and explanation.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Multiple file formats supported
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Clear, understandable explanations
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Appointment Booking</h3>
                <p className="text-slate-600 mb-4">
                  Intelligently schedule appointments with healthcare providers based on your medical needs and preferences.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Automated doctor matching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Real-time availability
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">24/7 Medical Support</h3>
                <p className="text-slate-600 mb-4">
                  Round-the-clock access to medical guidance and health information whenever you need it.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Instant response times
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Continuous learning AI
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Privacy & Security</h3>
                <p className="text-slate-600 mb-4">
                  Your medical data is protected with enterprise-grade encryption and HIPAA-compliant security standards.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    HIPAA compliant
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Personalized Care</h3>
                <p className="text-slate-600 mb-4">
                  AI learns from your health history to provide increasingly personalized and accurate medical guidance.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Health history tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Contextual recommendations
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-20 bg-gradient-to-br from-blue-50 to-emerald-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                How MediAI Pro Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Get started in minutes with our simple, intuitive process
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Sign Up</h3>
                <p className="text-slate-600 text-sm">
                  Create your free account in seconds with secure authentication
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Describe Symptoms</h3>
                <p className="text-slate-600 text-sm">
                  Tell us about your health concerns or upload medical reports
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Get AI Analysis</h3>
                <p className="text-slate-600 text-sm">
                  Receive instant, professional medical guidance and recommendations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Book Appointment</h3>
                <p className="text-slate-600 text-sm">
                  Schedule appointments with healthcare providers if needed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Trusted by Patients and Healthcare Providers
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Join thousands who rely on MediAI Pro for their healthcare needs
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                  <div className="text-slate-600">User Satisfaction</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">1M+</div>
                  <div className="text-slate-600">Consultations</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
                  <div className="text-slate-600">Specialists Available</div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <p className="text-sm text-slate-700">
                  <strong>⚠️ Important Medical Disclaimer:</strong> MediAI Pro is an AI assistant designed to provide medical guidance and is not a substitute for professional medical care.
                  Always consult qualified healthcare providers for diagnosis and treatment. For medical emergencies, please call emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience the Future of Healthcare?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your free consultation today and join thousands who trust MediAI Pro for their health needs.
            </p>
            <Link href="/sign-up">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="text-blue-100 mt-4 text-sm">
              No credit card required • Free basic features • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">MediAI Pro</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Your trusted AI medical assistant for health guidance and care coordination.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>Symptom Analysis</li>
                  <li>Medical Reports</li>
                  <li>Appointment Booking</li>
                  <li>24/7 Support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>About Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>Help Center</li>
                  <li>FAQs</li>
                  <li>Medical Disclaimer</li>
                  <li>Emergency Info</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
              <p>&copy; 2024 MediAI Pro. All rights reserved. | Not a substitute for professional medical care.</p>
            </div>
          </div>
        </footer>
      </SignedOut>
    </div>
  );
};