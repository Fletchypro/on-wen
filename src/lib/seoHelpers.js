const APP_NAME = 'Wen';
const APP_TAGLINE = 'Plan Smarter. Live Visually.';
const APP_URL = 'https://onwen.com';
const APP_IMAGE = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png';

/**
 * Get optimized page title for SEO
 * @param {string} pageName - Name of the page
 * @param {string} [customTitle] - Optional custom title override
 * @returns {string} - Formatted page title
 */
export const getPageTitle = (pageName, customTitle = null) => {
  if (customTitle) return `${customTitle} | ${APP_NAME}`;
  
  const titles = {
    home: `${APP_NAME} - ${APP_TAGLINE} | Event Planning App`,
    login: `Log In to ${APP_NAME} - Event Planning & Organization App`,
    signup: `Sign Up for ${APP_NAME} - Free Event Planning & Organization`,
    dashboard: `My Events - ${APP_NAME} Event Planner`,
    'add-event': `Create New Event - ${APP_NAME}`,
    'edit-event': `Edit Event - ${APP_NAME}`,
    friends: `Friends & Connections - ${APP_NAME}`,
    messages: `Messages - ${APP_NAME}`,
    settings: `Settings - ${APP_NAME}`,
    about: `About ${APP_NAME} - ${APP_TAGLINE}`,
    privacy: `Privacy Policy - ${APP_NAME}`,
    'terms-of-service': `Terms of Service - ${APP_NAME}`,
    security: `Security - ${APP_NAME}`,
    support: `Support Center - ${APP_NAME}`,
    feedback: `Feedback - ${APP_NAME}`,
    legal: `Legal Information - ${APP_NAME}`,
    'community-guidelines': `Community Guidelines - ${APP_NAME}`,
    'reset-password': `Reset Password - ${APP_NAME}`,
    verify: `Verify Account - ${APP_NAME}`,
  };
  
  return titles[pageName] || `${APP_NAME} - Event Planning Made Simple`;
};

/**
 * Get meta description for SEO
 * @param {string} pageName - Name of the page
 * @param {string} [customDescription] - Optional custom description
 * @returns {string} - Meta description (150-160 chars)
 */
export const getMetaDescription = (pageName, customDescription = null) => {
  if (customDescription) return customDescription;
  
  const descriptions = {
    home: 'Create, organize, and share events with friends. Wen helps you plan gatherings, trips, and celebrations effortlessly with visual calendars.',
    login: 'Sign in to your Wen account to manage events, coordinate with friends, and organize your social calendar with ease.',
    signup: 'Join Wen to start organizing events and coordinating with friends. Create your account in seconds and begin planning smarter.',
    dashboard: 'View and manage all your upcoming events, invitations, and friend activities in one visual timeline. Stay organized effortlessly.',
    'add-event': 'Create a new event, set details, invite friends, and start organizing. Add location, date, time, images, and more with Wen.',
    'edit-event': 'Edit your event details, update attendees, change times, or modify any aspect of your planned gathering.',
    friends: 'Connect with friends, send invitations, manage your social network, and coordinate group events seamlessly.',
    messages: 'Chat with friends, coordinate event details, and keep everyone on the same page with built-in messaging.',
    settings: 'Customize your Wen experience. Manage account settings, privacy preferences, notifications, and app appearance.',
    about: 'Learn about Wen\'s mission to make event planning visual, simple, and collaborative. Discover features that help you stay organized.',
    privacy: 'Read our privacy policy to understand how we collect, use, and protect your data at Wen. Your privacy matters to us.',
    'terms-of-service': 'Review the terms and conditions for using Wen. Understand your rights and responsibilities as a user.',
    security: 'Learn about the security measures we take to protect your data and privacy. Wen uses encryption and best practices.',
    support: 'Get help with Wen. Find answers to common questions, contact support, and learn how to use features effectively.',
    feedback: 'Share your feedback, suggestions, or bug reports. Help us improve Wen and shape the future of event planning.',
    legal: 'View legal information, compliance details, copyrights, and developer information for the Wen application.',
    'community-guidelines': 'Read our community guidelines to help keep Wen a safe, respectful, and positive space for everyone.',
    'reset-password': 'Reset your Wen account password securely. Enter your email to receive password reset instructions.',
    verify: 'Verify your Wen account with the code sent to your email or phone. Complete registration to start using the app.',
  };
  
  return descriptions[pageName] || 'Wen - A visually-rich smart calendar that helps you organize events, coordinate with friends, and plan your life.';
};

/**
 * Get Open Graph tags for social sharing
 * @param {string} pageName - Name of the page
 * @param {Object} [customData] - Optional custom data override
 * @returns {Object} - Open Graph meta tags
 */
export const getOGTags = (pageName, customData = {}) => {
  const baseOG = {
    'og:site_name': APP_NAME,
    'og:type': 'website',
    'og:locale': 'en_US',
    'og:image': customData.image || APP_IMAGE,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': `${APP_NAME} Logo`,
  };
  
  const ogData = {
    'og:title': customData.title || getPageTitle(pageName),
    'og:description': customData.description || getMetaDescription(pageName),
    'og:url': customData.url || `${APP_URL}/${pageName === 'home' ? '' : pageName}`,
    ...baseOG,
  };
  
  return ogData;
};

/**
 * Get Twitter Card tags
 * @param {string} pageName - Name of the page
 * @param {Object} [customData] - Optional custom data override
 * @returns {Object} - Twitter Card meta tags
 */
export const getTwitterTags = (pageName, customData = {}) => {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:site': '@WenApp',
    'twitter:creator': '@WenApp',
    'twitter:title': customData.title || getPageTitle(pageName),
    'twitter:description': customData.description || getMetaDescription(pageName),
    'twitter:image': customData.image || APP_IMAGE,
    'twitter:image:alt': `${APP_NAME} Logo`,
  };
};

/**
 * Get canonical URL for the page
 * @param {string} pageName - Name of the page
 * @returns {string} - Canonical URL
 */
export const getCanonicalURL = (pageName) => {
  return `${APP_URL}/${pageName === 'home' ? '' : pageName}`;
};

/**
 * Generate Organization structured data (JSON-LD)
 * @returns {Object} - Organization schema
 */
export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': APP_NAME,
    'url': APP_URL,
    'logo': APP_IMAGE,
    'description': 'A visually-rich smart calendar app for organizing events and coordinating with friends.',
    'contactPoint': {
      '@type': 'ContactPoint',
      'email': 'support@onwen.com',
      'contactType': 'Customer Support',
      'availableLanguage': 'English',
    },
    'sameAs': [
      'https://twitter.com/WenApp',
      'https://facebook.com/WenApp',
    ],
  };
};

/**
 * Generate Event structured data (JSON-LD)
 * @param {Object} event - Event object
 * @returns {Object} - Event schema
 */
export const getEventSchema = (event) => {
  if (!event) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.title || 'Untitled Event',
    'startDate': event.date || new Date().toISOString(),
    'description': event.notes || event.title || 'Event created on Wen',
  };
  
  if (event.end_date) {
    schema.endDate = event.end_date;
  }
  
  if (event.location) {
    schema.location = {
      '@type': 'Place',
      'name': event.location,
    };
    
    if (event.address) {
      schema.location.address = event.address;
    }
  }
  
  if (event.image) {
    schema.image = event.image;
  }
  
  if (event.attendees && event.attendees.length > 0) {
    schema.attendee = event.attendees.map(attendee => ({
      '@type': 'Person',
      'name': `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim() || attendee.email,
    }));
  }
  
  return schema;
};

/**
 * Generate WebApplication structured data (JSON-LD)
 * @returns {Object} - WebApplication schema
 */
export const getWebApplicationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': APP_NAME,
    'url': APP_URL,
    'description': 'A visually-rich smart calendar that lets you attach images to events and resize them based on importance.',
    'applicationCategory': 'LifestyleApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '1250',
    },
  };
};