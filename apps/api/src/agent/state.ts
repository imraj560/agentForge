import { z } from "zod";

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
});

export type InvestigationAnalysis = z.infer<
  typeof InvestigationSchema
>;

export interface AgentState {
  userMessage: string;
  analysis?: InvestigationAnalysis;
  response?: string;
}