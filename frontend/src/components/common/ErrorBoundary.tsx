// WardAlert Sentinel - Production-Safe React Error Boundary
// Catches rendering and lifecycle exceptions in child component subtrees,
// preventing full-application crashes and preserving clinical dashboard availability.

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  ErrorBoundaryState,
  deriveErrorState,
  captureComponentError,
  resetErrorState,
  shouldRenderFallback
} from '../../../../analyser/errorBoundaryCore';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackTitle?: string;
  fallbackMessage?: string;
  isolate?: boolean;
  onReset?: () => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return deriveErrorState(error);
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureComponentError(error, { componentStack: errorInfo.componentStack }, this.props.onError);
  }

  public resetError = () => {
    const nextState = resetErrorState(this.props.onReset);
    this.setState(nextState);
  };

  public render() {
    if (shouldRenderFallback(this.state)) {
      // 1. Custom functional fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error || new Error('Unknown rendering error'), this.resetError);
      }

      // 2. Custom node fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 3. Default production fallback UI (adhering to WardAlert Sentinel design tokens)
      const title = this.props.fallbackTitle || 'Component Rendering Error';
      const message =
        this.props.fallbackMessage ||
        'A rendering error occurred within this clinical view. Other ward telemetry modules remain operational.';

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-200 bg-red-50/80 p-5 text-slate-800 shadow-sm my-2"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-red-100 p-2 text-red-600 flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-900">{title}</h3>
              <p className="mt-1 text-xs text-red-700 leading-relaxed">{message}</p>
              {this.state.error && (
                <div className="mt-2 rounded bg-white/90 p-2 text-[11px] font-mono text-red-800 border border-red-200/60 overflow-x-auto max-h-24">
                  {this.state.error.message || 'Unknown error occurred'}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.resetError}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Component
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
