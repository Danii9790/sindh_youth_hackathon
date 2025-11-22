import jsPDF from 'jspdf';

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

export class PDFService {
  // Generate appointment slip PDF
  static async generateAppointmentSlip(appointment: DatabaseAppointment): Promise<Blob> {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

    // Add custom fonts for better typography
    pdf.setFont('helvetica');

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('MediAI Pro', 20, 30);

    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100); // Gray
    pdf.text('Appointment Confirmation Slip', 20, 45);

    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);

    // Appointment ID
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Appointment ID: #${appointment.id}`, 20, 70);

    // Patient Information
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Patient Information', 20, 90);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Name: ${appointment.fullName}`, 25, 105);
    pdf.text(`Phone: ${appointment.phone}`, 25, 115);
    pdf.text(`Email: ${appointment.email}`, 25, 125);
    if (appointment.createdAt) {
      pdf.text(`Date of Booking: ${new Date(appointment.createdAt).toLocaleDateString()}`, 25, 135);
    }

    // Doctor Information
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Doctor Information', 20, 155);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Dr. ${appointment.doctor}`, 25, 170);
    pdf.text(`Department: ${appointment.department.charAt(0).toUpperCase() + appointment.department.slice(1)}`, 25, 180);

    // Appointment Details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Appointment Details', 110, 90);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Date: ${new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 115, 105);

    pdf.text(`Time: ${appointment.time}`, 115, 115);
    pdf.text(`Address: ${appointment.address}`, 115, 125);

    // Status badge
    const statusColor = this.getStatusColor(appointment.status);
    pdf.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    pdf.text(`Status: ${appointment.status.toUpperCase()}`, 115, 135);

    // Symptoms/Reason
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Reason for Visit', 20, 200);

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Black

    // Handle long symptoms text
    const symptoms = appointment.symptoms || appointment.reason || 'General consultation';
    const splitSymptoms = pdf.splitTextToSize(symptoms, 170);
    pdf.text(splitSymptoms, 25, 215);

    let currentY = 215 + (splitSymptoms.length * 7);

    // Important Information
    pdf.setFontSize(12);
    pdf.setTextColor(255, 0, 0); // Red
    pdf.text('Important Information:', 20, currentY + 20);

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black
    const importantInfo = [
      '• Please arrive 15 minutes before your appointment time',
      '• Bring your ID card and any previous medical records',
      '• If you need to cancel or reschedule, please call at least 24 hours in advance',
      '• For emergencies, please contact your local emergency services'
    ];

    currentY += 30;
    importantInfo.forEach(info => {
      pdf.text(info, 25, currentY);
      currentY += 8;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150); // Light gray
    pdf.text('This is a computer-generated appointment slip.', 20, 280);
    pdf.text('For any queries, please contact our support team.', 20, 285);

    // Add QR Code placeholder (you would integrate a QR code library in production)
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(160, 240, 30, 30);
    pdf.setFontSize(8);
    pdf.text('QR Code', 167, 258);

    const pdfBlob = pdf.output('blob');
    return new Blob([pdfBlob], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get color for appointment status
  private static getStatusColor(status: string): { r: number; g: number; b: number } {
    switch (status) {
      case 'confirmed':
        return { r: 0, g: 128, b: 0 }; // Green
      case 'scheduled':
        return { r: 255, g: 140, b: 0 }; // Orange
      case 'cancelled':
        return { r: 255, g: 0, b: 0 }; // Red
      case 'completed':
        return { r: 0, g: 51, b: 102 }; // Dark blue
      default:
        return { r: 100, g: 100, b: 100 }; // Gray
    }
  }

  // Download the PDF
  static downloadPDF(pdfBlob: Blob, filename: string): void {
    try {
      // Validate inputs
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error('Invalid PDF blob provided');
      }

      if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename provided');
      }

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Generate conversation export PDF
  static async generateConversationPDF(
    conversationId: string,
    messages: any[],
    conversationTitle: string
  ): Promise<Blob> {
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('MediAI Pro - Conversation Export', 20, 30);

    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100); // Gray
    pdf.text(`Conversation: ${conversationTitle}`, 20, 45);
    pdf.text(`ID: ${conversationId}`, 20, 55);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);

    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 75, 190, 75);

    // Messages
    let currentY = 90;
    pdf.setFontSize(10);

    messages.forEach((message, index) => {
      // Check if we need a new page
      if (currentY > 250) {
        pdf.addPage();
        currentY = 30;
      }

      const sender = message.sender === 'user' ? 'You' : 'Dr. AI';
      const time = new Date(message.timestamp).toLocaleString();

      // Message header
      pdf.setFontSize(9);
      pdf.setTextColor(0, 51, 102); // Dark blue
      pdf.text(`${sender} - ${time}`, 20, currentY);

      // Message content
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0); // Black
      const splitText = pdf.splitTextToSize(message.text, 170);
      pdf.text(splitText, 25, currentY + 8);

      currentY += 8 + (splitText.length * 5) + 10;

      // Add small separator
      if (index < messages.length - 1) {
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.2);
        pdf.line(25, currentY - 3, 185, currentY - 3);
      }
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150); // Light gray
    pdf.text('This conversation export is for personal records only.', 20, 280);

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  // Generate medical report PDF
  static async generateMedicalReport(analysisResult: any, patientInfo: any): Promise<Blob> {
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('MediAI Pro - Medical Analysis Report', 20, 30);

    // Patient Information
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Patient: ${patientInfo.name}`, 20, 50);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    pdf.text(`Report ID: ${Date.now()}`, 20, 70);

    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 80, 190, 80);

    // Analysis Results
    let currentY = 100;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Analysis Results', 20, currentY);

    currentY += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Condition: ${analysisResult.condition}`, 25, currentY);

    currentY += 15;

    // Urgency level with color
    const urgencyColor = this.getUrgencyColor(analysisResult.urgency);
    pdf.setTextColor(urgencyColor.r, urgencyColor.g, urgencyColor.b);
    pdf.text(`Urgency Level: ${analysisResult.urgency}`, 25, currentY);

    currentY += 15;

    pdf.setTextColor(0, 0, 0); // Black
    pdf.text(`Recommended Specialist: ${analysisResult.specialist}`, 25, currentY);

    currentY += 20;

    // Recommendations
    pdf.setFontSize(14);
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.text('Recommendations', 20, currentY);

    currentY += 15;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0); // Black
    const recommendations = pdf.splitTextToSize(analysisResult.recommendation, 170);
    pdf.text(recommendations, 25, currentY);

    // Disclaimer
    currentY += recommendations.length * 7 + 20;
    pdf.setFontSize(9);
    pdf.setTextColor(255, 0, 0); // Red
    pdf.text('DISCLAIMER:', 20, currentY);

    currentY += 10;
    pdf.setTextColor(100, 100, 100); // Gray
    const disclaimer = 'This analysis is provided by AI and should not replace professional medical advice. ' +
                       'Please consult with a qualified healthcare provider for proper diagnosis and treatment.';
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, 170);
    pdf.text(splitDisclaimer, 25, currentY);

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  // Get color for urgency level
  private static getUrgencyColor(urgency: string): { r: number; g: number; b: number } {
    switch (urgency) {
      case 'Low':
        return { r: 0, g: 128, b: 0 }; // Green
      case 'Moderate':
        return { r: 255, g: 140, b: 0 }; // Orange
      case 'High':
        return { r: 255, g: 69, b: 0 }; // Red-Orange
      case 'Emergency':
        return { r: 255, g: 0, b: 0 }; // Red
      default:
        return { r: 100, g: 100, b: 100 }; // Gray
    }
  }
}