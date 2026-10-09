
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools";
import type { AgentState } from "./state";

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: 0,
});

const modelWithTools = model.bindTools(tools);
const toolNode = new ToolNode(tools);

const analyze = async (state: AgentState) => {
  const response = await modelWithTools.invoke([
    new SystemMessage(`
You are AgentForge, a software investigation assistant.

Use the available tools when they can provide useful evidence.
For API 429 errors, consider searching engineering documentation
and inspecting the sample API logs.

Never claim mock data is real production evidence.
Do not invent findings that the tools did not return.
If a tool result is insufficient, explain the uncertainty.
    `.trim()),
    new HumanMessage(state.userMessage),
    ...state.messages,
  ]);

  return { messages: [response] };
};

const routeAfterAnalysis = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];

  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return "respond";
};

const respond = async (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];

  const response =
    typeof lastMessage?.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content ?? "");

  return { response };
};

const graph = new StateGraph({
  channels: {
    userMessage: {
      value: (_: string, next: string) => next,
      default: () => "",
    },
    messages: MessagesAnnotation.spec.messages,
    analysis: {
      value: (_: unknown, next: unknown) => next,
      default: () => undefined,
    },
    response: {
      value: (_: string | undefined, next: string) => next,
      default: () => undefined,
    },
  },
})
  .addNode("analyze", analyze)
  .addNode("tools", toolNode)
  .addNode("respond", respond)
  .addEdge(START, "analyze")
  .addConditionalEdges("analyze", routeAfterAnalysis, {
    tools: "tools",
    respond: "respond",
  })
  .addEdge("tools", "analyze")
  .addEdge("respond", END);

export const agent = graph.compile();