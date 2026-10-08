# Public site shell

All public pages use the canonical authoring-time shell. Do not copy Navigation or Footer markup into a page.

- Navigation partial: `shared/site-navigation.html`
- Footer partial: `shared/site-footer.html`
- Shared styles: `assets/site-navigation.css` and `assets/site-footer.css`
- Renderer: `node scripts/render-site-shell.mjs`

Every rendered public page contains these markers exactly once:

```html
<!-- SITE_NAVIGATION:START -->
<!-- SITE_NAVIGATION:END -->
<!-- SITE_FOOTER:START -->
<!-- SITE_FOOTER:END -->
```

The renderer fails on missing, duplicate, or reversed markers. Its one-time `--bootstrap` mode creates those markers only from a single existing page shell; normal rendering requires the contract already to exist.

The renderer sets `aria-current="page"` only for Blog and Get Started. Homepage anchor links remain local anchors; other public pages use the homepage URLs. New public pages must add the shared-shell markers and shared CSS links through the renderer, never a page-specific Navigation/Footer copy.

When publishing a Blog article, `scripts/publish-approved-blog.mjs` renders the article through the same shell renderer before writing it. Run `node scripts/validate-site.mjs` after any shell or public-page update.
