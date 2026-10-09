
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const searchEngineeringDocs = tool(
  async ({ query }) => {
    console.log(`[Tool] Searching engineering docs: ${query}`);

    // Mock knowledge base for learning tool calling.
    return JSON.stringify([
      {
        title: "API Rate Limiting",
        content:
          "HTTP 429 responses commonly indicate that a rate limit was exceeded. Check rate-limit configuration, request volume, and retry behavior.",
      },
      {
        title: "Distributed Rate Limiting",
        content:
          "When an application runs multiple instances, verify whether rate-limit counters are shared or maintained separately by each instance.",
      },
    ]);
  },
  {
    name: "search_engineering_docs",
    description:
      "Search internal engineering documentation for information relevant to a software issue. Use this when documentation could help answer the question.",
    schema: z.object({
      query: z.string().describe(
        "A concise search query describing what information is needed."
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