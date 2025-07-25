/**
 * App Configuration
 * Central configuration for URLs, domains, and external links
 */

export const APP_CONFIG = {
  // App Identity
  appName: 'CupNote',
  appNameKorean: '컵노트',
  brandName: 'My CupNote',
  slogan: 'Your Coffee, Your Notes, Your Story',
  
  // Domain & URLs
  domain: 'mycupnote.com',
  websiteUrl: 'https://mycupnote.com',
  
  // Legal & Support URLs
  privacyPolicyUrl: 'https://mycupnote.com/privacy',
  termsOfServiceUrl: 'https://mycupnote.com/terms',
  supportUrl: 'https://mycupnote.com/support',
  
  // Contact Information
  contact: {
    email: 'hello@mycupnote.com',
    privacyEmail: 'privacy@mycupnote.com',
    supportEmail: 'support@mycupnote.com',
    phone: '+82-2-0000-0000', // Update with real number
    address: '서울특별시 강남구 테헤란로 xxx번길', // Update with real address
  },
  
  // App Store Links (to be updated after submission)
  appStore: {
    ios: 'https://apps.apple.com/app/cupnote/id000000000', // Update after submission
    android: 'https://play.google.com/store/apps/details?id=com.cupnote.app', // Update after submission
  },
  
  // Social Media (to be added)
  social: {
    instagram: '@mycupnote',
    twitter: '@mycupnote',
    facebook: 'mycupnote',
  },
  
  // API Endpoints (if needed)
  api: {
    baseUrl: 'https://api.mycupnote.com', // Future API endpoint
  },
  
  // Marketing & Analytics
  marketing: {
    landingPageUrl: 'https://mycupnote.com',
    downloadPageUrl: 'https://mycupnote.com/download',
  },
};

// Helper functions
export const getPrivacyPolicyUrl = () => APP_CONFIG.privacyPolicyUrl;
export const getTermsOfServiceUrl = () => APP_CONFIG.termsOfServiceUrl;
export const getSupportUrl = () => APP_CONFIG.supportUrl;
export const getContactEmail = () => APP_CONFIG.contact.email;
export const getWebsiteUrl = () => APP_CONFIG.websiteUrl;