import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message || 'React ErrorBoundary caught error',
          stack: error?.stack || null,
          componentStack: errorInfo?.componentStack || null
        })
      });
    } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-xl font-bold">Something went wrong</h1>
            </div>
            <p className="text-sm text-slate-600">
              The application encountered an unexpected display error.
            </p>
            <div className="bg-red-50 text-red-900 p-4 rounded-xl font-mono text-xs overflow-auto max-h-48 border border-red-100">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-red-700 whitespace-pre">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem('sdrms_token');
                  window.location.href = '/';
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Clear Cache & Reload Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Try Reloading Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

