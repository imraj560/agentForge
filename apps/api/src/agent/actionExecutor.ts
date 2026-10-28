import { evaluateActionPolicy } from "./actionPolicy";

export interface SimulatedActionResult {
  status: "simulated" | "blocked";
  result: string;
}

interface ExecuteActionOptions {
  actionType: string;
  proposedAction: string;
  approved?: boolean;
}

export function executeSimulatedAction({
  actionType,
  proposedAction,
  approved = false,
}: ExecuteActionOptions): SimulatedActionResult {
  // Defense in depth: enforce policy again at the execution boundary.
  const policy = evaluateActionPolicy(actionType);

  if (policy.decision === "deny") {
    return {
      status: "blocked",
      result: `Execution blocked by policy: ${policy.reason}`,
    };
  }

  if (policy.decision === "require_approval" && !approved) {
    return {
      status: "blocked",
      result: "Execution blocked: human approval is required.",
    };
  }

  // Only explicitly supported actions can reach the simulated executor.
  switch (actionType) {
    case "inspect_api_logs":
      return {
        status: "simulated",
        result:
          "Simulation completed: API log inspection was authorized. No external system was accessed.",
      };

    case "search_engineering_docs":
      return {
        status: "simulated",
        result:
          "Simulation completed: engineering documentation search was authorized. No external system was accessed.",
      };

    case "increase_api_rate_limit":
      return {
        status: "simulated",
        result: `Simulation completed: the following change was authorized but NOT applied: "${proposedAction}". No configuration was changed.`,
      };

    case "restart_api_instance":
      return {
        status: "simulated",
        result: `Simulation completed: the following restart was authorized but NOT performed: "${proposedAction}". No service was restarted.`,
      };

    case "delete_production_data":
    default:
      return {
        status: "blocked",
        result: "Execution blocked: this action is not supported by the simulated executor.",
      };
  }
}