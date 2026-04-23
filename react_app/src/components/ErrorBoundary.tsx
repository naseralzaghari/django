import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.REACT_APP_ENV === 'development') {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{ 
              color: '#ef4444', 
              marginBottom: '16px',
              fontSize: '24px',
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            {process.env.REACT_APP_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '24px',
                textAlign: 'left',
                backgroundColor: '#fef2f2',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
              }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#991b1b',
                  fontWeight: '500',
                  marginBottom: '8px',
                }}>
                  Error details (development only)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  overflow: 'auto',
                  color: '#7f1d1d',
                  margin: 0,
                }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
