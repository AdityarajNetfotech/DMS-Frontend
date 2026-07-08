// Local development backend URL
// export const API_BASE_URL = "http://localhost:3000";

// Hosted backend URL
// export const API_BASE_URL = "http://103.192.198.240:9005";

// Auto-select via environment variable (set VITE_API_URL in .env to override)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://103.192.198.240:9005";
