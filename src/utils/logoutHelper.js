import { API_BASE_URL } from '../config/api';

/**
 * Returns the VerifyChain logout/login destination URL for the given tenant slug.
 */
export const getVerifyChainLogoutUrl = (slug) => {
  const safeSlug = slug || localStorage.getItem('companySlug') || 'acmesolutions';

  // 0. Environment variable override if configured on server (VITE_VERIFYCHAIN_URL or VITE_VC_URL)
  const envVcUrl = import.meta.env?.VITE_VERIFYCHAIN_URL || import.meta.env?.VITE_VC_URL;
  if (envVcUrl) {
    const formatted = envVcUrl.replace('{slug}', safeSlug).replace(/\/+$/, '');
    return `${formatted}/login?action=logout&slug=${safeSlug}`;
  }

  // 1. Saved VerifyChain origin (stored during SSO redirection)
  const savedOrigin = localStorage.getItem('verifychain_origin');
  if (savedOrigin) {
    try {
      const u = new URL(savedOrigin);
      if (u.hostname.endsWith('.localhost')) {
        return `${u.protocol}//${safeSlug}.localhost:${u.port || '5173'}/login?action=logout`;
      }
      return `${u.origin}/login?action=logout&slug=${safeSlug}`;
    } catch (e) {}
  }

  // 2. Check current browser hostname and reconstruct VerifyChain host
  if (typeof window !== 'undefined') {
    const { hostname, protocol, port } = window.location;

    // Subdomain on localhost (e.g. acmesolutions.localhost)
    if (hostname.endsWith('.localhost')) {
      return `${protocol}//${safeSlug}.localhost:5173/login?action=logout`;
    }

    // Local development (localhost or 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${safeSlug}.localhost:5173/login?action=logout`;
    }

    // Hosted on intellinexa.in
    if (hostname.includes('intellinexa.in')) {
      return `https://${safeSlug}.intellinexa.in/login?action=logout`;
    }

    // nip.io / sslip.io setups
    if (hostname.includes('nip.io') || hostname.includes('sslip.io')) {
      const vcPort = port === '5174' ? '5173' : (port === '7124' ? '7120' : (port ? '5173' : ''));
      const baseHost = hostname.replace(/^[^.]+\./, '');
      return `${protocol}//${safeSlug}.${baseHost}${vcPort ? `:${vcPort}` : ''}/login?action=logout`;
    }

    // Production domain
    const domainParts = hostname.split('.');
    if (domainParts.length > 2) {
      const baseDomain = domainParts.slice(1).join('.');
      return `${protocol}//${safeSlug}.${baseDomain}/login?action=logout`;
    }
    return `${protocol}//${safeSlug}.${hostname}/login?action=logout`;
  }

  return `http://${safeSlug}.localhost:5173/login?action=logout`;
};

/**
 * Performs DMS logout: logs activity to backend, clears DMS session, and redirects to VerifyChain tenant logout.
 */
export const performDmsLogout = (companySlug) => {
  const slug = companySlug || localStorage.getItem('companySlug') || 'acmesolutions';
  const token = localStorage.getItem('accessToken');

  // Trigger fire-and-forget DMS backend logout to log activity
  if (token && slug) {
    fetch(`${API_BASE_URL}/api/${slug}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).catch(() => {});
  }

  const targetUrl = getVerifyChainLogoutUrl(slug);

  // Clear DMS session data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('displayRole');
  localStorage.removeItem('vcRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('companySlug');
  localStorage.removeItem('verifychain_origin');

  // Navigate directly to VerifyChain tenant logout/login
  window.location.href = targetUrl;
};

