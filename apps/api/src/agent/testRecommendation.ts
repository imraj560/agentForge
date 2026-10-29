import "dotenv/config";
import { recommendAction } from "./graph";
import { evaluateActionPolicy } from "./actionPolicy";
import type { InvestigationAnalysis } from "./state";

const analysis: InvestigationAnalysis = {
  summary:
    "API requests intermittently return 429 errors across multiple instances.",
  possibleCauses: [
    "Rate-limit counters may not be shared across instances.",
    "The configured rate limit may be too restrictive.",
  ],
  investigationSteps: [
    "Inspect API logs across affected instances.",
    "Review the distributed rate-limiting configuration.",
  ],
  needsMoreInformation: true,
  evidence: [
    {
      finding:
        "Intermittent 429 responses have been reported across multiple instances.",
      source: "User-provided problem description",
      type: "observation",
    },
    {
      finding:
        "Independent rate-limit counters could cause inconsistent limits.",
      source: "docs/distributed-rate-limiting.md",
      type: "hypothesis",
    },
  ],
};

async function testRecommendation() {
  const result = await recommendAction({
    userMessage:
      "Investigate intermittent 429 errors across multiple API instances.",
    messages: [],
    analysis,
  });

  const recommendation = result.recommendation;

  console.log("\nRecommendation:");
  console.log(JSON.stringify(recommendation, null, 2));

  // Check the recommendation's structure.
  if (!recommendation.actionType) {
    throw new Error("Missing actionType.");
  }

  if (!recommendation.proposedAction.trim()) {
    throw new Error("Missing proposedAction.");
  }

  if (!recommendation.rationale.trim()) {
    throw new Error("Missing rationale.");
  }

  if (!Array.isArray(recommendation.basedOnEvidence)) {
    throw new Error("basedOnEvidence must be an array.");
  }

  if (typeof recommendation.requiresHumanApproval !== "boolean") {
    throw new Error("requiresHumanApproval must be a boolean.");
  }

  // Confirm that the recommendation's action is evaluated by policy.
  const policy = evaluateActionPolicy(recommendation.actionType);

  console.log("\nPolicy decision:");
  console.log(policy);

  if (
    recommendation.actionType === "delete_production_data" &&
    policy.decision !== "deny"
  ) {
    throw new Error("Policy failed to deny a prohibited action.");
  }

    // Verify that recommendations reference findings in the analysis.
  const availableFindings = new Set(
    analysis.evidence.map((item) => item.finding)
  );

  for (const finding of recommendation.basedOnEvidence) {
    if (!availableFindings.has(finding)) {
      throw new Error(
        `Recommendation references an unknown finding: ${finding}`
      );
    }
  }

  console.log("Evidence reference checks passed.");

  console.log("\nRecommendation structure and policy checks passed.");
}

testRecommendation().catch((error) => {
  console.error("Recommendation test failed:", error);
  process.exitCode = 1;
});

