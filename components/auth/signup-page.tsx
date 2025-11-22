'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { Activity, Shield, Heart, Clock, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side - Branding & Benefits */}
        <div className="text-center lg:text-left space-y-8">
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-white w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              MediAI Pro
            </h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Start Your Health Journey with AI-Powered Medical Guidance
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              Join thousands who trust MediAI Pro for instant medical guidance, symptom analysis,
              and smart appointment booking.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">What You'll Get:</h3>

            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900">Instant Symptom Analysis</h4>
                <p className="text-sm text-slate-600 mt-1">AI-powered evaluation of your symptoms with professional medical guidance</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900">Medical Report Analysis</h4>
                <p className="text-sm text-slate-600 mt-1">Upload and understand your medical reports and test results instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900">Smart Appointment Booking</h4>
                <p className="text-sm text-slate-600 mt-1">Intelligent scheduling with healthcare providers based on your needs</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900">24/7 Medical Support</h4>
                <p className="text-sm text-slate-600 mt-1">Round-the-clock access to medical guidance and health information</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-slate-900">Personalized Health Tracking</h4>
                <p className="text-sm text-slate-600 mt-1">Your conversation history and health insights saved securely</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Privacy & Security First</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                End-to-end encryption for all your medical conversations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                HIPAA-compliant data protection standards
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Your data is never shared with third parties
              </li>
            </ul>
          </div>

          <div className="bg-slate-100/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              <strong>⚠️ Medical Disclaimer:</strong> MediAI Pro provides guidance and is not a substitute for professional medical care.
              Always consult qualified healthcare providers for diagnosis and treatment. For emergencies, call emergency services.
            </p>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h3>
            <p className="text-slate-600">Join MediAI Pro and start your health journey</p>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "flex gap-2 items-center justify-center py-3 px-4 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors",
                formButtonPrimary: "w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-3 rounded-lg font-medium shadow-lg transition-all duration-200",
                formFieldInput: "w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-sm",
                dividerText: "text-slate-500 text-sm",
                identityPreviewText: "text-slate-700",
                identityPreviewCard: "bg-slate-50 border border-slate-200 rounded-lg",
                avatarPreview: "w-12 h-12",
                formFieldLabel: "text-slate-700 font-medium text-sm",
                formFieldLabelRow: "flex flex-col gap-1",
                otpCodeInputField: "w-12 h-12 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500",
              }
            }}
          />

          <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600 mb-1">50K+</div>
                <div className="text-xs text-slate-600">Active Users</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-600 mb-1">4.8★</div>
                <div className="text-xs text-slate-600">User Rating</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                No credit card required for basic features
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Cancel anytime, no questions asked
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Free access to essential medical guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}