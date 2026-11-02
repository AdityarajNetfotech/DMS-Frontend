// Local development backend URL
// export const API_BASE_URL = "http://localhost:3000";

// Hosted backend URL
// export const API_BASE_URL = "http://103.192.198.240:9005";

// Auto-select via environment variable (set VITE_API_URL in .env to override)
const computeBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    // Localhost environments
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
      const savedGateway = localStorage.getItem('dms_gateway_url');
      if (savedGateway && (savedGateway.includes('localhost') || savedGateway.includes('127.0.0.1'))) {
        return savedGateway;
      }
      return 'http://localhost:3000';
    }
    // Hosted on intellinexa.in
    if (hostname.includes('intellinexa.in')) {
      return origin || 'https://dms.intellinexa.in';
    }
    // Generic hosted domain
    return origin || 'https://dms.intellinexa.in';
  }
  return 'https://dms.intellinexa.in';
};

export const API_BASE_URL = computeBaseUrl().replace(/\/+$/, '');
