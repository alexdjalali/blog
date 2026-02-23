# docs/

Project documentation for the Blog.

## Structure

| Directory/File | Description                                              |
| -------------- | -------------------------------------------------------- |
| `adr/`         | Architecture Decision Records (5 ADRs)                   |
| `spec/epics/`  | Epic specification files (7 epics)                       |
| `spec/stories/`| Stories with acceptance criteria (16 stories)            |
| `spec/plans/`  | Implementation plans (6 plans, all verified)             |
| `spec/arch/`   | Architecture diagrams                                    |

## Epic Overview

| Epic | Name                            | Stories  | Points | Status   |
| ---- | ------------------------------- | -------- | ------ | -------- |
| 1    | Project Foundation & Deployment | 1.1--1.3 | 8      | Complete |
| 2    | Site Configuration              | 2.1--2.3 | 7      | Complete |
| 3    | Content Creation                | 3.1--3.4 | 10     | Complete |
| 4    | Launch & Verification           | 4.1      | 3      | Complete |
| 5    | White/Black Academic Theme      | 5.1--5.2 | 4      | Complete |
| 6    | Standard Blog Features          | 6.1--6.3 | 8      | Complete |
| 7    | Timeline & UI Refinements       | 7.1--7.2 | 5      | Complete |

**Total:** 16 stories, 45 points

## ADR Index

| #    | Title                                        | Status   |
| ---- | -------------------------------------------- | -------- |
| 0001 | Blog Design — White/Black Academic Theme     | Accepted |
| 0002 | Standard Blog Features                       | Accepted |
| 0003 | Timeline Components & UI Refinements         | Accepted |
| 0004 | Publication Abstract Toggle                  | Accepted |
| 0005 | Publication & Site-Wide UI Refinements       | Accepted |

## Plan Index

| Plan                                    | Epic(s) | Status   |
| --------------------------------------- | ------- | -------- |
| 2026-02-21 Personal Blog                | 1--4    | Verified |
| 2026-02-22 SCSS Color Overrides         | 5       | Verified |
| 2026-02-22 Visual QA                    | 5       | Verified |
| 2026-02-22 Standard Blog Features       | 6       | Verified |
| 2026-02-23 Timeline & UI Refinements    | 7       | Verified |
| 2026-02-23 Publication Abstract Toggle  | —       | Verified |

## Architecture

See [spec/arch/blog-architecture.md](spec/arch/blog-architecture.md) for the full system architecture diagram covering the Hugo build pipeline, override strategy, content types, deployment, and interactive components.

## Story Workflow

Stories follow a spec-driven development lifecycle:

1. Epic specifications live in `spec/epics/` (e.g., `epic-01-project-foundation.md`)
2. Detailed acceptance criteria live in `spec/stories/X.Y-story-name.md`
3. Implementation plans live in `spec/plans/` (dated by creation)
4. Architecture decisions are recorded in `adr/` before implementation
