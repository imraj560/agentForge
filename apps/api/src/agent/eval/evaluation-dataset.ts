
export interface EvaluationCase {
  id: string;
  input: string;
  expectedBehavior: string[];
  expectedKeywords: string[][];
}

export const evaluationDataset: EvaluationCase[] = [
  {
    id: "rate-limit-001",
    input:
      "Investigate intermittent 429 errors across multiple API instances",
    expectedBehavior: [
      "Investigate rate limiting",
      "Consider shared counters across instances",
      "Check client retry behavior",
    ],
    expectedKeywords: [
      ["rate limit", "429"],
      ["redis", "shared counter", "distributed rate"],
      ["retry", "backoff", "retry-after"],
    ],
  },
  {
    id: "database-001",
    input:
      "Our API is experiencing high latency and database connection timeouts",
    expectedBehavior: [
      "Investigate database connection pooling",
      "Check query latency and connection utilization",
      "Avoid assuming the database is overloaded without evidence",
    ],
    expectedKeywords: [
      ["connection pool", "connection pooling"],
      ["query latency", "connection utilization", "connection wait"],
      ["evidence", "verify", "investigate"],
    ],
  },
  {
    id: "api-errors-001",
    input:
      "Our API started returning intermittent 500 errors after deployment",
    expectedBehavior: [
      "Investigate application errors",
      "Correlate errors with timestamps and routes",
      "Avoid claiming a confirmed root cause without evidence",
    ],
    expectedKeywords: [
      ["application error", "500", "internal server error"],
      ["timestamp", "route"],
      ["evidence", "confirmed", "possible cause"],
    ],
  },
];
