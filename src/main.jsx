import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { handleNetlifyMockRequest } from './services/netlifyMockBackend';
import './index.css';

// Global Fetch Interceptor: Enables 100% full-functionality client-side execution
// when deployed to Netlify static hosting or when Express backend is not running.
const originalFetch = window.fetch;
let backendAvailable = null;

window.fetch = async function (input, init = {}) {
  const urlStr = typeof input === 'string' ? input : (input?.url || '');

  // Intercept all SDRMS /api/ calls
  if (urlStr.startsWith('/api/') || urlStr.includes('/api/')) {
    // If we already know the backend is not running (e.g. Netlify static hosting)
    if (backendAvailable === false) {
      return handleNetlifyMockRequest(urlStr, init);
    }

    try {
      const response = await originalFetch(input, init);

      // On Netlify static hosting, requests to /api/* redirect to index.html with 200 OK and text/html
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') || response.status === 404) {
        backendAvailable = false;
        return handleNetlifyMockRequest(urlStr, init);
      }

      if (backendAvailable === null && response.status < 500) {
        backendAvailable = true;
      }
      return response;
    } catch (err) {
      // Offline / Network error / ECONNREFUSED -> use embedded Netlify mock backend
      backendAvailable = false;
      return handleNetlifyMockRequest(urlStr, init);
    }
  }

  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
