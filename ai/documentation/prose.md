# PROSE: AI-Native Agentic Development for Claude in VSCode

> Reference guide for Claude when creating custom agents, workflows, and
> instruction primitives. Adapted from the
> [PROSE specification](https://danielmeppiel.github.io/awesome-ai-native/docs/prose/)
> by Daniel Meppiel, tailored for Claude Code running in VSCode.

---

## 1. The PROSE Framework

PROSE is an architectural style for reliable AI-assisted development. Five
constraints — independent of any specific model — govern how agents consume
context, scope work, compose primitives, enforce safety, and inherit guidance.

| Constraint                   | Principle                              | Property Gained            |
| ---------------------------- | -------------------------------------- | -------------------------- |
| **P**rogressive Disclosure   | Reveal complexity gradually            | Efficient context use      |
| **R**educed Scope            | Match task size to context capacity    | Manageable complexity      |
| **O**rchestrated Composition | Chain simple primitives, not monoliths | Flexibility, reusability   |
| **S**afety Boundaries        | Define agent autonomy explicitly       | Reliability, verifiability |
| **E**xplicit Hierarchy       | Layer guidance from global to local    | Modularity, inheritance    |

### Foundational Axioms

1. **Context is finite and fragile** — Context windows have hard limits; attention
   degrades under load. Treat context as a scarce resource.
2. **Context must be explicit** — Agents only see externalized knowledge.
   Undocumented decisions are invisible.
3. **Output is probabilistic** — Models interpret, they do not execute.
   Reliability is architected through boundaries and guardrails, not assumed.

---

## 2. The Five Constraints in Detail

### 2.1 Progressive Disclosure

Load information on demand, not upfront. Use indexes and summaries before full
detail. In Claude Code this means:

- Use `CLAUDE.md` files at each directory level so context loads only when
  Claude works in that directory.
- Reference files via markdown links as lazy-loading context pointers.
- Keep agent prompts focused — link to spec files rather than inlining them.

### 2.2 Reduced Scope

Match task size to context capacity. Complex work must be decomposed into
right-sized subtasks, each with fresh context.

- Use the `Task` tool to spawn subagents with clean context per phase.
- Split work into plan → implement → test phases.
- Prefer multiple focused agent invocations over a single mega-prompt.

### 2.3 Orchestrated Composition

Simple things compose; complex things collapse. Small, chainable units remain
debuggable while mega-prompts become unpredictable.

- Build agents from composable primitives (instruction files, specs, prompts).
- Chain agent phases: architect → implementor → reviewer.
- Each primitive does one thing well and can be reused across workflows.

### 2.4 Safety Boundaries

Define what an agent can and cannot do. Non-determinism plus unlimited
authority creates unpredictable behavior.

- Constrain each agent's available tools to its domain.
- Use explicit CAN / CANNOT lists in agent definitions.
- Gate destructive actions behind human approval.
- Architect agents cannot modify code; implementors cannot push to remote.

**Deterministic grounding:** Ground probabilistic output in deterministic tool
execution. Code execution, file operations, API calls, and test runs transform
agent claims into verifiable actions. In Claude Code, tools like `Bash`,
`Read`, `Edit`, and `Grep` act as truth anchors — always prefer tool-verified
results over model assertions.

**Risk-based autonomy levels:** Calibrate agent freedom to match risk:

| Risk Level | Examples                         | Autonomy                                        |
| ---------- | -------------------------------- | ----------------------------------------------- |
| Low        | Docs, tests, UI polish           | Full agent autonomy, post-review                |
| Medium     | Business logic, APIs, DB changes | Agent implements, human validates before merge  |
| High       | Auth, payments, encryption       | Human-guided only, no autonomous implementation |

### 2.5 Explicit Hierarchy

Domain-specific rules inherit from and may override global principles.

- Root `CLAUDE.md` provides project-wide principles.
- Subdirectory `CLAUDE.md` files add domain-specific context.
- Path-scoped rules in `.claude/rules/` load based on file patterns.
- This prevents context pollution while enabling specialization.

### How the Constraints Relate

The five constraints form an integrated system — each governs a different
dimension of agent interaction:

- **Progressive Disclosure** determines _what_ enters context.
- **Reduced Scope** determines _how much_ the agent handles at once.
- **Orchestrated Composition** determines _how primitives combine_.
- **Safety Boundaries** determine _what the agent can do_.
- **Explicit Hierarchy** determines _which rules apply_.

---

## 3. Three Disciplines of Practice

### 3.1 Prompt Engineering

Converts natural language into structured, repeatable instructions.

**Key techniques for Claude in VSCode:**

| Technique           | How to Apply                                           |
| ------------------- | ------------------------------------------------------ |
| Context Loading     | Use markdown links to inject relevant files/specs      |
| Structured Thinking | Use headers, bullets, and numbered steps for reasoning |
| Role Activation     | Open agent prompts with "You are a [role] specialist"  |
| Tool Integration    | Specify which tools the agent may use                  |
| Precision Language  | Eliminate ambiguity; say exactly what to do and not do |
| Validation Gates    | Insert STOP points requiring human review              |

### 3.2 Agent Primitives

Composable, bounded configuration files that systematize prompt engineering.

**Claude Code primitive mapping:**

| PROSE Primitive                   | Claude Code Equivalent             | Location                       |
| --------------------------------- | ---------------------------------- | ------------------------------ |
| Instructions (`.instructions.md`) | `CLAUDE.md` files                  | Root and subdirectories        |
| Path-scoped rules                 | `.claude/rules/*.md`               | Pattern-matched loading        |
| Chat Modes / Custom Agents        | `.claude/agents/*.md`              | Agent definitions              |
| Agentic Workflows                 | Skills / Task tool prompts         | `.claude/agents/`, skill files |
| Specifications                    | `.spec.md` or plan files           | `ai/specs/` or similar         |
| Memory Files                      | Auto-memory in `.claude/projects/` | Persistent across sessions     |
| Context Helpers (`.context.md`)   | Summary/index docs                 | Referenced via markdown links  |

**Context helpers** are concise summaries or indexes of larger bodies of
knowledge (architecture docs, API references, pattern libraries). They
accelerate agent onboarding by providing pre-digested context that reduces
search time and preserves context window space. Create them for any domain
where agents repeatedly need orientation before starting work.

### 3.3 Context Engineering

Strategic management of Claude's context window to maximize performance.

**Techniques:**

1. **Session Splitting** — Use distinct `Task` subagents for different phases
   to maintain fresh context.
2. **Modular Rule Loading** — Path-scoped rules in `.claude/rules/` load only
   when editing matching files.
3. **Hierarchical Discovery** — Claude walks the directory tree loading the
   closest `CLAUDE.md`, avoiding global context pollution.
4. **Memory-Driven Development** — Use `.claude/projects/*/memory/` for
   persistent knowledge across sessions.
5. **Cognitive Focus** — Each custom agent receives only domain-relevant
   context and tools.

### 3.4 Agentic Workflows

Agentic workflows combine all three disciplines into complete, end-to-end
processes. In Claude Code, these are agent definition files in
`.claude/agents/` that orchestrate multiple primitives into unified processes.

**Key characteristics:**

- **Full orchestration** — Combine prompt engineering, agent primitives, and
  context engineering into a single coherent process.
- **Validation gates** — Include mandatory human checkpoints at critical
  decision points using `AskUserQuestion` or plan mode.
- **Self-improving** — Include steps to update memory files and rules based on
  execution outcomes.
- **Execution flexibility** — Can run interactively or delegate phases to
  `Task` subagents.

**Example flow for a feature workflow agent:**

1. Load specification via markdown link → context enters progressively.
2. Spawn architect subagent (read-only) → produces implementation plan.
3. Human reviews plan via `EnterPlanMode` → validation gate.
4. Spawn implementor subagent (edit + test) → builds to plan.
5. Spawn reviewer subagent (analysis) → validates against spec criteria.
6. Update memory files with patterns learned → compound intelligence.

---

## 4. Building Custom Agents for Claude Code

### 4.1 Agent File Structure

Custom agents live in `.claude/agents/` as markdown files:

```
.claude/agents/
├── architect.md          # Planning only — no code changes
├── frontend-engineer.md  # UI specialist — no backend access
├── backend-engineer.md   # API specialist — no UI modification
├── technical-writer.md   # Docs only — no code execution
├── code-review.md        # Review focus — read-only analysis
└── implement-feature.md  # Full implementation from spec
```

### 4.2 Agent Definition Template

Each agent definition should include:

```markdown
# Agent Name

> One-line description of this agent's purpose.

## Role

You are a [domain] specialist. Your expertise covers [specific areas].

## Capabilities (CAN)

- List specific actions this agent is permitted to take
- Reference specific tools available (Read, Edit, Write, Bash, etc.)

## Boundaries (CANNOT)

- List explicit restrictions
- Tools this agent must NOT use
- Domains outside its scope

## Context Loading

- Reference relevant CLAUDE.md files
- Link to specs, standards, or patterns this agent needs
- Specify which directories/files are in scope

## Workflow

1. Step-by-step process the agent follows
2. Include validation gates where human review is required
3. Specify output format and deliverables

## Output Requirements

- What the agent must produce
- Quality criteria and checklists
```

### 4.3 Domain Boundary Examples

| Agent             | CAN                                       | CANNOT                                  |
| ----------------- | ----------------------------------------- | --------------------------------------- |
| Architect         | Read code, search, propose plans          | Edit files, run commands, push code     |
| Frontend Engineer | Edit templates/CSS/TS in `frontend/`      | Modify `backend/`, run migrations       |
| Backend Engineer  | Edit routes/services/models in `backend/` | Modify templates, touch `frontend/src/` |
| Technical Writer  | Read all code, write docs                 | Edit source code, run tests             |
| Code Reviewer     | Read code, analyze diffs                  | Edit code, create commits               |

### 4.4 Safety Boundary Enforcement

- **Tool constraints**: List allowed tools explicitly in agent prompts.
- **Path constraints**: Specify which directories the agent may modify.
- **Action constraints**: Gate destructive operations (delete, push, deploy)
  behind human confirmation.
- **Scope constraints**: Prevent scope creep by defining what is out of bounds.

---

## 5. Specification-Driven Development

Specifications bridge planning and implementation, transforming ideas into
blueprints executable by any agent.

### 5.1 Specification Template

```markdown
# Feature: [Name]

## Problem Statement

What problem does this solve? Why now?

## Approach

Implementation strategy and key architectural decisions.

## Implementation Requirements

### Components

- [ ] Component A — `path/to/file.ts` — description
- [ ] Component B — `path/to/file.ts` — description

### API Contracts (if applicable)

- `POST /api/v1/resource` → `{ field: type }` → `201 Created`

## Validation Criteria

- [ ] Unit tests pass with >90% coverage on new code
- [ ] E2E tests cover happy path and primary error cases
- [ ] No new lint warnings
- [ ] Types are strict — no `any`

## Handoff Checklist

- [ ] Architecture review approved
- [ ] Security implications assessed
- [ ] Database migration reviewed (if applicable)
```

### 5.2 Spec-First Workflow

1. **Architect agent** creates the specification from a feature idea.
2. Human reviews and approves the spec.
3. **Implementor agent** builds to the spec with fresh context.
4. **Reviewer agent** validates the output against spec criteria.
5. Patterns and learnings are captured in memory files.

---

## 6. Agentic Workflow Patterns

### 6.1 Phased Execution

Break complex features into phases, each with its own agent session:

```
Phase 1: Research & Plan   → Architect agent (read-only)
Phase 2: Implement         → Engineer agent (edit + test)
Phase 3: Review & Refactor → Reviewer agent (analysis + suggestions)
Phase 4: Document          → Writer agent (docs only)
```

Each phase starts with fresh context, preventing attention degradation.

### 6.2 Parallel Delegation

For independent components, spawn multiple agents simultaneously:

```
Spec decomposes into:
  ├── Agent A: Auth middleware (independent)
  ├── Agent B: Token service (independent)
  └── Agent C: User sync (depends on B — runs after)
```

Use the `Task` tool with `run_in_background: true` for parallel work.

### 6.3 Validation Gates

Insert human checkpoints at critical decision points:

- After architecture decisions, before implementation begins.
- After implementation, before committing.
- After tests pass, before pushing to remote.

In Claude Code, use `AskUserQuestion` or plan mode (`EnterPlanMode`) for these
gates.

### 6.4 Agent Delegation Strategies

Choose execution strategy based on control needs and workflow maturity:

| Strategy                  | When to Use                             | Claude Code Mechanism                      |
| ------------------------- | --------------------------------------- | ------------------------------------------ |
| **Local interactive**     | New workflows, high-risk, learning      | Direct agent conversation                  |
| **Background delegation** | Independent components, proven patterns | `Task` tool with `run_in_background: true` |
| **Hybrid orchestration**  | Complex features, mixed risk levels     | Local planning + background implementation |

**Decision guide:**

- First time with a workflow → local interactive for maximum learning.
- Well-established workflow with clear spec → background delegation for speed.
- Complex multi-component feature → hybrid: plan locally, delegate components
  in parallel, integrate and review locally.

**Context preservation across delegation:** When delegating to background
subagents, pass complete context via the prompt parameter — specs, relevant
file paths, constraints, and output expectations. Each subagent starts with
fresh context, so explicit handoff is essential.

---

## 7. Spec-Driven Workflow Phases

For team-scale or complex features, structure work through explicit phases.
Each phase produces an artifact that becomes input for the next, creating
natural coordination boundaries and validation gates.

| Phase            | Purpose                            | Claude Code Implementation             |
| ---------------- | ---------------------------------- | -------------------------------------- |
| **Constitution** | Define project-wide standards once | Root `CLAUDE.md` + `.claude/rules/`    |
| **Specify**      | Capture what to build and why      | `.spec.md` in `ai/specs/`              |
| **Plan**         | Determine how to build it          | Architect agent (read-only) → plan doc |
| **Tasks**        | Decompose into parallel work units | GitHub Issues or task lists in spec    |
| **Implement**    | Build to spec with fresh context   | Engineer agents per component          |

**Validation gates between phases:**

- **Plan → Tasks**: Human approves architecture before decomposition.
- **Tasks → Implement**: Human confirms task isolation and dependencies.
- **Implement → Merge**: Human reviews agent output against spec criteria.

When creating agents that orchestrate multi-step features, encode these phases
into the agent workflow. Each phase can be a separate `Task` subagent with
fresh context, preventing attention degradation across the full lifecycle.

---

## 8. Anti-Patterns to Avoid

| Anti-Pattern            | Problem                                                              | Remedy                                           |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| **Monolithic prompts**  | All instructions in one block; unpredictable changes                 | Decompose into layered primitives                |
| **Context dumping**     | Loading everything upfront wastes capacity                           | Progressive disclosure — load on demand          |
| **Undocumented rules**  | Invisible to agents; causes silent failures                          | Externalize all rules into files                 |
| **Unbounded agents**    | Unlimited authority + non-determinism = chaos                        | Explicit CAN/CANNOT boundaries                   |
| **Flat instructions**   | No specialization across domains                                     | Hierarchical `CLAUDE.md` + path rules            |
| **Stale context**       | Outdated guidance produces outdated results                          | Review and update primitives regularly           |
| **Skipping specs**      | Jumping to code without a plan                                       | Always spec first for non-trivial work           |
| **Scope creep**         | Task grows beyond context capacity; agent loses earlier instructions | Decompose upfront; use fresh subagents per phase |
| **No validation gates** | Trusting agent output without review                                 | Add human checkpoints at key moments             |

---

## 9. PROSE Maturity Model

Use this to assess and improve your agent infrastructure:

| Level                | Description                                           | Characteristics                         |
| -------------------- | ----------------------------------------------------- | --------------------------------------- |
| **0 — Ad-hoc**       | One-off prompts, no persistent structure              | No reusability, inconsistent results    |
| **1 — Structured**   | Persistent instructions guide behavior                | `CLAUDE.md` files, basic rules          |
| **2 — Composed**     | Multiple primitives with explicit boundaries          | Custom agents, path-scoped rules        |
| **3 — Orchestrated** | Multi-agent coordination with fresh context per phase | Phased workflows, spec-driven dev       |
| **4 — Distributed**  | Primitives packaged for cross-project reuse           | Shared agent libraries, team governance |

**Level progression insights:**

- **0 → 1**: Recognize that instructions should persist beyond a single session.
- **1 → 2**: Recognize that primitives compose — structure enables reliability.
- **2 → 3**: Recognize that complex work requires coordination across agents
  and phases.
- **3 → 4**: Recognize that well-structured primitives are inherently
  shareable — the "npm moment" where quality structure enables ecosystem reuse.

---

## 10. Claude Code-Specific Implementation Checklist

### Foundation (Level 1)

- [ ] Root `CLAUDE.md` with project-wide principles
- [ ] Subdirectory `CLAUDE.md` files for each domain (frontend, backend, shared)
- [ ] Auto-memory configured for persistent learning

### Composition (Level 2)

- [ ] Custom agents in `.claude/agents/` with domain boundaries
- [ ] Path-scoped rules in `.claude/rules/` for file-pattern guidance
- [ ] Specification templates in `ai/specs/`

### Orchestration (Level 3)

- [ ] Phased workflows using `Task` tool subagents
- [ ] Spec-first development process with constitution → specify → plan → tasks → implement phases
- [ ] Validation gates at architecture, implementation, and review phases
- [ ] Risk-based autonomy levels defined per component type
- [ ] Memory files updated with patterns and learnings

### Distribution (Level 4)

- [ ] Reusable agent definitions shared across projects
- [ ] Team governance and review processes
- [ ] Primitive libraries with versioning

---

## 11. Key Principles Summary

1. **Context is scarce** — Load only what is needed, when it is needed.
2. **Compose, do not monolith** — Small focused agents beat mega-prompts.
3. **Bound every agent** — Explicit tools, paths, and action constraints.
4. **Spec before code** — Write the blueprint, then build to it.
5. **Gate critical moments** — Human review at architecture and merge points.
6. **Hierarchy over flatness** — Global rules inherited, local rules specialized.
7. **Fresh context per phase** — Spawn new agents to avoid attention degradation.
8. **Capture learnings** — Update memory and primitives after each workflow.
9. **Ground in determinism** — Use tool execution and tests to verify probabilistic output.
10. **Iterate the primitives** — Agent definitions, specs, and rules improve with use.

---

_Source: [Awesome AI Native — PROSE Specification](https://danielmeppiel.github.io/awesome-ai-native/docs/prose/) by Daniel Meppiel, licensed under CC BY-SA 4.0._
