# AI Prompt Orchestrator CLI

**Seamlessly merge local context with AI prompts for flawless automation**

[![npm version](https://img.shields.io/npm/v/ai-prompt-orchestrator-cli.svg)](https://www.npmjs.com/package/ai-prompt-orchestrator-cli)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yourusername/ai-prompt-orchestrator-cli/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/ai-prompt-orchestrator-cli.svg)](https://nodejs.org/)
[![build status](https://img.shields.io/github/actions/workflow/status/yourusername/ai-prompt-orchestrator-cli/ci.yml?branch=main)](https://github.com/yourusername/ai-prompt-orchestrator-cli/actions)
[![coverage](https://img.shields.io/codecov/c/github/yourusername/ai-prompt-orchestrator-cli.svg)](https://codecov.io/gh/yourusername/ai-prompt-orchestrator-cli)

---

## Installation

```bash
npm install -g ai-prompt-orchestrator-cli
```

## Quick Start

```bash
# Create a prompt template (prompt.txt)
cat > prompt.txt <<'EOF'
Write a summary for the following article:

{{article}}
EOF

# Create a JSON context file (ctx.json)
cat > ctx.json <<'EOF'
{
  "article": "Artificial intelligence is transforming software development..."
}
EOF

# Run the orchestrator
ai-prompt-orchestrator --prompt prompt.txt --context ctx.json
```

The command prints the fully‑rendered prompt to **stdout**.

---

## Architecture Flowchart

```mermaid
flowchart TD
    A[CLI Invocation] --> B{Is Prompt Remote?}
    B -- Yes --> C[HTTP(S) Fetch]
    B -- No --> D[Read Local File]
    C --> E[Load Template]
    D --> E[Load Template]
    E --> F[Read Context JSON]
    F --> G[Placeholder Substitution]
    G --> H{Output Destination}
    H -- stdout --> I[Print]
    H -- file --> J[Write File]
    I --> K[Exit 0]
    J --> K[Exit 0]
```

---

## Test Results

## 🧪 Real-World Test Telemetry

> [!NOTE]
> Verified automatically using Node.js native test runner (`node:test` & `node:assert/strict`).

```bash
▶ node --test
✔ CLI substitutes placeholders from JSON context (114.447213ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 221.666441
```

---

## License

MIT License (c) 2026 Suman Mehta