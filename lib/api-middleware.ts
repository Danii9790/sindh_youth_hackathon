import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for production
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
};

const API_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/appointments': {
    windowMs: 60 * 1000,
    maxRequests: 10 // Lower limit for appointment creation
  },
  '/api/admin': {
    windowMs: 60 * 1000,
    maxRequests: 200 // Higher limit for admin routes
  }
};

// Rate limiting middleware
export const rateLimit = (request: NextRequest, config?: RateLimitConfig): boolean => {
  const rateLimitConfig = config || DEFAULT_RATE_LIMIT;
  const clientId = getClientId(request);
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Check current client
  const clientData = rateLimitStore.get(clientId);

  if (!clientData) {
    // First request from this client
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs
    });
    return true;
  }

  if (now > clientData.resetTime) {
    // Window has expired, reset
    clientData.count = 1;
    clientData.resetTime = now + rateLimitConfig.windowMs;
    return true;
  }

  if (clientData.count >= rateLimitConfig.maxRequests) {
    // Rate limit exceeded
    return false;
  }

  // Increment counter
  clientData.count++;
  return true;
};

// Get client identifier for rate limiting
const getClientId = (request: NextRequest): string => {
  // Try to get user ID from auth header if available
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user ID from Clerk session if possible
      const userId = request.headers.get('x-clerk-user-id');
      if (userId) return `user:${userId}`;
    } catch (error) {
      // Fall back to IP
    }
  }

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
};

// Enhanced logging utility
export const logApiRequest = (
  method: string,
  url: string,
  status: number,
  userId?: string,
  duration?: number,
  error?: string
) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    url,
    status,
    userId: userId || 'anonymous',
    duration: duration || 0,
    error: error || undefined,
    userAgent: process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
  };

  if (status >= 500) {
    console.error('🔴 API Error:', logData);
  } else if (status >= 400) {
    console.warn('🟡 API Warning:', logData);
  } else {
    console.log('🟢 API Request:', logData);
  }
};

// Security headers utility
export const addSecurityHeaders = (response: NextResponse): NextResponse => {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};

// Error response utility
export const createErrorResponse = (
  message: string,
  status: number,
  details?: any
): NextResponse => {
  const response = NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details })
    },
    { status }
  );

  return addSecurityHeaders(response);
};

// Success response utility
export const createSuccessResponse = (
  data: any,
  status: number = 200
): NextResponse => {
  const response = NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status });

  return addSecurityHeaders(response);
};

// Middleware wrapper for API routes
export const withApiMiddleware = async (
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimit?: RateLimitConfig;
    requireAuth?: boolean;
  }
): Promise<NextResponse> => {
  const startTime = Date.now();
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Rate limiting
    const rateLimitConfig = options?.rateLimit ||
      Object.entries(API_RATE_LIMITS).find(([route]) => path.startsWith(route))?.[1];

    if (rateLimitConfig && !rateLimit(request, rateLimitConfig)) {
      const response = createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        { retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000) }
      );

      logApiRequest(request.method, path, 429, undefined, Date.now() - startTime);
      return response;
    }

    // Execute the handler
    const response = await handler(request);
    const duration = Date.now() - startTime;

    // Log the request
    const userId = request.headers.get('x-clerk-user-id') || undefined;
    logApiRequest(request.method, path, response.status, userId, duration);

    return addSecurityHeaders(response);

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('API Route Error:', {
      method: request.method,
      path,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration
    });

    const response = createErrorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? { error: errorMessage } : undefined
    );

    logApiRequest(request.method, path, 500, undefined, duration, errorMessage);
    return response;
  }
};