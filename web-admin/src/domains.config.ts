/**
 * Domain Configuration for Coffee Journal Admin Dashboard
 * Configure custom domains and SSL settings for production
 */

export const domainConfig = {
  // Production domains
  production: {
    primary: 'admin.coffeejournalFresh.com',
    alternates: [
      'admin.coffeejournal.app',
      'dashboard.coffeejournalFresh.com',
    ],
  },
  
  // Staging/Development domains
  staging: {
    primary: 'admin-staging.coffeejournalFresh.com',
    alternates: [
      'admin-dev.coffeejournalFresh.com',
    ],
  },
  
  // Local development
  development: {
    primary: 'localhost:3000',
    alternates: [
      '127.0.0.1:3000',
      'admin.localhost:3000',
    ],
  },
} as const;

// SSL and HTTPS configuration
export const sslConfig = {
  enforceHttps: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  certificateType: 'automatic', // Vercel automatic SSL
} as const;

// CDN and performance configuration
export const cdnConfig = {
  // Static asset domains for CDN
  staticDomains: [
    'cdn.coffeejournalFresh.com',
    'assets.coffeejournalFresh.com',
  ],
  
  // Image optimization
  imageDomains: [
    'images.coffeejournalFresh.com',
    // Supabase storage domains
    '*.supabase.co',
    '*.supabase.com',
  ],
  
  // Cache configuration
  cacheControl: {
    static: 'public, max-age=31536000, immutable', // 1 year for static assets
    dynamic: 'public, max-age=300, s-maxage=3600', // 5 min client, 1 hour edge
    api: 'public, max-age=60, s-maxage=300', // 1 min client, 5 min edge
  },
} as const;

// CORS configuration
export const corsConfig = {
  allowedOrigins: [
    'https://admin.coffeejournalFresh.com',
    'https://admin.coffeejournal.app',
    'https://admin-staging.coffeejournalFresh.com',
    // Add your main app domain when ready
    'https://app.coffeejournalFresh.com',
    'https://coffeejournalFresh.com',
  ],
  
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Admin-Token',
  ],
  
  credentials: true,
  maxAge: 86400, // 24 hours
} as const;

// Security configuration
export const securityConfig = {
  // Admin access restrictions
  adminIpWhitelist: [
    // Add specific IP ranges if needed for additional security
    // '192.168.1.0/24',
    // '10.0.0.0/8',
  ],
  
  // Rate limiting
  rateLimiting: {
    login: {
      max: 5, // 5 attempts
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    api: {
      max: 100, // 100 requests
      windowMs: 60 * 1000, // 1 minute
    },
    bulk: {
      max: 10, // 10 bulk operations
      windowMs: 60 * 1000, // 1 minute
    },
  },
  
  // Session configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict',
  },
} as const;

// Get current domain configuration based on environment
export function getDomainConfig() {
  const env = process.env.NODE_ENV || 'development';
  const isStaging = process.env.VERCEL_ENV === 'preview';
  
  if (env === 'production' && !isStaging) {
    return domainConfig.production;
  } else if (isStaging) {
    return domainConfig.staging;
  } else {
    return domainConfig.development;
  }
}

// Get full URL for current environment
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  const config = getDomainConfig();
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  return `${protocol}://${config.primary}`;
}

// Validate domain for security
export function isValidDomain(domain: string): boolean {
  const allDomains: string[] = [
    ...domainConfig.production.alternates,
    ...domainConfig.staging.alternates,
    ...domainConfig.development.alternates,
    domainConfig.production.primary,
    domainConfig.staging.primary,
    domainConfig.development.primary,
  ];
  
  return allDomains.includes(domain);
}

// Generate CSP domains for security headers
export function getCspDomains(): string {
  const supabaseDomains = 'https://*.supabase.co https://*.supabase.com';
  const vercelDomains = 'https://vercel.live https://cdn.vercel-insights.com';
  const fontDomains = 'https://fonts.googleapis.com https://fonts.gstatic.com';
  
  return [supabaseDomains, vercelDomains, fontDomains].join(' ');
}

export default {
  domainConfig,
  sslConfig,
  cdnConfig,
  corsConfig,
  securityConfig,
  getDomainConfig,
  getBaseUrl,
  isValidDomain,
  getCspDomains,
};