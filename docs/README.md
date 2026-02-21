# docs/

Project documentation for the Blog.

## Structure

| Directory/File | Description                                              |
| -------------- | -------------------------------------------------------- |
| `plans/`       | Implementation plans (spec-driven development)           |
| `spec/`        | Epic specification files (4 epics covering Epics 1-4)    |
| `rfp/`         | Planned stories with acceptance criteria (11 stories)    |
| `adr/`         | Completed story documentation                            |
| `debug/`       | Debugging guides                                         |

## Epic Overview

| Epic | Name                            | Stories  | Points |
| ---- | ------------------------------- | -------- | ------ |
| 1    | Project Foundation & Deployment | 1.1--1.3 | 8      |
| 2    | Site Configuration              | 2.1--2.3 | 7      |
| 3    | Content Creation                | 3.1--3.4 | 10     |
| 4    | Launch & Verification           | 4.1      | 3      |

**Total:** 11 stories, 28 points

## Story Workflow

Stories follow a lifecycle from `rfp/` to `adr/`:

1. Epic specifications live in `spec/` (e.g., `spec/epic-01-project-foundation.md`)
2. Detailed acceptance criteria live in `rfp/X.Y-story-name.md`
3. When implemented, the file moves to `adr/X.Y-story-name.md` with implementation notes
4. Implementation plans live in `plans/` (e.g., `plans/2026-02-21-personal-blog.md`)
