declare global {
  interface Window {
    AERK_CONFIG?: {
      apiBaseUrl?: string;
    };
  }
}

export const API_BASE_URL = (window.AERK_CONFIG?.apiBaseUrl ?? 'http://localhost:8080').replace(/\/+$/, '');

