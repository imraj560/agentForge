import {
  Annotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import {
  InvestigationSchema,
  type InvestigationAnalysis,
} from "./state";
import { tools } from "./tools";

import { buildInvestigationContext } from "./context";

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: 0,
}); 

const modelWithTools = model.bindTools(tools);

const structuredModel = model.withStructuredOutput(
  InvestigationSchema
);

const State = Annotation.Root({

  userMessage: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),

  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) =>
      current.concat(Array.isArray(update) ? update : [update]),
    default: () => [],
  }),

  analysis: Annotation<InvestigationAnalysis | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),

  response: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),

});


const investigate = async (state: typeof State.State) => {
  const context = buildInvestigationContext(state.messages);

  const result = await modelWithTools.invoke([
    new SystemMessage(`
You are AgentForge, a software investigation assistant.

Investigate the user's software problem using available tools.
Use documentation and diagnostic logs when relevant.

The investigation context may omit older interactions.
Use the supplied context as prior evidence, but do not assume
that omitted messages contain no important information.

Never invent tool results or claim to have inspected unavailable systems.
Distinguish observations from hypotheses.
    `.trim()),

    new HumanMessage(
      `Original problem:\n${state.userMessage}\n\n` +
      `Recent investigation context:\n${context || "No previous tool interactions."}`
    ),
  ]);

  console.log("Messages in state:", state.messages.length);
  console.log("Context characters:", context.length);

  return { messages: [result] };
};


const routeAfterInvestigation = (
  state: typeof State.State
) => {
  const lastMessage = state.messages.at(-1);

  if (lastMessage?.tool_calls?.length) {
    return "tools";
  }

  return "analyze";
};

const toolNode = new ToolNode(tools);

const analyze = async (state: typeof State.State) => {
  const result = await structuredModel.invoke([
    new SystemMessage(`
Produce a structured software investigation report.

Base findings on the tool results available in the conversation.
Use the original user request to determine what matters.
Keep possible causes separate from supported evidence.
For each evidence item, identify the actual source returned by a tool.
If evidence is insufficient, state the uncertainty and request
more information where appropriate.
Never invent sources, logs, or confirmed root causes.
    `.trim()),
    new HumanMessage(
      `Original problem:\n${state.userMessage}\n\n` +
      `Investigation history and tool results:\n` +
      state.messages
        .map((message) => {
          const content =
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content);

          return `${message.getType()}: ${content}`;
        })
        .join("\n\n")
    ),
  ]);

  return { analysis: result };
};

const respond = async (state: typeof State.State) => {
  const analysis = state.analysis;

  console.log(
  "Analysis received by respond:",
  JSON.stringify(analysis, null, 2)
);

  if (!analysis) {
    throw new Error("Investigation analysis is missing.");
  }

  const response = [
    `Summary: ${analysis.summary}`,
    "",
    "Possible causes:",
    ...analysis.possibleCauses.map((item) => `- ${item}`),
    "",
    "Evidence:",
    ...((analysis.evidence ?? []).length
      ? (analysis.evidence ?? []).map(
          (item) => `- ${item.finding} (Source: ${item.source})`
        )
      : ["- No supporting evidence was identified."]),
    "",
    "Investigation steps:",
    ...analysis.investigationSteps.map((item) => `- ${item}`),
    "",
    `More information needed: ${
      analysis.needsMoreInformation ? "Yes" : "No"
    }`,
  ].join("\n");

  return { response };
};

export const agent = new StateGraph(State)
  .addNode("investigate", investigate)
  .addNode("tools", toolNode)
  .addNode("analyze", analyze)
  .addNode("respond", respond)
  .addEdge(START, "investigate")
  .addConditionalEdges("investigate", routeAfterInvestigation, {
    tools: "tools",
    analyze: "analyze",
  })
  .addEdge("tools", "investigate")
  .addEdge("analyze", "respond")
  .addEdge("respond", END)
  .compile();
