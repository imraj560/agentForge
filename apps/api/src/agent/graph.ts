import { StateGraph, START, END } from "@langchain/langgraph";
import type { AgentState } from "./state";

const analyze = async (state: AgentState) => {
  console.log("Analyzing:", state.userMessage);

  return {};
};

const respond = async (state: AgentState) => {
  return {
    response: `I received your request: "${state.userMessage}"`,
  };
};

const graph = new StateGraph<AgentState>({
  channels: {
    userMessage: {
      value: (_, next) => next,
      default: () => "",
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