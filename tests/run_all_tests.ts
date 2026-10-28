// WardAlert Sentinel - Master Automated Test Runner
import { runSafetyCriticalTest } from './safety_critical.test';
import { runAnalyserTests } from './analyser.test';
import { runRBACTests } from './rbac.test';
import { runEvaluatorTests } from './evaluator.test';
import { runErrorBoundaryTests } from './error_boundary.test';

async function runAll() {
  console.log('================================================================');
  console.log('🛡️  WARDALERT SENTINEL - AUTOMATED SAFETY & VERIFICATION SUITE');
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

  // 6. END-TO-END API & LIVE SERVICE INTEGRATION TESTS
  console.log('>>> 6. END-TO-END API & LIVE SERVICE INTEGRATION TESTS <<<');
  const { runIntegrationTests } = await import('./integration.test');
  const integrationTests = await runIntegrationTests();
  for (const t of integrationTests) {
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
  console.log(`RESULTS: ${passedTotal} PASSED, ${failedTotal} FAILED (TOTAL: ${passedTotal + failedTotal})`);
  if (failedTotal === 0) {
    console.log('🏆 ALL SAFETY AND PERFORMANCE SPECIFICATIONS VERIFIED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.log('⚠️ ONE OR MORE TESTS FAILED');
    console.log('================================================================');
    process.exit(1);
  }
}

runAll().catch(e => {
  console.error(e);
  process.exit(1);
});
