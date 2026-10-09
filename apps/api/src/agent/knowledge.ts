
import { Document } from "@langchain/core/documents";

export const engineeringDocuments = [
  new Document({
    pageContent: `
API Rate Limiting

HTTP 429 indicates that a client has sent too many requests
within a given period. Investigate rate-limit thresholds,
request frequency, retry behavior, and response headers.

Clients should respect Retry-After when provided and use
exponential backoff with jitter when retrying transient failures.
    `.trim(),
    metadata: {
      title: "API Rate Limiting",
      source: "docs/api-rate-limiting.md",
    },
  }),

  new Document({
    pageContent: `
Distributed Rate Limiting

Applications running multiple instances need a consistent
rate-limit strategy. If each instance maintains its own
counter, requests distributed across instances may bypass
the intended global limit.

Consider a shared Redis counter and verify the rate-limit
key, expiration policy, and atomicity of updates.
    `.trim(),
    metadata: {
      title: "Distributed Rate Limiting",
      source: "docs/distributed-rate-limiting.md",
    },
  }),

  new Document({
    pageContent: `
Database Connection Pooling

Slow database requests can cause connections to remain busy,
increasing latency and queueing. Inspect pool utilization,
connection wait time, query latency, and timeout settings
before assuming the database itself is overloaded.
    `.trim(),
    metadata: {
      title: "Database Connection Pooling",
      source: "docs/database-pooling.md",
    },
  }),

  new Document({
    pageContent: `
API Error Investigation

When diagnosing an API error, correlate status codes with
timestamps, routes, request volume, and application instances.
Separate confirmed observations from possible explanations.
Do not conclude that a configuration is incorrect without
checking the relevant configuration or logs.
    `.trim(),
    metadata: {
      title: "API Error Investigation",
      source: "docs/api-error-investigation.md",
    },
  }),
];