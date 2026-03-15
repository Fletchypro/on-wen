import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
// CSS loaded via <link> in index.html to avoid MIME-type error in dev
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

if (typeof React?.useState !== 'function') {
	throw new Error('React.useState is not available. Clear Vite cache: rm -rf node_modules/.vite then restart npm run dev.');
}
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import { Helmet } from 'react-helmet';

// Catch render errors so we see a message instead of a black screen
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#111',
          color: '#fff',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h1 style={{ color: '#f87171', marginBottom: 16 }}>Something went wrong</h1>
          <pre style={{ background: '#222', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 14 }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <p style={{ marginTop: 16, color: '#94a3b8' }}>Check the browser Console (F12) for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register Service Worker (don't block app if it fails)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => console.log('SW registered: ', registration))
      .catch((err) => console.log('SW registration failed: ', err));
  });
}

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <Helmet>
      <meta httpEquiv="Cache-Control" content="public, max-age=86400" />
    </Helmet>
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <ScrollToTop />
            <App />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </ErrorBoundary>
);