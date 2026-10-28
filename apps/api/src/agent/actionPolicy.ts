export type ActionPolicyDecision =
  | "allow"
  | "require_approval"
  | "deny";

export type ActionType =
  | "search_engineering_docs"
  | "inspect_api_logs"
  | "increase_api_rate_limit"
  | "restart_api_instance"
  | "delete_production_data";

export interface ActionPolicyResult {
  decision: ActionPolicyDecision;
  reason: string;
}

const ACTION_POLICIES: Record<ActionType, ActionPolicyResult> = {
  search_engineering_docs: {
    decision: "allow",
    reason: "Searching engineering documentation is read-only.",
  },

  inspect_api_logs: {
    decision: "allow",
    reason: "Inspecting API logs is read-only.",
  },

  increase_api_rate_limit: {
    decision: "require_approval",
    reason: "Changing rate limits can affect API availability and traffic.",
  },

  restart_api_instance: {
    decision: "require_approval",
    reason: "Restarting an instance can interrupt active requests.",
  },

  delete_production_data: {
    decision: "deny",
    reason: "Deleting production data is prohibited by the current policy.",
  },
};

export function evaluateActionPolicy(
  actionType: string
): ActionPolicyResult {
  if (
    !Object.prototype.hasOwnProperty.call(ACTION_POLICIES, actionType)
  ) {
    return {
      decision: "deny",
      reason: "Unknown actions are denied by default.",
    };
  }

  return ACTION_POLICIES[actionType as ActionType];
}