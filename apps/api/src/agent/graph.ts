
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END } from "@langchain/langgraph";
import {
  InvestigationSchema,
  type AgentState,
} from "./state";

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: 0,
});

const structuredModel = model.withStructuredOutput(
  InvestigationSchema
);

const analyze = async (state: AgentState) => {
  const analysis = await structuredModel.invoke([
    {
      role: "system",
      content: `
You are AgentForge, a software investigation assistant.

Analyze the user's reported software problem.
Identify plausible causes without presenting them as confirmed facts.
Provide practical investigation steps.
If critical evidence is missing, indicate that more information is needed.
Do not claim to have inspected logs, code, or infrastructure.
      `.trim(),
    },
    {
      role: "user",
      content: state.userMessage,
    },
  ]);

  return { analysis };
};

const respond = async (state: AgentState) => {
  const analysis = state.analysis;

  if (!analysis) {
    throw new Error("Investigation analysis is missing.");
  }

  const response = [
    `Summary: ${analysis.summary}`,
    "",
    "Possible causes:",
    ...analysis.possibleCauses.map((cause) => `- ${cause}`),
    "",
    "Investigation steps:",
    ...analysis.investigationSteps.map((step) => `- ${step}`),
    "",
    `More information needed: ${
      analysis.needsMoreInformation ? "Yes" : "No"
    }`,
  ].join("\n");

  return { response };
};

const graph = new StateGraph<AgentState>({
  channels: {
    userMessage: {
      value: (_, next) => next,
      default: () => "",
    },
    analysis: {
      value: (_, next) => next,
      default: () => undefined,
    },
    response: {
      value: (_, next) => next,
      default: () => undefined,
    },
  },
})
  .addNode("analyze", analyze)
  .addNode("respond", respond)
  .addEdge(START, "analyze")
  .addEdge("analyze", "respond")
  .addEdge("respond", END);

export const agent = graph.compile();

/**Test Code to see things are in order */
// const result = await agent.invoke({

//     userMessage:"Why is my API returning 429 errors?"

// })

// console.log(result)