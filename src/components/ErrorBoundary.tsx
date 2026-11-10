import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      
      // Try to parse Firestore error info if it's JSON
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.operationType) {
          errorMessage = `Firestore Error (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        // Not JSON, ignore
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-midnight-black text-white p-4">
          <div className="max-w-md w-full bg-graphite-grey p-8 rounded-2xl border border-glass-border">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6 font-mono text-sm break-words">
              {errorMessage}
            </p>
            <button
              className="px-4 py-2 bg-electric-blue text-midnight-black font-semibold rounded-lg hover:bg-opacity-80 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
