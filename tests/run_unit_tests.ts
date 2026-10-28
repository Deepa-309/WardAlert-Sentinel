// WardAlert Sentinel - Offline Unit & Invariant Test Runner
// Runs all algorithmic, safety invariant, priority, RBAC, and error boundary unit tests
// without requiring active backend/frontend dev server processes.

import { runSafetyCriticalTest } from './safety_critical.test';
import { runAnalyserTests } from './analyser.test';
import { runRBACTests } from './rbac.test';
import { runEvaluatorTests } from './evaluator.test';
import { runErrorBoundaryTests } from './error_boundary.test';

export function runAllUnitTests() {
  console.log('================================================================');
  console.log('🛡️  WARDALERT SENTINEL - UNIT & SAFETY INVARIANT TEST SUITE');
  console.log('================================================================\n');

  let passedTotal = 0;
  let failedTotal = 0;

  // 1. SAFETY CRITICAL TEST (HIGHEST PRIORITY)
  console.log('>>> 1. REGULATORY SAFETY INVARIANT TESTS <<<');
  const safetyTest = runSafetyCriticalTest();
  if (safetyTest.passed) {
    console.log(`  ✅ [PASS] ${safetyTest.name}`);
    console.log(`     ${safetyTest.details}`);
    passedTotal++;
  } else {
    console.log(`  ❌ [FAIL] ${safetyTest.name}`);
    console.log(`     ${safetyTest.details}`);
    failedTotal++;
  }
  console.log('');

  // 2. ANALYSER TESTS
  console.log('>>> 2. ANALYSER PIPELINE TESTS <<<');
  const analyserTests = runAnalyserTests();
  for (const t of analyserTests) {
    if (t.passed) {
      console.log(`  ✅ [PASS] ${t.name}`);
      console.log(`     ${t.details}`);
      passedTotal++;
    } else {
      console.log(`  ❌ [FAIL] ${t.name}`);
      console.log(`     ${t.details}`);
      failedTotal++;
    }
  }
  console.log('');

  // 3. RBAC TESTS
  console.log('>>> 3. ROLE-BASED ACCESS CONTROL (RBAC) TESTS <<<');
  const rbacTests = runRBACTests();
  for (const t of rbacTests) {
    if (t.passed) {
      console.log(`  ✅ [PASS] ${t.name}`);
      console.log(`     ${t.details}`);
      passedTotal++;
    } else {
      console.log(`  ❌ [FAIL] ${t.name}`);
      console.log(`     ${t.details}`);
      failedTotal++;
    }
  }
  console.log('');

  // 4. EVALUATION TESTS
  console.log('>>> 4. QUANTITATIVE METRIC & TARGET TESTS <<<');
  const evalTests = runEvaluatorTests();
  for (const t of evalTests) {
    if (t.passed) {
      console.log(`  ✅ [PASS] ${t.name}`);
      console.log(`     ${t.details}`);
      passedTotal++;
    } else {
      console.log(`  ❌ [FAIL] ${t.name}`);
      console.log(`     ${t.details}`);
      failedTotal++;
    }
  }
  console.log('');

  // 5. ERROR BOUNDARY & FAULT TOLERANCE TESTS
  console.log('>>> 5. ERROR BOUNDARY & FAULT TOLERANCE TESTS <<<');
  const errorBoundaryTests = runErrorBoundaryTests();
  for (const t of errorBoundaryTests) {
    if (t.passed) {
      console.log(`  ✅ [PASS] ${t.name}`);
      console.log(`     ${t.details}`);
      passedTotal++;
    } else {
      console.log(`  ❌ [FAIL] ${t.name}`);
      console.log(`     ${t.details}`);
      failedTotal++;
    }
  }
  console.log('');

  console.log('================================================================');
  console.log(`UNIT TEST RESULTS: ${passedTotal} PASSED, ${failedTotal} FAILED (TOTAL: ${passedTotal + failedTotal})`);
  if (failedTotal === 0) {
    console.log('🏆 ALL SAFETY AND PERFORMANCE SPECIFICATIONS VERIFIED!');
    console.log('================================================================');
    return true;
  } else {
    console.log('⚠️ ONE OR MORE UNIT TESTS FAILED');
    console.log('================================================================');
    return false;
  }
}

if (require.main === module) {
  const success = runAllUnitTests();
  process.exit(success ? 0 : 1);
}
