'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Activity,
  User,
  Stethoscope,
  Loader2,
  LogOut,
  Menu,
  Download,
  Calendar
} from 'lucide-react';
import { Message, Sender, Doctor, Conversation, DatabaseAppointment } from '@/types';

import { analyzeSymptoms, analyzeImage, chatWithMediAI } from '@/services/geminiClientService';
import { AppointmentSlip } from './AppointmentSlip';
import { ConversationSidebar } from './ConversationSidebar';
import { ThemeToggle } from './ThemeToggle';
import { ConversationApiService } from '@/services/conversationApiService';
import { saveAppointment, checkAppointmentAvailability, validateAppointmentDateTime, getUserAppointments } from '@/services/appointmentApi';
import { PDFService } from '@/services/pdfService';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// --- Mock Data ---
const DOCTORS: Doctor[] = [
  { id: "dr_sarah", name: "Dr. Sarah Khan", specialty: "Dermatologist", location: "Clifton, Floor 2", image: "https://picsum.photos/id/64/200/200" },
  { id: "dr_ahmed", name: "Dr. Ahmed Raza", specialty: "Cardiologist", location: "DHA Phase 6, Wing A", image: "https://picsum.photos/id/91/200/200" },
  { id: "dr_fatima", name: "Dr. Fatima Ali", specialty: "Neurologist", location: "Gulshan, Room 401", image: "https://picsum.photos/id/237/200/200" },
];

export const MediAIApp: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Conversation management state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Appointment state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<DatabaseAppointment | null>(null);
  const [userAppointments, setUserAppointments] = useState<DatabaseAppointment[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // UI state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    doctor: DOCTORS[0].id,
    department: 'general',
    date: '',
    time: '',
    symptoms: '',
    address: '',
    reason: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  // Check time slot availability when date changes
  useEffect(() => {
    if (bookingForm.date) {
      checkTimeSlotAvailability(bookingForm.date);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [bookingForm.date]);

  // Function to check available time slots for a given date
  const checkTimeSlotAvailability = async (date: string) => {
    setIsCheckingAvailability(true);
    const allTimeSlots = [
      "10:00AM", "10:30AM", "11:00AM", "11:30AM", "12:00PM", "12:30PM",
      "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM",
      "4:00PM", "4:30PM", "5:00PM", "5:30PM", "6:00PM", "6:30PM",
      "7:00PM", "7:30PM", "8:00PM", "8:30PM", "9:00PM"
    ];

    try {
      const availableSlots = [...allTimeSlots];

      // For demo purposes, mark some slots as unavailable
      // In real implementation, this would check the database
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
        setAvailableTimeSlots([]);
        return;
      }

      // Simulate some slots being taken (random for demo)
      const unavailableSlots = allTimeSlots.filter(() => Math.random() < 0.2);

      setAvailableTimeSlots(availableSlots.filter(slot => !unavailableSlots.includes(slot)));
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableTimeSlots(allTimeSlots);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserConversations();
      loadUserAppointments();
    }
  }, [user]);

  // Load conversations for the user
  const loadUserConversations = async () => {
    try {
      setIsConversationsLoading(true);
      const userConversations = await ConversationApiService.getConversations(user!.id);
      setConversations(userConversations);

      // If there are conversations, load the most recent one
      if (userConversations.length > 0) {
        const mostRecent = userConversations[0];
        setCurrentConversationId(mostRecent.id);
        loadConversationMessages(mostRecent.id);
      } else {
        // Create initial welcome message for new users
        setMessages([{
          id: 'welcome',
          text: "Hello! Welcome to MediAI Pro. 👋\n\nI can help you with:\n🩺 Analyze symptoms and health concerns\n📋 Review medical reports and images\n📅 Book appointments with available doctors\n\nHow are you feeling today? Or click the 📅 button to book an appointment!",
          sender: Sender.BOT,
          timestamp: new Date(),
          conversationId: 'new'
        }]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsConversationsLoading(false);
    }
  };

  // Load messages for a specific conversation
  const loadConversationMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await ConversationApiService.getConversationMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
    }
  };

  // Load user appointments
  const loadUserAppointments = async () => {
    try {
      const appointments = await getUserAppointments();
      setUserAppointments(appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/' });
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Conversation management functions
  const handleNewConversation = useCallback(async () => {
    try {
      // Create a new conversation with a welcome message
      const welcomeMessage = "Hello! Welcome to MediAI Pro. 👋\n\nI can help you with:\n🩺 Analyze symptoms and health concerns\n📋 Review medical reports and images\n📅 Book appointments with available doctors\n\nHow are you feeling today? Or click the 📅 button to book an appointment!";
      const newConversation = await ConversationApiService.createConversation(user!.id, welcomeMessage);

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([{
        id: 'welcome',
        text: welcomeMessage,
        sender: Sender.BOT,
        timestamp: new Date(),
        conversationId: newConversation.id
      }]);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  }, [user]);

  const handleSelectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadConversationMessages(conversationId);
  }, []);

  const handleRenameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    try {
      await ConversationApiService.updateConversationTitle(conversationId, newTitle);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, title: newTitle, updatedAt: new Date() } : conv
        )
      );
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  }, []);

  const handleArchiveConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      const newArchiveState = !conversation?.isArchived;

      await ConversationApiService.archiveConversation(conversationId, newArchiveState);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, isArchived: newArchiveState } : conv
        )
      );

      // If we archived the current conversation, switch to another one
      if (conversationId === currentConversationId && newArchiveState) {
        const activeConversations = conversations.filter(c => !c.isArchived && c.id !== conversationId);
        if (activeConversations.length > 0) {
          await handleSelectConversation(activeConversations[0].id);
        } else {
          await handleNewConversation();
        }
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }, [conversations, currentConversationId, handleSelectConversation, handleNewConversation]);

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    try {
      await ConversationApiService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // If we deleted the current conversation, switch to another one
      if (conversationId === currentConversationId) {
        const activeConversations = conversations.filter(c => !c.isArchived && c.id !== conversationId);
        if (activeConversations.length > 0) {
          await handleSelectConversation(activeConversations[0].id);
        } else {
          await handleNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [conversations, currentConversationId, handleSelectConversation, handleNewConversation]);

  const downloadConversation = useCallback(async () => {
    if (!currentConversationId || messages.length === 0) return;

    try {
      const conversation = conversations.find(c => c.id === currentConversationId);
      const pdfBlob = await PDFService.generateConversationPDF(
        currentConversationId,
        messages,
        conversation?.title || 'Conversation'
      );
      PDFService.downloadPDF(pdfBlob, `MediAI_Conversation_${currentConversationId}.pdf`);
    } catch (error) {
      console.error('Error downloading conversation:', error);
      alert('Failed to download conversation. Please try again.');
    }
  }, [currentConversationId, messages, conversations]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isAnalyzing) return;

    let conversationId = currentConversationId;

    // If there's no current conversation, create one
    if (!conversationId) {
      const newConversation = await ConversationApiService.createConversation(user!.id, input || "New conversation");
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      conversationId = newConversation.id;
    }

    // Save user message to database and add to UI
    const currentFile = selectedFile; // Capture file for async
    const currentInput = input;
    let userMessage: Message;

    if (currentFile) {
      userMessage = await ConversationApiService.createMessage(
        conversationId!,
        input || "Image analysis",
        Sender.USER,
        currentFile.name,
        currentFile.type,
        currentFile.size
      );
    } else {
      userMessage = await ConversationApiService.createMessage(
        conversationId!,
        input,
        Sender.USER
      );
    }

    // add user message immediately to UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    clearFile();
    setIsAnalyzing(true);

    // Refresh conversations list to get updated counts and timestamps
    try {
      const updatedConversations = await ConversationApiService.getConversations(user!.id);
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }

    // --- Logic Router ---
    try {

      let responseText = '';

      // 1. Image Analysis (Highest Priority)
      if (currentFile) {
        const analyzeImageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              if (reader.result) {
                const base64String = reader.result as string;
                const analysisResult = await analyzeImage(base64String, currentInput || "Analyze this image.");
                resolve(analysisResult);
              } else {
                reject(new Error("Failed to read image file"));
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(currentFile);
        });
        responseText = analyzeImageData;
        await addBotMessage(responseText, conversationId);
      }
      // 2. Symptom Analysis (Keywords)
      else if (isSymptomRelated(currentInput)) {
        responseText = await analyzeSymptoms(currentInput);
        await addBotMessage(responseText, conversationId);
      }
      // 3. General Chat
      else {
        const history = messages.map(m => ({ role: m.sender === Sender.USER ? 'user' : 'model', content: m.text }));
        responseText = await chatWithMediAI(history, currentInput);
        await addBotMessage(responseText, conversationId);
      }

    } catch (error) {
      console.error("Error in message processing:", error);

      let errorMessage = "I'm having technical difficulties right now. Please try again in a moment.";

      // Check for specific error types and provide helpful messages
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = "I'm currently experiencing high demand and have reached my usage limit. Please try again in a few hours, or consult with a healthcare professional for immediate concerns.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "I'm having trouble connecting to my services. Please check your internet connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "The request is taking too long. Please try again with a shorter message.";
        }
      }

      await addBotMessage(errorMessage, conversationId);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addBotMessage = async (text: string, conversationId?: string) => {
    const targetConversationId = conversationId || currentConversationId;

    if (targetConversationId) {
      try {
        // Save bot message to database
        const botMessage = await ConversationApiService.createMessage(
          targetConversationId,
          text,
          Sender.BOT
        );

        // Add to UI
        setMessages(prev => [...prev, botMessage]);

        // Refresh conversations list to get updated counts
        if (user) {
          const updatedConversations = await ConversationApiService.getConversations(user.id);
          setConversations(updatedConversations);
        }
      } catch (error) {
        console.error('Error saving bot message to database:', error);
        // Fallback: add to UI only
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: text,
          sender: Sender.BOT,
          timestamp: new Date(),
          conversationId: targetConversationId
        }]);
      }
    }

    setIsAnalyzing(false);
  };

  const isSymptomRelated = (text: string) => {
    const keywords = ['pain', 'hurt', 'fever', 'rash', 'sick', 'vomit', 'headache', 'cough', 'blood', 'swollen', 'dizzy'];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);

    try {
      // Get selected doctor info from our mock data
      const doctor = DOCTORS.find(d => d.id === bookingForm.doctor);

      if (!doctor) {
        await addBotMessage("❌ Error: Doctor not found. Please select a valid doctor.");
        setIsSubmittingBooking(false);
        return;
      }

      // Validate appointment date and time first
      const validationResult = await validateAppointmentDateTime(bookingForm.date, bookingForm.time);
      if (!validationResult.valid) {
        await addBotMessage(`❌ ${validationResult.message}`);
        setIsSubmittingBooking(false);
        return;
      }

      // Check if the time slot is available
      const availabilityResult = await checkAppointmentAvailability(bookingForm.date, bookingForm.time);
      if (!availabilityResult.available) {
        await addBotMessage(`❌ ${availabilityResult.message}`);
        setIsSubmittingBooking(false);
        return;
      }

      // Create appointment data matching the dbService interface
      const appointmentData = {
        patientName: bookingForm.name || `${user!.firstName || ''} ${user!.lastName || ''}`.trim() || 'User',
        phone: bookingForm.phone || user!.phoneNumbers?.[0]?.phoneNumber || '',
        doctor: {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          location: doctor.location,
          image: doctor.image
        },
        date: bookingForm.date,
        time: bookingForm.time,
        symptoms: bookingForm.symptoms || bookingForm.reason || 'General consultation'
      };

      // Book the appointment using the real database service
      const result = await saveAppointment(appointmentData);

      if (!result.success) {
        await addBotMessage(`❌ Booking failed: ${result.message}`);
        setIsSubmittingBooking(false);
        return;
      }

      const newAppointment = {
        id: result.appointmentId,
        userId: user!.id,
        fullName: appointmentData.patientName,
        email: bookingForm.email || user!.primaryEmailAddress?.emailAddress || '',
        phone: appointmentData.phone,
        department: bookingForm.department,
        doctor: doctor.name,
        date: appointmentData.date,
        time: appointmentData.time,
        symptoms: appointmentData.symptoms,
        address: bookingForm.address,
        reason: bookingForm.reason || 'General consultation',
        status: 'scheduled' as const,
        createdAt: new Date().toISOString()
      };

      setConfirmedAppointment(newAppointment);
      setIsBookingOpen(false);

      // Refresh user appointments
      await loadUserAppointments();

      await addBotMessage(`✅ Appointment booked successfully!\n\n📋 **Appointment Details:**\n• **Doctor:** Dr. ${doctor.name} (${doctor.specialty})\n• **Department:** ${bookingForm.department.charAt(0).toUpperCase() + bookingForm.department.slice(1)}\n• **Date:** ${new Date(bookingForm.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n• **Time:** ${bookingForm.time}\n• **Symptoms:** ${bookingForm.symptoms}\n• **Address:** ${bookingForm.address}\n• **Status:** ${newAppointment.status}\n\nA confirmation slip has been generated for you to download. You'll receive a reminder 24 hours before your appointment.`);

    } catch (error) {
      console.error("Booking error:", error);

      let errorMessage = "I encountered an error while booking your appointment. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "I'm having trouble connecting to the booking system. Please check your internet connection and try again.";
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = "Please make sure you're logged in to book appointments. You can still use all other features without logging in.";
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = "The appointment system is experiencing high demand. Please try again in a few minutes.";
        } else if (error.message.includes('validation')) {
          errorMessage = "Please check your appointment details and try again. Make sure all required fields are filled correctly.";
        }
      }

      await addBotMessage(`❌ ${errorMessage}\n\n💡 If you continue to have issues, please try refreshing the page or contact support.`);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* --- Conversation Sidebar --- */}
      {isSidebarOpen && (
        <div className="hidden md:flex flex-col w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 fixed left-0 top-0 h-full z-40">
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId || undefined}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onArchiveConversation={handleArchiveConversation}
            onRenameConversation={handleRenameConversation}
            isLoading={isConversationsLoading}
          />
        </div>
      )}

      {/* --- Mobile Sidebar Toggle --- */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* --- Main Content Area --- */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        {/* --- Header --- */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <h1 className="font-bold text-xl text-slate-800 dark:text-slate-200 tracking-tight">MediAI Pro</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Conversation Button */}
            {messages.length > 0 && (
              <button
                onClick={downloadConversation}
                className="hidden sm:flex p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Download conversation"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-slate-600 dark:text-slate-400" />
                  )}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.firstName || 'User'} {user?.lastName || ''}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>

                  {userAppointments.length > 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      {userAppointments.filter(a => a.status === 'scheduled').length} upcoming appointments
                    </div>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="w-80 h-full bg-white dark:bg-slate-900 fixed left-0 top-0" onClick={(e) => e.stopPropagation()}>
              <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversationId || undefined}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
                onArchiveConversation={handleArchiveConversation}
                onRenameConversation={handleRenameConversation}
                isLoading={isConversationsLoading}
              />
            </div>
          </div>
        )}

        {/* --- Main Chat Area --- */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === Sender.USER ? 'bg-slate-200' : 'bg-blue-100'}`}>
                  {msg.sender === Sender.USER ? <User className="w-5 h-5 text-slate-600" /> : <Stethoscope className="w-5 h-5 text-blue-600" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-2`}>
                  <div className={`p-4 rounded-2xl shadow-sm ${ 
                    msg.sender === Sender.USER 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.attachment && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                        <img src={msg.attachment} alt="User attachment" className="max-w-full h-auto max-h-60 object-cover" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  <span className={`text-xs text-slate-400 ${msg.sender === Sender.USER ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex w-full justify-start">
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-slate-500 text-sm">Dr. AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {previewUrl && (
              <div className="mb-3 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
                <div className="w-12 h-12 rounded overflow-hidden relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-700">Image attached</span>
                  <button onClick={clearFile} className="text-xs text-red-500 hover:underline text-left">Remove</button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 items-end bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="Upload Report or Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden" 
              />
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type symptoms or upload a medical report..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-slate-800 placeholder:text-slate-400"
                rows={1}
              />
              
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !selectedFile) || isAnalyzing}
                className={`p-2 rounded-xl transition-all ${
                  (!input.trim() && !selectedFile) || isAnalyzing
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                }`}
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsBookingOpen(true)}
                disabled={isAnalyzing}
                className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors shadow-md shadow-green-600/20"
                title="Book Appointment"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              AI can make mistakes. Consider checking important information. Emergency? Call 1122.
            </p>
          </div>
        </div>
      </div>

      {/* --- Booking Agent --- */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-shrink-0">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">Book Appointment</h2>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="Full Name"
                  value={bookingForm.name}
                  onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="03XXXXXXXXX"
                  value={bookingForm.phone}
                  onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="your.email@example.com"
                  value={bookingForm.email}
                  onChange={e => setBookingForm({...bookingForm, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Select Doctor</label>
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                  {DOCTORS.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setBookingForm({...bookingForm, doctor: doc.id, department: doc.specialty.toLowerCase()})}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        bookingForm.doctor === doc.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{doc.name}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{doc.specialty}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">{doc.location}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          bookingForm.doctor === doc.id
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {bookingForm.doctor === doc.id && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date (Monday - Friday)</label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    value={bookingForm.date}
                    onChange={e => setBookingForm({...bookingForm, date: e.target.value})}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Appointments only available Monday to Friday</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Time Slots</label>
                  {isCheckingAvailability ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">Checking availability...</span>
                    </div>
                  ) : availableTimeSlots.length === 0 && bookingForm.date ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400">No available slots for this date</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Please select another date</p>
                    </div>
                  ) : !bookingForm.date ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Please select a date first</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {[
                        "10:00AM", "10:30AM", "11:00AM", "11:30AM", "12:00PM", "12:30PM",
                        "1:00PM", "1:30PM", "2:00PM", "2:30PM", "3:00PM", "3:30PM",
                        "4:00PM", "4:30PM", "5:00PM", "5:30PM", "6:00PM", "6:30PM",
                        "7:00PM", "7:30PM", "8:00PM", "8:30PM", "9:00PM"
                      ].map(time => {
                        const isAvailable = availableTimeSlots.includes(time);
                        const isSelected = bookingForm.time === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => isAvailable && setBookingForm({...bookingForm, time})}
                            disabled={!isAvailable}
                            className={`p-2 text-xs rounded-lg transition-all ${
                              !isAvailable
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300'
                            }`}
                          >
                            {time}
                            {!isAvailable && ' - Booked'}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Symptoms / Reason for Visit</label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:text-white"
                  placeholder="Please describe your symptoms or reason for visiting..."
                  value={bookingForm.symptoms}
                  onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  required
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder="Your complete address"
                  value={bookingForm.address}
                  onChange={e => setBookingForm({...bookingForm, address: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:text-white"
                  placeholder="Any additional information or preferences..."
                  value={bookingForm.reason}
                  onChange={e => setBookingForm({...bookingForm, reason: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl mt-4 shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:bg-blue-400"
              >
                {isSubmittingBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
              </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirmation Slip Modal --- */}
      {confirmedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AppointmentSlip
              appointment={confirmedAppointment}
              onClose={() => setConfirmedAppointment(null)}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  );
}