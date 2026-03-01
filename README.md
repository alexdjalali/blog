# a.j.djalali

Personal academic blog built with [Hugo](https://gohugo.io/) and the [Coder](https://github.com/luizdepra/hugo-coder) theme. Deployed to GitHub Pages at [alexdjalali.github.io](https://alexdjalali.github.io/).

## Structure

```
content/
  about.md                  Landing page with avatar and post cards
  cv.md                     Resume / CV with timeline styling
  publications.md           Publications, conferences, dissertation, and patents
  posts/                    Blog posts (LaTeX math via KaTeX, collapsible code blocks)
assets/
  css/custom.css            Site-wide custom styles (cards, timeline, code blocks, dark mode)
  js/clickable-list.js      Clickable list item handler
  js/collapsible-code.js    Expandable code blocks with copy-to-clipboard
layouts/
  posts/list.html           Posts index with year/month timeline grouping
  cv/single.html            CV page layout
  _partials/                Head extensions, JSON-LD, custom icons
static/
  bib/                      25 individual BibTeX files (publications, dissertation, patents)
  images/                   Avatar, favicon, OG images
hugo.toml                   Site configuration, nav, social links, KaTeX, Google Analytics
```

## Features

- **LaTeX math rendering** via KaTeX with Goldmark passthrough delimiters (`$...$` inline, `$$...$$` display)
- **Collapsible code blocks** with language headers and copy-to-clipboard
- **Pinterest-style post cards** on the homepage (2-column CSS grid)
- **Timeline-styled lists** for publications, CV entries, and posts index
- **Downloadable BibTeX** for all publications and patents
- **Dark mode** with `prefers-color-scheme` auto-detection
- **JSON-LD** structured data for SEO
- **Google Analytics** (G-R50JVPX7MP)

## Local Development

```sh
hugo server -D
```

Requires Hugo v0.124.0+ (extended). Current: v0.156.0.

## Deployment

Pushes to `main` deploy automatically via GitHub Pages. The site is served from the `public/` directory at `https://alexdjalali.github.io/`.
