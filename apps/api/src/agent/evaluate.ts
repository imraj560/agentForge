
import { agent } from "./graph";
import { evaluationDataset } from "./evaluation-dataset";
import "dotenv/config";

async function runEvaluation() {
  let passed = 0;

  for (const testCase of evaluationDataset) {
    console.log(`\nRunning evaluation: ${testCase.id}`);

    try {
      const result = await agent.invoke({
        userMessage: testCase.input,
      });

      const analysis = result.analysis;
      const response = result.response;

      const checks = [
        {
          name: "Structured analysis exists",
          passed: Boolean(analysis),
        },
        {
          name: "Summary is present",
          passed: Boolean(analysis?.summary?.trim()),
        },
        {
          name: "Investigation steps exist",
          passed:
            Array.isArray(analysis?.investigationSteps) &&
            analysis.investigationSteps.length > 0,
        },
        {
          name: "Evidence field is present",
          passed: Array.isArray(analysis?.evidence),
        },
        {
          name: "Formatted response exists",
          passed: Boolean(response?.trim()),
        },
       ...testCase.expectedKeywords.map((keywords, index) => ({
        name: `Expected behavior: ${testCase.expectedBehavior[index]}`,
        passed: keywords.some((keyword) =>
            response?.toLowerCase().includes(keyword.toLowerCase())
        ),
        })),
      ];

      for (const check of checks) {
        console.log(
          `${check.passed ? "PASS" : "FAIL"} - ${check.name}`
        );
      }

      const casePassed = checks.every((check) => check.passed);

      if (casePassed) {
        passed++;
      }

      console.log(
        `Result: ${casePassed ? "PASS" : "FAIL"} (${checks.filter((check) => check.passed).length}/${checks.length} checks)`
      );
    } catch (error) {
      console.error("Evaluation crashed:", error);
      console.log(`Result: FAIL (${testCase.id})`);
    }
  }

  console.log("\n========== Evaluation Summary ==========");
  console.log(`Total cases: ${evaluationDataset.length}`);
  console.log(`Passed cases: ${passed}`);
  console.log(`Failed cases: ${evaluationDataset.length - passed}`);
  console.log(
    `Pass rate: ${((passed / evaluationDataset.length) * 100).toFixed(1)}%`
  );
}

runEvaluation().catch(console.error);
