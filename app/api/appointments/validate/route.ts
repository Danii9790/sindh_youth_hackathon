import { NextRequest, NextResponse } from 'next/server';
import { checkAppointmentAvailability, validateAppointmentDateTime } from '@/services/dbService';
import { withApiMiddleware, createErrorResponse, createSuccessResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withApiMiddleware(request, async (req) => {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!date || !time) {
      return createErrorResponse('Missing required parameters: date, time', 400);
    }

    try {
      // Validate appointment date and time
      const validationResult = await validateAppointmentDateTime(date, time);

      if (!validationResult.valid) {
        return createSuccessResponse({
          valid: false,
          message: validationResult.message,
          available: false,
          availabilityMessage: validationResult.message
        });
      }

      // Check if the time slot is available
      const availabilityResult = await checkAppointmentAvailability(date, time);

      return createSuccessResponse({
        valid: true,
        message: validationResult.message,
        available: availabilityResult.available,
        availabilityMessage: availabilityResult.message,
        date,
        time
      });

    } catch (error) {
      console.error('Error validating appointment:', error);
      return createErrorResponse('Failed to validate appointment', 500);
    }
  }, {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30 // 30 requests per minute for validation
    }
  });
}