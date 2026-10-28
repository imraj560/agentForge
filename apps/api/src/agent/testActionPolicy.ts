import { evaluateActionPolicy } from "./actionPolicy";

const testCases = [
  {
    action: "inspect_api_logs",
    expected: "allow",
  },
  {
    action: "increase_api_rate_limit",
    expected: "require_approval",
  },
  {
    action: "delete_production_data",
    expected: "deny",
  },
  {
    action: "execute_arbitrary_command",
    expected: "deny",
  },
] as const;

let passed = 0;

for (const testCase of testCases) {
  const result = evaluateActionPolicy(testCase.action);

  const success = result.decision === testCase.expected;

  console.log(
    `${success ? "PASS" : "FAIL"}: ${testCase.action} -> ${result.decision}`
  );

  if (!success) {
    console.error(`Expected: ${testCase.expected}`);
    console.error(`Received: ${result.decision}`);
  } else {
    passed++;
  }
}

console.log(`\nResults: ${passed}/${testCases.length} tests passed`);

if (passed !== testCases.length) {
  process.exitCode = 1;
}