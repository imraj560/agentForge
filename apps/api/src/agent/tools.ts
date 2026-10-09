
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { searchEngineeringKnowledge } from "./retriever";

export const searchEngineeringDocs = tool(
  async ({ query }) => {
    console.log(`[Tool] RAG search: ${query}`);

    const results = await searchEngineeringKnowledge(query);

    return JSON.stringify({
      query,
      resultCount: results.length,
      results,
    });
  },
  {
    name: "search_engineering_docs",
    description:
      "Search the engineering knowledge base using semantic retrieval. Use this to find relevant troubleshooting guides, architecture notes, and engineering practices.",
    schema: z.object({
      query: z.string().describe(
        "A question or search phrase describing the engineering information needed."
      ),
    }),
  }
);

export const inspectApiLogs = tool(
  async ({ statusCode }) => {
    console.log(`[Tool] Inspecting sample API logs: ${statusCode}`);

    // Mock logs. These are examples, not real production evidence.
    const logs = [
      {
        timestamp: "10:00:01",
        status: 200,
        endpoint: "/api/products",
        message: "Request successful",
      },
      {
        timestamp: "10:00:02",
        status: 429,
        endpoint: "/api/products",
        message: "Rate limit exceeded",
      },
      {
        timestamp: "10:00:03",
        status: 429,
        endpoint: "/api/products",
        message: "Rate limit exceeded",
      },
    ];

    const filtered = logs.filter(
      (log) => log.status === statusCode
    );

    return JSON.stringify({
      source: "mock_logs",
      records: filtered,
      note: "Simulated data for development; not actual server logs.",
    });
  },
  {
    name: "inspect_api_logs",
    description:
      "Inspect simulated API log records for a specific HTTP status code. Use this when diagnosing API errors. These are mock logs, not real production data.",
    schema: z.object({
      statusCode: z.number().int().min(100).max(599).describe(
        "HTTP status code to filter for, such as 429 or 500."
      ),
    }),
  }
);

export const tools = [
  searchEngineeringDocs,
  inspectApiLogs,
];