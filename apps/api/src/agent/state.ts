import { z } from "zod";
import type { BaseMessage } from "@langchain/core/messages";

export const InvestigationSchema = z.object({

  summary: z.string().describe(
    "A concise summary of the reported software problem."
  ),
  possibleCauses: z
    .array(z.string())
    .describe("Potential causes that should be investigated."),
  investigationSteps: z
    .array(z.string())
    .describe("Concrete steps to investigate the problem."),
  needsMoreInformation: z
    .boolean()
    .describe("Whether more information is needed to investigate reliably."),
  evidence: z.array(
  z.object({
    finding: z.string(),
    source: z.string(),
    type: z.enum(["observation", "hypothesis"]),
  })
  ),  
});

  export const ActionRecommendationSchema = z.object({
    actionType: z
      .enum([
        "search_engineering_docs",
        "inspect_api_logs",
        "increase_api_rate_limit",
        "restart_api_instance",
        "delete_production_data",
      ])
      .describe("The type of action recommended by the agent."),

    proposedAction: z
      .string()
      .min(1)
      .describe("A concrete description of the recommended action."),

    rationale: z
      .string()
      .min(1)
      .describe("Why this action is appropriate given the investigation findings."),

    basedOnEvidence: z
      .array(z.string())
      .describe("Evidence findings that support this recommendation."),

    requiresHumanApproval: z
      .boolean()
      .describe("Whether the recommendation should require human approval."),
  });

  export type ActionRecommendation = z.infer<
    typeof ActionRecommendationSchema
  >;


export type InvestigationAnalysis = z.infer<
  typeof InvestigationSchema
>;

export interface AgentState {
  userMessage: string;
  messages: BaseMessage[]; //stores conversation between tools and llm
  analysis?: InvestigationAnalysis;
  response?: string;
}