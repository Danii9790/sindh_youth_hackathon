import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dbHealth = await checkDatabaseHealth();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(health, {
      status: dbHealth.healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}