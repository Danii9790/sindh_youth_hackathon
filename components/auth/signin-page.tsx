'use client';

import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { Activity, Shield, Heart, Clock } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side - Branding */}
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
              Your Personal Medical AI Assistant
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              Get instant medical guidance, symptom analysis, and appointment booking with advanced AI technology.
              Your health companion, available 24/7.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Shield className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Professional Care</h3>
              <p className="text-sm text-slate-600">AI-powered medical guidance backed by professional healthcare standards</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Heart className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-slate-600">Round-the-clock medical assistance whenever you need it</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Clock className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Quick Analysis</h3>
              <p className="text-sm text-slate-600">Fast symptom analysis and medical report interpretation</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Activity className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Smart Booking</h3>
              <p className="text-sm text-slate-600">Intelligent appointment scheduling with healthcare providers</p>
            </div>
          </div>

          <div className="bg-slate-100/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              <strong>⚠️ Important:</strong> MediAI Pro is an AI assistant and not a substitute for professional medical care.
              For medical emergencies, please call emergency services immediately.
            </p>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h3>
            <p className="text-slate-600">Sign in to access your medical AI assistant</p>
          </div>

          <SignIn
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
              }
            }}
          />

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Secure authentication with industry-leading encryption</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Your medical conversations are private and protected</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Access your chat history from any device</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}