# ADR-0008: Custom 404, Enhanced RSS, Post Series, and Responsive Images

**Date**: 2026-02-25
**Status**: Accepted
**Deciders**: a.j.djalali

## Context

A blog audit identified four gaps beyond GEO/AEO improvements:

1. **404 page**: The theme's default 404 shows only "Page not found" with no search, recent posts, or branding — a dead end that loses visitors.
2. **RSS feed**: Hugo's built-in RSS template produces minimal XML with truncated summaries, no `<content:encoded>`, no author elements, and no category tags. AI crawlers and feed readers receive impoverished content.
3. **Responsive images**: Images lack `height: auto`, explicit `width`/`height` attributes, and `fetchpriority` hints, causing Cumulative Layout Shift (CLS) and suboptimal loading priority.
4. **Post series**: Related architecture posts have no formal grouping. The theme includes a series partial but the taxonomy is not enabled, and the partial only shows "See Also" links without part numbering.

## Decision

Implement all four features as additive template and CSS overrides. No existing image files are changed, and no existing functionality is removed.

### Custom 404

Override `layouts/404.html` with a branded page containing:
- Large "404" heading with gradient underline
- Search input reusing the existing search JS (`#search-input` / `#search-results`)
- 3 recent post cards reusing `.related-posts-grid` pattern
- "Back to Home" link

### Enhanced RSS

Create `layouts/_default/rss.xml` with `xmlns:content`, `xmlns:dc`, and `xmlns:atom` namespaces:
- Channel-level: title, description, language, managingEditor, atom:link self-reference, site image
- Per-item: `<content:encoded>` with full HTML, `<dc:creator>`, `<category>` per tag, RFC 822 dates

### Responsive Images

- CSS: `img { height: auto; }` globally; `.post-content img { border-radius: 4px; }`
- Render-image hook: `sizes` attribute; `<figure>` + `<figcaption>` when title is present
- Template images: explicit `width`/`height` on avatar, author bio, and nav signature images
- Above-fold images: `fetchpriority="high"`, no `loading="lazy"`

### Post Series

- Enable `series = "series"` taxonomy in `hugo.toml`
- Add `series: ["Software Architecture"]` to architecture posts
- Override `layouts/_partials/posts/series.html` with enhanced navigation: series icon, "Part X of Y" badge, ordered list with current-post highlighting, previous/next links

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| JavaScript-based 404 redirect | Automatic recovery | Opaque to users; bad for SEO |
| Full-text RSS via Hugo's default template | Zero work | No `<content:encoded>`, no author, no categories |
| Hugo image processing pipeline | WebP/AVIF, srcset | Requires image file changes; overkill for current image count |
| Tag-based grouping instead of series | Already exists | No ordering, no "Part X of Y", conflates topic with sequence |

## Consequences

### Positive
- 404 page retains visitors via search and recent posts
- RSS feed is consumption-ready for AI crawlers, Feedly, Inoreader, etc.
- CLS eliminated on above-fold images; better Core Web Vitals
- Series taxonomy provides clear reading order for multi-part content

### Negative
- Four template overrides to maintain when theme updates
- Series taxonomy requires manual frontmatter tagging on future posts

### Risks
- Search JS depends on `index.json` output — if JSON output is disabled, 404 search breaks

## Implementation Notes

- All changes are additive Hugo template/CSS overrides
- No migration needed — no data model changes
- Testing: `hugo --quiet` builds without errors; verify generated HTML for each feature
- Rollback: delete override files to revert to theme defaults
