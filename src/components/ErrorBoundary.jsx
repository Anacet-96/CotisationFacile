import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light dark:bg-surface-dark">
          <div className="card max-w-lg w-full">
            <h1 className="font-heading font-bold text-lg text-red-500 mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-muted mb-3">
              Copie ce message et transmets-le pour qu'on corrige :
            </p>
            <pre className="text-xs bg-black/5 dark:bg-white/10 p-3 rounded-xl overflow-auto max-h-60 font-mono">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full mt-4"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}