# AgentForge

**An AI-powered investigation and action recommendation agent for debugging distributed systems.**

<sub>🚧 Work in Progress — Active Development</sub>

## Overview

AgentForge is an agentic AI project designed to investigate software infrastructure issues, gather relevant evidence, identify possible causes, and recommend appropriate actions.

Built around **LangGraph and TypeScript**, the system follows a structured investigation workflow rather than relying on a single LLM response.

The goal is to build an AI agent that can do more than explain technical problems: it should investigate them, reason from available evidence, recommend solutions, and eventually interact with external engineering tools under appropriate human supervision.

## How It Works

AgentForge currently follows this workflow:

1. **Investigation:** Receives an engineering issue and investigates it using available tools and contextual information.
2. **Evidence Gathering:** Retrieves relevant engineering documentation and inspects simulated API logs.
3. **Analysis:** Uses structured LLM output to identify possible causes and investigation steps.
4. **Action Recommendation:** Generates an actionable recommendation based on the investigation findings.
5. **Policy Evaluation:** Evaluates proposed actions against deterministic rules.
6. **Human Approval:** Requests human approval for actions that require authorization.
7. **Simulated Execution:** Executes permitted actions through a simulated action executor.

## Current Features

- LangGraph-based agent workflow.
- LLM-powered investigation using structured outputs.
- Tool-calling loop for gathering engineering evidence.
- Retrieval-Augmented Generation (RAG) for engineering documentation.
- Context management to limit the amount of information passed to the model.
- Evidence-source validation.
- Agent-generated action recommendations.
- Deterministic action policies (allow, require approval, deny).
- Human-in-the-loop approval workflow.
- Simulated action execution.
- Basic evaluation suite for testing investigation scenarios.

## Technology Stack

| Category | Technologies |
|---|---|
| Language | TypeScript |
| Agent Framework | LangChain.js, LangGraph.js |
| LLM | OpenAI |
| Validation | Zod |
| Retrieval | OpenAI Embeddings, MemoryVectorStore |
| API | Node.js, Express |
| Testing | Custom evaluation harness |

## Example Use Case

**Problem:** Investigate intermittent HTTP 429 errors across multiple API instances.

AgentForge aims to:

- Investigate the reported issue.
- Inspect available API logs.
- Retrieve relevant rate-limiting documentation.
- Identify potential causes.
- Produce structured findings and supporting evidence.
- Recommend an appropriate engineering action.
- Check whether the action is permitted or requires human approval.

For example, it may recommend inspecting traffic patterns or increasing an API rate limit, depending on the investigation findings and applicable policies.

## Getting Started

### Prerequisites

- Node.js
- npm
- OpenAI API key

### Installation

Clone the repository:

```bash
git clone https://github.com/imraj560/AgentForge.git
cd AgentForge
```

Install dependencies:

```bash
npm install
```

Configure your environment variables in the API application's `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

Start the API server from `apps/api`:

```bash
npx tsx src/server.ts
```

The API runs locally at:

```text
http://localhost:3000
```

Health check:

```text
GET /api/health
```

Main investigation endpoint:

```text
POST /api/agent
```

## Development Roadmap

AgentForge is actively evolving. The next development milestones include:

- [x] Core investigation workflow.
- [x] Tool-calling and evidence gathering.
- [x] RAG-based engineering documentation retrieval.
- [x] Structured investigation analysis.
- [x] Basic evaluation framework.
- [x] Evidence reference validation.
- [x] Agent-generated action recommendations.
- [x] Deterministic action policy evaluation.
- [x] Simulated action execution.
- [ ] Human-in-the-loop approval testing and refinement.
- [ ] Expanded recommendation and safety evaluations.
- [ ] Stronger evidence verification and guardrails.
- [ ] Read-only MCP integration.
- [ ] External engineering tool integrations.
- [ ] End-to-end testing, observability, and documentation.

## Project Status

This project is currently under active development.

Action execution is simulated. AgentForge does not currently make real infrastructure changes, modify production environments, or execute external engineering operations.

The longer-term objective is to evolve it into a more capable engineering investigation agent with controlled tool access, reliable evaluations, and human oversight.

## Author

**Raju Ahmed**

Software Engineer | Agentic AI | Full-Stack Development

- GitHub: [@imraj560](https://github.com/imraj560)
- Portfolio: [rajuahmed.bio](https://rajuahmed.bio)

---

*Built as an exploration of practical agentic AI systems, autonomous investigation workflows, and human-supervised engineering automation.*
