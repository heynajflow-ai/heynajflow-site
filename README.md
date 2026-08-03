# HeyNaj Flow website

Static website for https://heynajflow.com.

## Structure

- Existing pages are preserved at their current URLs.
- Blog landing page: `/blog/`
- Future articles: `/blog/<slug>/index.html`
- Sitemap: `/sitemap.xml`
- Crawler rules: `/robots.txt`
- Reusable article reference: `templates/blog-article.html`

## Publishing

The intended flow is:

1. n8n generates an approved article.
2. n8n creates `blog/<slug>/index.html`.
3. n8n updates `blog/index.html` and `sitemap.xml`.
4. n8n commits the files to GitHub.
5. Netlify deploys the repository.

The current Netlify production site is not changed by this repository until it is explicitly connected to Git-based deployment.
