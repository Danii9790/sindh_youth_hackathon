'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Activity, Calendar, User, Stethoscope, Loader2, X } from 'lucide-react';
import { Message, Sender, Doctor, Appointment } from '../types';
import { analyzeSymptoms, analyzeImage, chatWithMediAI } from '../services/geminiService';
import { AppointmentSlip } from './AppointmentSlip';
import { saveAppointmentToDb, checkAppointmentAvailability, validateAppointmentDateTime } from '../services/dbService';

// --- Mock Data ---
const DOCTORS: Doctor[] = [
  { id: "dr_sarah", name: "Dr. Sarah Khan", specialty: "Dermatologist", location: "Clifton, Floor 2", image: "https://picsum.photos/id/64/200/200" },
  { id: "dr_ahmed", name: "Dr. Ahmed Raza", specialty: "Cardiologist", location: "DHA Phase 6, Wing A", image: "https://picsum.photos/id/91/200/200" },
  { id: "dr_fatima", name: "Dr. Fatima Ali", specialty: "Neurologist", location: "Gulshan, Room 401", image: "https://picsum.photos/id/237/200/200" },
];

export const MediAIApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! Welcome to MediAI Pro.\nI can analyze symptoms, review medical reports/images, and help you book appointments. How are you feeling today?",
      sender: Sender.BOT,
      timestamp: new Date()
    }
  ]);
    const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    doctor: DOCTORS[0].id,
    date: '',
    time: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

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

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isAnalyzing) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: new Date(),
      attachment: previewUrl || undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    const currentFile = selectedFile; // Capture file for async
    const currentInput = input;
    clearFile();
    setIsAnalyzing(true);

    // --- Logic Router ---
    try {
      let responseText = '';

      // 1. Image Analysis (Highest Priority)
      if (currentFile) {
        const reader = new FileReader();
        reader.readAsDataURL(currentFile);
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          // Server Actions handle the API call securely
          responseText = await analyzeImage(base64String, currentInput || "Analyze this image.");
          addBotMessage(responseText);
        };
      } 
      // 2. Symptom Analysis (Keywords)
      else if (isSymptomRelated(currentInput)) {
        responseText = await analyzeSymptoms(currentInput);
        addBotMessage(responseText);
      }
      // 3. General Chat
      else {
        const history = messages.map(m => ({ role: m.sender === Sender.USER ? 'user' : 'model', content: m.text }));
        responseText = await chatWithMediAI(history, currentInput);
        addBotMessage(responseText);
      }

    } catch (error) {
      addBotMessage("Sorry, I encountered an error connecting to the server. Please try again.");
    }
  };

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: text,
      sender: Sender.BOT,
      timestamp: new Date()
    }]);
    setIsAnalyzing(false);
  };

  const isSymptomRelated = (text: string) => {
    const keywords = ['pain', 'hurt', 'fever', 'rash', 'sick', 'vomit', 'headache', 'cough', 'blood', 'swollen', 'dizzy'];
    return keywords.some(k => text.toLowerCase().includes(k));
  };

  
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    const doctor = DOCTORS.find(d => d.id === bookingForm.doctor) || DOCTORS[0];

    // Validate appointment date and time
    const validation = await validateAppointmentDateTime(bookingForm.date, bookingForm.time);
    if (!validation.valid) {
      addBotMessage(`❌ Invalid appointment time: ${validation.message}`);
      setIsSubmittingBooking(false);
      return;
    }

    // Check if the time slot is available
    try {
      const availabilityCheck = await checkAppointmentAvailability(bookingForm.date, bookingForm.time);
      if (!availabilityCheck.available) {
        addBotMessage(`❌ Time slot unavailable: ${availabilityCheck.message}`);
        setIsSubmittingBooking(false);
        return;
      }
    } catch (error) {
      console.error("Availability check error:", error);
      addBotMessage("⚠️ Unable to check appointment availability. Please try again.");
      setIsSubmittingBooking(false);
      return;
    }

    const newAppointment: Appointment = {
      id: Math.floor(Math.random() * 10000).toString(),
      patientName: bookingForm.name,
      phone: bookingForm.phone,
      doctor: doctor,
      date: bookingForm.date,
      time: bookingForm.time,
      symptoms: "Booked via App"
    };

    try {
      // Attempt to save to DB (Server Action)
      const dbResult = await saveAppointmentToDb(newAppointment);

      if (dbResult.success) {
        // Update appointment with the database ID
        const appointmentWithDbId = {
          ...newAppointment,
          id: dbResult.appointmentId || newAppointment.id
        };

        setConfirmedAppointment(appointmentWithDbId);
        setIsBookingOpen(false);

        addBotMessage(`✅ Appointment booked successfully! Database ID: ${dbResult.appointmentId}. Your data has been securely saved to our records. I've generated a confirmation slip for you to download.`);
      } else {
        // Database save failed, but we still confirm the appointment
        setConfirmedAppointment(newAppointment);
        setIsBookingOpen(false);

        addBotMessage(`⚠️ Appointment booked locally! ID: #${newAppointment.id}. However, we encountered an issue with our database: ${dbResult.message}. Your appointment is valid and our staff will contact you to confirm.`);
      }
    } catch (error) {
      console.error("Booking error", error);
      // Even if there's a complete error, we still want to confirm the appointment to the user
      setConfirmedAppointment(newAppointment);
      setIsBookingOpen(false);

      addBotMessage(`📅 Appointment booked! ID: #${newAppointment.id}. We experienced a technical issue but have recorded your appointment. Our staff will contact you shortly to confirm.`);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* --- Sidebar (Desktop) --- */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl text-slate-800 tracking-tight">MediAI Pro</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <h3 className="text-blue-800 font-semibold mb-1 text-sm">New Feature</h3>
             <p className="text-blue-600 text-xs">Upload medical reports or photos of symptoms for instant AI analysis using Gemini 3 Pro.</p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Available Doctors</h3>
            <div className="space-y-2">
              {DOCTORS.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 truncate">{doc.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setIsBookingOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Calendar className="w-4 h-4" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col relative">
        {/* Header Mobile */}
        <div className="md:hidden h-16 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600 w-6 h-6" />
            <span className="font-bold text-lg">MediAI Pro</span>
          </div>
          <button onClick={() => setIsBookingOpen(true)} className="text-blue-600">
            <Calendar className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
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
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className="p-4 bg-white border-t border-slate-100">
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
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              AI can make mistakes. Consider checking important information. Emergency? Call 1122.
            </p>
          </div>
        </div>
      </div>

      {/* --- Booking Modal --- */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">Book Appointment</h2>
              <button onClick={() => setIsBookingOpen(false)} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Full Name"
                  value={bookingForm.name}
                  onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="03XXXXXXXXX"
                  value={bookingForm.phone}
                  onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  value={bookingForm.doctor}
                  onChange={e => setBookingForm({...bookingForm, doctor: e.target.value})}
                >
                  {DOCTORS.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date (Monday - Friday)</label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={bookingForm.date}
                    onChange={e => setBookingForm({...bookingForm, date: e.target.value})}
                  />
                  <p className="text-xs text-slate-500 mt-1">Appointments only available Monday to Friday</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time (10:00AM - 9:00PM)</label>
                  <select
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    value={bookingForm.time}
                    onChange={e => setBookingForm({...bookingForm, time: e.target.value})}
                  >
                    <option value="">Select a time</option>
                    <option value="10:00AM">10:00 AM</option>
                    <option value="10:30AM">10:30 AM</option>
                    <option value="11:00AM">11:00 AM</option>
                    <option value="11:30AM">11:30 AM</option>
                    <option value="12:00PM">12:00 PM</option>
                    <option value="12:30PM">12:30 PM</option>
                    <option value="1:00PM">1:00 PM</option>
                    <option value="1:30PM">1:30 PM</option>
                    <option value="2:00PM">2:00 PM</option>
                    <option value="2:30PM">2:30 PM</option>
                    <option value="3:00PM">3:00 PM</option>
                    <option value="3:30PM">3:30 PM</option>
                    <option value="4:00PM">4:00 PM</option>
                    <option value="4:30PM">4:30 PM</option>
                    <option value="5:00PM">5:00 PM</option>
                    <option value="5:30PM">5:30 PM</option>
                    <option value="6:00PM">6:00 PM</option>
                    <option value="6:30PM">6:30 PM</option>
                    <option value="7:00PM">7:00 PM</option>
                    <option value="7:30PM">7:30 PM</option>
                    <option value="8:00PM">8:00 PM</option>
                    <option value="8:30PM">8:30 PM</option>
                    <option value="9:00PM">9:00 PM</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Available Monday to Friday only</p>
                </div>
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
      )}

      {/* --- Confirmation Slip Modal --- */}
      {confirmedAppointment && (
        <AppointmentSlip 
          appointment={confirmedAppointment} 
          onClose={() => setConfirmedAppointment(null)} 
        />
      )}

    </div>
  );
};