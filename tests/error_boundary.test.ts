// WardAlert Sentinel - Error Boundary Unit Tests
// Verifies production-safe failure isolation and fallback recovery logic.

import {
  deriveErrorState,
  captureComponentError,
  resetErrorState,
  shouldRenderFallback,
  ErrorBoundaryState
} from '../analyser/errorBoundaryCore';

export interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runErrorBoundaryTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: deriveErrorState transition
  const testError = new Error('Simulated physiological waveform rendering failure');
  const derivedState = deriveErrorState(testError);

  results.push({
    name: 'ErrorBoundary: Static Error State Derivation (deriveErrorState)',
    passed: derivedState.hasError === true && derivedState.error === testError,
    details: 'Verified deriveErrorState updates hasError to true and preserves error object.'
  });

  // Test 2: captureComponentError diagnostic and callback forwarding
  let caughtError: Error | null = null;
  let caughtStack: string | undefined = undefined;

  const diagnosticResult = captureComponentError(
    testError,
    { componentStack: '\n    in CorruptedTelemetrySection' },
    (err, info) => {
      caughtError = err;
      caughtStack = info.componentStack;
    }
  );

  results.push({
    name: 'ErrorBoundary: Error Interception & Diagnostic Callback (captureComponentError)',
    passed: diagnosticResult.logged && caughtError === testError && caughtStack?.includes('CorruptedTelemetrySection'),
    details: 'Verified error capture invokes diagnostic handler with error instance and component stack trace.'
  });

  // Test 3: resetErrorState restores healthy baseline
  let resetCallbackFired = false;
  const resetState = resetErrorState(() => {
    resetCallbackFired = true;
  });

  results.push({
    name: 'ErrorBoundary: Clinical State Reset & Self-Healing (resetErrorState)',
    passed: resetCallbackFired && resetState.hasError === false && resetState.error === null,
    details: 'Verified resetErrorState clears error flags and triggers the onReset handler.'
  });

  // Test 4: Fallback triggering logic
  const errorActiveState: ErrorBoundaryState = { hasError: true, error: testError };
  const healthyState: ErrorBoundaryState = { hasError: false, error: null };

  const fallbackTriggered = shouldRenderFallback(errorActiveState);
  const passthroughAllowed = !shouldRenderFallback(healthyState);

  results.push({
    name: 'ErrorBoundary: Conditional Fallback vs Normal Passthrough Resolution',
    passed: fallbackTriggered && passthroughAllowed,
    details: 'Verified fallback renders only when hasError is true; normal passthrough allowed when healthy.'
  });

  // Test 5: String error normalization
  const stringError = 'Non-Error exception thrown by legacy telemetry module' as any;
  const normalizedState = deriveErrorState(stringError);

  results.push({
    name: 'ErrorBoundary: Non-standard Exception Normalization Guard',
    passed: normalizedState.hasError === true && normalizedState.error instanceof Error && normalizedState.error.message.includes('Non-Error exception'),
    details: 'Verified string/non-standard exceptions are safely wrapped in standard Error instances.'
  });

  return results;
}
