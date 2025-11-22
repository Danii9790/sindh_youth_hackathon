import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Download, X, Loader2 } from 'lucide-react';
import { PDFService } from '../services/pdfService';

// Database appointment interface
interface DatabaseAppointment {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  reason: string;
  symptoms?: string;
  address: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  appointment: DatabaseAppointment;
  onClose: () => void;
}

export const AppointmentSlip: React.FC<Props> = ({ appointment, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Validate appointment data
      if (!appointment || !appointment.id) {
        throw new Error("Invalid appointment data");
      }

      // Generate PDF using our enhanced PDF service
      const pdfBlob = await PDFService.generateAppointmentSlip(appointment);

      // Create a safe filename
      const patientName = (appointment.fullName || 'Patient').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `MediAI_Appointment_${patientName}_${appointment.id}.pdf`;

      // Download the PDF
      PDFService.downloadPDF(pdfBlob, filename);

      console.log("PDF downloaded successfully:", filename);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Sorry, there was an error generating the PDF: ${errorMessage}. Please try again.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'scheduled':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-600 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">MediAI Pro Hospital</h2>
          <p className="text-blue-100 text-sm mt-1">Official Appointment Slip</p>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="flex justify-between items-center border-b pb-4 border-slate-100">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Appointment ID</p>
              <p className="font-mono text-2xl font-bold text-slate-800">#{appointment.id}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Patient</p>
                <p className="font-semibold text-slate-900">{appointment.fullName}</p>
                <p className="text-xs text-slate-600">{appointment.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Doctor</p>
                <p className="font-semibold text-slate-900">{appointment.doctor}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                    {appointment.department.charAt(0).toUpperCase() + appointment.department.slice(1)}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                <p className="font-semibold text-slate-900">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                 <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
                <p className="font-semibold text-slate-900">{appointment.time}</p>
              </div>
            </div>

            {appointment.symptoms && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Symptoms / Reason</p>
                <p className="text-sm text-slate-700">{appointment.symptoms}</p>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</p>
              <p className="text-sm text-slate-700">{appointment.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t flex gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 text-slate-600 hover:text-slate-900 font-medium text-sm py-3 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            type="button"
            disabled={isDownloading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};