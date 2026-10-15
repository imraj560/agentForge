
import type { BaseMessage } from "@langchain/core/messages";

const MAX_HISTORY_CHARS = 6_000;
const MAX_MESSAGE_CHARS = 1_200;

function messageToText(message: BaseMessage): string {
  const type = message.getType();

  const rawContent =
    typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);

  const content = rawContent.slice(0, MAX_MESSAGE_CHARS);

  const toolCalls =
    "tool_calls" in message && Array.isArray(message.tool_calls)
      ? message.tool_calls.map((call) => ({
          name: call.name,
          args: call.args,
        }))
      : [];

  const toolCallText = toolCalls.length
    ? `\nRequested tools: ${JSON.stringify(toolCalls)}`
    : "";

  return `[${type}]\n${content}${toolCallText}`;
}

export function buildInvestigationContext(
  messages: BaseMessage[]
): string {
  const history = messages.map(messageToText);

  let selected: string[] = [];
  let totalChars = 0;

  // Work backwards to preserve the most recent interactions.
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];

    if (totalChars + entry.length > MAX_HISTORY_CHARS) {
      break;
    }

    selected.unshift(entry);
    totalChars += entry.length;
  }

  const omittedCount = history.length - selected.length;

  return [
    omittedCount > 0
      ? `[Context management: ${omittedCount} older messages omitted]`
      : "",
    ...selected,
  ]
    .filter(Boolean)
    .join("\n\n");
}
