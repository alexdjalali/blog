# ADR-0007: GEO/AEO Enhancements

**Date**: 2026-02-25
**Status**: Accepted
**Deciders**: a.j.djalali

## Context

The blog has solid traditional SEO: Open Graph meta tags, Twitter Cards, canonical URLs, JSON-LD structured data (WebSite, BlogPosting, BreadcrumbList), XML sitemap, and RSS feed. However, the structured data lacks depth for **GEO** (Generative Engine Optimization — being surfaced by Google AI Overviews, Perplexity) and **AEO** (Answer Engine Optimization — being cited by ChatGPT, Claude, Copilot).

AI systems increasingly rely on rich structured data, author credibility signals, and machine-readable site summaries to decide which sources to cite. The existing author schema is minimal (name, URL, job title, two social links), BlogPosting lacks publisher/language/word count metadata, and there is no `llms.txt` file for LLM crawlers.

## Decision

Enrich the existing structured data and add a machine-readable site summary:

1. **Enhanced Person schema** — Add `description`, `alumniOf` (Stanford, Northwestern, University of Amsterdam), `affiliation.url`, and Google Scholar to `sameAs`
2. **Enhanced BlogPosting schema** — Add `publisher`, `wordCount`, `inLanguage`, `isPartOf` (Blog), and `speakable` (SpeakableSpecification with CSS selectors)
3. **`llms.txt`** — Static file following the [llmstxt.org](https://llmstxt.org/) specification with curated blog summary, post links with descriptions, author pages, external profiles, and license
4. **`robots.txt` directive** — `Llms-txt:` pointer after the existing `Sitemap:` line

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| **FAQPage schema** | Strong AI Overview presence for Q&A queries | Posts don't have FAQ sections; would require new shortcodes for marginal benefit |
| **ScholarlyArticle type** | Stronger academic credibility signal | Content is technical/opinionated, not peer-reviewed; BlogPosting with strong author credentials is more honest |
| **Auto-generated llms.txt** | No manual updates on new posts | llmstxt.org spec recommends curation; auto-generation may include draft/irrelevant content |
| **Organization as publisher** | Common pattern for multi-author blogs | This is a personal blog; Person as publisher is more accurate |

## Consequences

### Positive
- Richer author credibility signals for AI citation (academic credentials, multiple institution affiliations, Google Scholar profile)
- BlogPosting schema includes publisher, word count, language, and speakable selectors — all signals used by AI Overviews
- `llms.txt` provides a curated, machine-readable site summary for LLM crawlers
- All changes are additive — no existing functionality modified or removed
- Zero runtime cost — all changes are in build-time templates or static files

### Negative
- `llms.txt` requires manual update when new posts are published
- `Llms-txt:` robots.txt directive is non-standard (ignored by traditional crawlers, adopted by some AI crawlers)
- `speakable` CSS selectors assume the current theme's DOM structure

### Risks
- Theme updates could change CSS class names, breaking speakable selectors (mitigation: selectors use stable theme classes `.post-title` and `.post-content`)
- llmstxt.org spec is early-stage and may evolve (mitigation: current format is simple markdown, easy to update)

## Implementation Notes

- **Files changed**: `layouts/_partials/head/json-ld.html`, `layouts/robots.txt`
- **Files created**: `static/llms.txt`
- **Testing**: `hugo --quiet` build, inspect generated `<head>` for JSON-LD, verify `llms.txt` at `/blog/llms.txt`, verify `robots.txt` includes `Llms-txt:` directive
- **Validation**: Google Rich Results Test for schema validation
