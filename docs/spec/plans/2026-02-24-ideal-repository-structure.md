# "The Ideal Repository Structure" Blog Post Plan

Created: 2026-02-24
Status: VERIFIED
Approved: Yes
Iterations: 0
Worktree: No

> **Status Lifecycle:** PENDING → COMPLETE → VERIFIED
> **Iterations:** Tracks implement→verify cycles (incremented by verify phase)

## Summary

**Goal:** Write a deep-dive blog post titled "The Ideal Repository Structure" that articulates why strict layer boundaries (entrypoint → controller → workflow → pipeline → service → repository → client → foundation) prevent architectural decay, with side-by-side Go and Python examples drawn from the author's `mothership` and `hpc` repositories.

**Architecture:** A single Markdown blog post with Hugo shortcode Mermaid diagrams. Mermaid rendering is already integrated (v9.3.0 via CDN, `{{<mermaid>}}` shortcode). The post will upgrade Mermaid to v11 for modern diagram features (C4 component diagrams, improved styling). The post follows the existing blog conventions: substantial depth (8,000–12,000 words), professional tone for senior engineers, code blocks in both Go and Python, and clear H2 section structure.

**Tech Stack:** Hugo, Markdown, Mermaid v11 (CDN upgrade in `baseof.html`), Go + Python code examples

## Architecture Diagram

```mermaid
graph TD
    subgraph "Blog Post Structure"
        A[Opening: The Problem with Flat Repos] --> B[Ardanlabs Inspiration]
        B --> C[The Layer Model]
        C --> D[Core Interfaces First]
        D --> E[Foundation Layer]
        E --> F[Client / Repository Layer]
        F --> G[Service / Pipeline / Workflow Layers]
        G --> H[Controller / Entrypoint Layers]
        H --> I[The Dependency Rule]
        I --> J[Monorepo Layout: Go vs Python]
        J --> K[Summary]
    end

    subgraph "Technical Changes"
        M[Upgrade Mermaid CDN v9→v11] --> N[Write Blog Post .md]
    end
```

## Scope

### In Scope

- New blog post at `content/posts/the-ideal-repository-structure.md`
- Mermaid CDN upgrade from v9.3.0 to v11 in `layouts/baseof.html`
- Mermaid diagrams within the post: layer dependency diagram, data flow diagram, directory tree comparison
- Side-by-side Go (mothership) and Python (hpc) code examples showing interface definitions, layer implementations, and DI wiring
- Proper frontmatter (title, date, description, tags, keywords)

### Out of Scope

- Changes to existing blog posts
- New CSS styling (existing styles sufficient)
- Theme modifications beyond Mermaid version bump
- New Hugo shortcodes
- Images or screenshots

## Prerequisites

- Mermaid v11 CDN URL and SRI hash (will be fetched during implementation)
- Existing Mermaid shortcode at `themes/coder/layouts/_shortcodes/mermaid.html` (already present)
- Hugo `unsafe = true` in Goldmark config (already set in `hugo.toml:19`)

## Context for Implementer

- **Patterns to follow:** Existing posts at `content/posts/decorator-pattern-observability-resilience.md` — same frontmatter format, H2 section structure, code-heavy style, professional tone
- **Conventions:**
  - Frontmatter: title (quoted), date (YYYY-MM-DD), draft (false), description (1-2 sentences), images (`images/og-default.png`), tags (lowercase array), keywords (array)
  - Slugs: kebab-case descriptive filenames
  - Code blocks: language-tagged (```go, ```python)
  - Mermaid: `{{<mermaid>}}...{{</mermaid>}}` shortcode (NOT fenced code blocks)
  - Links: external links use `target="_blank" rel="noopener noreferrer"` attributes
  - No emojis in content
- **Key files:**
  - `layouts/baseof.html:29-34` — Mermaid CDN script inclusion (upgrade target)
  - `themes/coder/layouts/_shortcodes/mermaid.html` — Mermaid shortcode definition
  - `hugo.toml` — Site configuration
- **Gotchas:**
  - Mermaid shortcode uses `.HasShortcode "mermaid"` for conditional loading — this is correct, don't break it
  - The baseof.html at project level overrides the theme's baseof.html — edit the project-level one, not the theme's
  - SRI hash must match the exact CDN file or browser will reject the script
- **Domain context:**
  - **Mothership** (`Personal/mothership`): Go monorepo — `pkg/go/core/interfaces/` (60+ interfaces), `pkg/go/foundation/` (utilities), `pkg/go/platform/` (request processing), `pkg/go/repos/` (data access), `apps/go/` (entrypoints). Uses Google Wire for DI, compile-time interface checks (`var _ Interface = (*Impl)(nil)`), independent module versioning.
  - **HPC** (`Personal/hpc`): Python monorepo — `src/interfaces/` (ABCs), `src/foundation/` (infra), `src/clients/` (decorator-wrapped), `src/repository/` (data access), `src/service/` (business logic), `src/pipeline/` (transformations), `src/workflow/` (orchestration), `src/controller/` (HTTP), `entrypoints/` (DI containers). Uses dependency-injector, builder pattern, generic types.
  - **Ardanlabs service** (`github.com/ardanlabs/service`): Original inspiration — `foundation/` → `business/` → `app/` three-layer architecture for Go services.

## Runtime Environment

- **Start command:** `hugo server -D` (dev mode with drafts)
- **Port:** 1313
- **Health check:** `curl http://localhost:1313/posts/the-ideal-repository-structure/`
- **Restart procedure:** Hugo live-reloads on file save

## Progress Tracking

**MANDATORY: Update this checklist as tasks complete. Change `[ ]` to `[x]`.**

- [x] Task 1: Upgrade Mermaid CDN to v11
- [x] Task 2: Write blog post

**Total Tasks:** 2 | **Completed:** 2 | **Remaining:** 0

## Implementation Tasks

### Task 1: Upgrade Mermaid CDN to v11

**Objective:** Update the Mermaid library from v9.3.0 to v11 (latest stable) for modern diagram features and improved rendering.

**Dependencies:** None

**Files:**

- Modify: `layouts/baseof.html` (lines 29-34, Mermaid script tag)

**Key Decisions / Notes:**

- Use the latest v11.x release from jsDelivr CDN
- Generate a new SRI integrity hash for the updated file
- Keep the same conditional loading pattern (`{{ if .HasShortcode "mermaid" }}`)
- Mermaid v11 uses ESM by default — may need to adjust the script tag or use the UMD/IIFE bundle from CDN
- v11 `mermaid.initialize()` API is backward-compatible with `{ startOnLoad: true }`
- Test with `hugo server -D` and a page containing a Mermaid diagram

**Definition of Done:**

- [ ] `layouts/baseof.html` references Mermaid v11 CDN with valid SRI hash
- [ ] `hugo server -D` builds without errors
- [ ] A test page with `{{<mermaid>}}graph TD; A-->B{{</mermaid>}}` renders the diagram in-browser

**Verify:**

- `hugo --minify 2>&1 | grep -c "Error"` — returns 0 (no build errors)
- Open `http://localhost:1313/posts/the-ideal-repository-structure/` and confirm Mermaid diagrams render

### Task 2: Write the Blog Post

**Objective:** Write the full blog post "The Ideal Repository Structure" — a deep-dive for senior engineers arguing that strict layer boundaries prevent architectural decay, with Go + Python examples from mothership and hpc.

**Dependencies:** Task 1

**Files:**

- Create: `content/posts/the-ideal-repository-structure.md`

**Key Decisions / Notes:**

- **Thesis:** Strict layer boundaries (entrypoint → ... → repository) are the single most important structural decision. Layers enforce the dependency rule: code can only depend downward, never upward or sideways.
- **Structure (H2 sections):**

  1. **Opening (no heading):** The problem — most repos start clean and rot. Flat structures, circular imports, "just put it somewhere" culture. Layers are the antidote.

  2. **The Inspiration: Ardanlabs Service** — Credit to Bill Kennedy's `ardanlabs/service` template. Three-layer model: `foundation/` → `business/` → `app/`. What it got right (dependency direction, clear boundaries). Where the author's structure evolved beyond it (more granular layers, multi-language, interface-first).

  3. **The Layer Model** — Present the full layer stack with a Mermaid diagram. Each layer gets a paragraph explaining its responsibility and why it exists as a separate boundary:
     - **Core Interfaces** — Contracts before implementations. Single source of truth.
     - **Foundation** — Cross-cutting infrastructure (logger, metrics, cache, resilience). Independently versioned modules.
     - **Clients** — External system integration (databases, APIs, message brokers). Wrapped with decorator stacks.
     - **Repositories** — Data access abstraction. Generic `Repository[T, P, ID]`.
     - **Services** — Business logic. Stateless. Depends on repositories and clients.
     - **Pipelines** — Sequential data transformations. `Pipeline[In, Out]`.
     - **Workflows** — Multi-step orchestration. Coordinates services and pipelines.
     - **Controllers** — HTTP/gRPC handlers. Thin adapter between transport and workflows.
     - **Entrypoints** — DI wiring and bootstrap. The composition root.

  4. **The Dependency Rule** — Mermaid diagram showing allowed vs. forbidden dependency directions. A controller can call a workflow, but a workflow cannot import from a controller. A service can use a repository interface, but a repository cannot depend on a service. Enforcement mechanisms: Go import restrictions, Python import linting, directory structure.

  5. **Interface-First Design** — Show the Go interface definition pattern (`pkg/go/core/interfaces/repository.go`) and the Python ABC equivalent (`src/interfaces/repository.py`). Show compile-time verification in Go (`var _ Interface = (*Impl)(nil)`) and runtime protocol checks in Python. Explain why defining interfaces in a dedicated package prevents import cycles.

  6. **The Monorepo Layout** — Side-by-side directory trees for Go (mothership) and Python (hpc). Highlight the parallel structure: both have interfaces → foundation → clients → repos → services → entrypoints, just with language-appropriate conventions (`pkg/go/` vs `src/`, `apps/go/` vs `entrypoints/`).

  7. **Decorator Composition Across Layers** — Brief section connecting to the existing decorator post. Show how the decorator stack (logging → metrics → retry → circuit breaker) wraps each layer boundary. Link to the decorator post for the full pattern.

  8. **What the Structure Prevents** — Concrete failure modes that layers eliminate: circular imports, God services, infrastructure leaking into business logic, untestable code, deployment coupling.

  9. **Summary** — The ideal repository structure is not about naming conventions. It is about enforcing dependency direction through physical boundaries. Layers are the mechanism.

- **Code examples** — Draw directly from mothership and hpc. Show real interface definitions, real directory trees, real DI wiring. Not toy examples.
- **Mermaid diagrams** — 2-3 diagrams: (1) full layer stack with dependency arrows, (2) allowed vs forbidden dependencies, (3) Go vs Python directory comparison or data flow through layers.
- **Tone** — Opinionated, direct, professional. First-person where the author's journey matters (Ardanlabs origin story). Third-person for technical exposition.
- **Length target** — 8,000–12,000 words. Comparable to the decorator and dependency-to-lambda posts.
- **Cross-references** — Link to the decorator pattern post for the full decorator explanation.

**Definition of Done:**

- [ ] Post renders at `http://localhost:1313/posts/the-ideal-repository-structure/` without errors
- [ ] All Mermaid diagrams render correctly in-browser
- [ ] All code blocks have correct language tags and syntax highlighting
- [ ] Frontmatter has all required fields (title, date, draft, description, images, tags, keywords)
- [ ] Post contains at least 2 Mermaid diagrams
- [ ] Post contains Go and Python code examples side-by-side
- [ ] Post links to the decorator pattern post
- [ ] Post credits ardanlabs/service as inspiration

**Verify:**

- `hugo --minify 2>&1 | grep -c "Error"` — returns 0 (no build errors)
- `grep -c "{{<mermaid>}}" content/posts/the-ideal-repository-structure.md` — returns ≥ 2
- `grep -c '```go' content/posts/the-ideal-repository-structure.md` — returns ≥ 3
- `grep -c '```python' content/posts/the-ideal-repository-structure.md` — returns ≥ 3

## Testing Strategy

- **Build verification:** `hugo --minify` completes with no errors
- **Visual verification:** `hugo server -D` — navigate to the post URL, confirm layout, Mermaid rendering, code highlighting, and dark mode
- **Link verification:** All internal links resolve (decorator pattern post link)
- **Frontmatter verification:** Post appears in the homepage card grid and posts listing

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Mermaid v11 breaking change in API | Low | Med | Fall back to v10.x if v11 init API changed; test before writing diagrams |
| Mermaid v11 SRI hash mismatch | Med | Low | Generate hash from actual CDN file, verify in browser console |
| Post too long / unfocused | Med | Med | Target 10K words; outline structure enforces focus; cut sections that don't serve the thesis |
| Code examples too detailed | Low | Low | Show interface + one implementation, not full files; link to repos for complete source |

## Open Questions

- None — requirements are clear.

### Deferred Ideas

- Companion post on "The Decorator Pattern at Every Layer Boundary" (builds on existing decorator post)
- Companion post on "Testing Strategies for Layered Architectures" (unit per layer, integration across layers)
- Interactive diagram version using D2 or Structurizr instead of Mermaid
