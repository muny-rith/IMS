import React, { Component } from 'react';
import logo from '../../../assets/images/logo.png';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error caught by Moon IMS ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = async () => {
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Error clearing caches:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" role="alert">
          <div className="error-boundary-card">
            <img src={logo} alt="Moon IMS" className="error-boundary-logo" />
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-desc">
              Moon IMS encountered an unexpected display issue. Reloading the page usually resolves it.
            </p>
            {this.state.error?.message && (
              <div className="error-boundary-code">
                {this.state.error.message}
              </div>
            )}
            <div className="error-boundary-actions">
              <button
                type="button"
                className="error-boundary-btn error-boundary-btn--primary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button
                type="button"
                className="error-boundary-btn error-boundary-btn--secondary"
                onClick={this.handleHardReset}
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

