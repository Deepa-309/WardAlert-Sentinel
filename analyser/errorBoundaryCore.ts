// WardAlert Sentinel - Error Boundary Core Logic & State Machine
// Encapsulates error derivation, diagnostic logging, and self-healing state transitions.

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorDiagnosticInfo {
  componentStack?: string;
  timestamp?: string;
}

/**
 * Derives error state when an unhandled exception is thrown in a child subtree.
 * Invariant: hasError MUST be true, preserving the caught Error instance for diagnostics.
 */
export function deriveErrorState(error: Error): ErrorBoundaryState {
  return {
    hasError: true,
    error: error instanceof Error ? error : new Error(String(error || 'Unknown rendering failure'))
  };
}

/**
 * Captures component error and forwards to optional diagnostic callback / audit logging.
 */
export function captureComponentError(
  error: Error,
  errorInfo?: ErrorDiagnosticInfo,
  onErrorCallback?: (error: Error, errorInfo: ErrorDiagnosticInfo) => void
): { logged: boolean; error: Error; errorInfo?: ErrorDiagnosticInfo } {
  console.error('[WardAlert Sentinel] ErrorBoundary caught a component exception:', error, errorInfo);
  if (typeof onErrorCallback === 'function') {
    onErrorCallback(error, errorInfo || {});
  }
  return {
    logged: true,
    error,
    errorInfo
  };
}

/**
 * Resets the error boundary state back to healthy baseline (self-healing recovery).
 */
export function resetErrorState(onResetCallback?: () => void): ErrorBoundaryState {
  if (typeof onResetCallback === 'function') {
    onResetCallback();
  }
  return {
    hasError: false,
    error: null
  };
}

/**
 * Determines whether to display fallback UI or allow child passthrough.
 */
export function shouldRenderFallback(state: ErrorBoundaryState): boolean {
  return state.hasError === true;
}
