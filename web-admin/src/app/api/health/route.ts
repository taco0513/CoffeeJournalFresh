/**
 * Health Check API Route for Coffee Journal Admin Dashboard
 * Provides system health status for monitoring and deployment verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/monitoring';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    // Perform comprehensive health check
    const healthStatus = await performHealthCheck();
    
    // Basic system information
    const systemInfo = {
      service: 'Coffee Journal Admin Dashboard',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    
    // Determine HTTP status code based on health
    const statusCode = healthStatus.status === 'healthy' ? 200 
                      : healthStatus.status === 'degraded' ? 206 
                      : 503;
    
    // Response with health details
    const response = {
      ...systemInfo,
      health: healthStatus,
      checks: {
        database: healthStatus.checks.database || false,
        auth: healthStatus.checks.auth || false,
        config: true, // If we got here, basic config is working
      },
    };
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    // Health check failed completely
    const errorResponse = {
      service: 'Coffee Journal Admin Dashboard',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      health: {
        status: 'unhealthy',
        checks: {},
        timestamp: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : 'Health check failed',
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

// Support HEAD requests for simple uptime checks
export async function HEAD(request: NextRequest) {
  try {
    const healthStatus = await performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return new NextResponse(null, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

// Provide basic info for any other methods
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {
      service: 'Coffee Journal Admin Dashboard',
      endpoints: {
        'GET /api/health': 'Full health check with details',
        'HEAD /api/health': 'Simple uptime check',
      },
    },
    {
      headers: {
        'Allow': 'GET, HEAD, OPTIONS',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}