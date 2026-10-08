# Blog article template migration plan

## Scope and guardrails

This is a local review plan for the canonical future article template. It does not
republish or alter any of the fifteen published article URLs. The approved
homepage (`ad84a36f48c50a2610dbd9f0f43cdbc2c46a73de`) and approved Blog index
(`14d8eee14c11274f146b2303a8977aa7c6098460`) remain the visual source of truth.

## Canonical template architecture

The canonical source is `templates/blog-article.html`, with article-scoped
presentation in `assets/blog-article.css`. It provides, in order:

1. The shared public navigation from `assets/site-navigation.css` and
   `assets/site-navigation.js`.
2. A centered article hero containing the existing type, title, summary, date,
   and read-time payloads.
3. The one required, payload-driven article cover image.
4. A reading-width article flow with an optional desktop sticky table-of-
   contents rail and a normal-flow mobile table of contents.
5. Existing generated introduction, key takeaways, article body and heading IDs,
   followed by the required topic divider.
6. Existing FAQ, sources, and approved closing-CTA payloads.
7. The approved public footer and the same direct asynchronous HeyNaj loader
   used by the homepage and Blog index.

## Visual changes

The template adopts the approved public-page system: Be Vietnam Pro, a warm
off-white continuous page canvas, #FFDC32 accents, halo-dot eyebrows, restrained
rounded surfaces, soft shadows, and reduced-motion support. Long-form prose is
kept at a readable column width rather than spanning the page. Takeaways and the
closing CTA are contained light surfaces; FAQ and sources are quieter end matter.

## SEO and content contracts preserved

The canonical template retains the replacement slots and generated contract for:

- canonical and robots metadata;
- Open Graph and Twitter metadata;
- BlogPosting and FAQPage JSON-LD payloads;
- the `heynaj-publish-marker`;
- exactly one article H1 and exactly one cover image;
- article type, title, summary, published date, read time, cover alt text, and
  approved CTA;
- generated heading IDs, `toc-topic` links, and the article-divider boundary
  used by validation;
- key takeaways, FAQ content, source links, and the article body.

No article wording, slug, publish date, canonical URL, hero-image payload, or
registry record is changed by this work.

## Representative output review

| Article | Why reviewed | Observed migration consideration |
| --- | --- | --- |
| `what-is-rag-how-heynaj-flow-uses-your-business-knowledge` | Newest approved n8n output and current publish marker | Reference fixture for the local preview; complete generated metadata, TOC, takeaways, FAQ, sources, and CTA contract. |
| `ai-chatbot-crm-helpdesk-integration-guide` | Earlier approved n8n output | Current-publisher family, but still needs payload and visual regression verification before any re-render. |
| `after-hours-lead-capture-chatbot` | Featured, older local playbook | Bespoke/legacy supplemental structure needs a one-off source-to-payload review. |
| `choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison` | Older comparison page | Comparison-specific framing and possible tables/claims need manual preservation review. |
| `ai-chatbot-personalization-customer-experience` | Richer older article | Confirms legacy pages may contain richer navigation/end-matter combinations that require contract comparison. |

## Classification and safe migration method

| Article / slug | Current structure type | Safe to re-render directly? | Risks to preserve | Recommended migration method |
| --- | --- | --- | --- | --- |
| What Happens to Leads After Business Hours? / `after-hours-lead-capture-chatbot` | C — bespoke featured playbook | No | Legacy supplemental blocks, Article/BlogPosting differences, FAQ, hero, sources, anchors | Build a one-off structured payload from the existing page; compare visible content, metadata, schemas, and anchors before a local render. |
| Unlock Lasting Loyalty: Advanced Chatbot Features for Deeper Customer Engagement / `advanced-chatbot-features-customer-loyalty` | B — legacy, structurally compatible | Not without review | Canonical/meta, generated heading IDs, FAQ/source parity | Extract to the current payload shape, render locally, then run DOM and metadata diff checks. |
| How Advanced Chatbot Features Build Unshakeable Customer Loyalty / `how-advanced-chatbot-features-build-unshakeable-customer-loyalty` | B — legacy, structurally compatible | Not without review | H2/H3 anchors, TOC and FAQ/schema parity | Extract and validate as a single local pilot after a structural comparison. |
| How Chatbots Elevate the Customer Experience / `how-chatbots-elevate-customer-experience` | B — legacy, structurally compatible | Not without review | Existing description, dates, sources, navigation/end matter | Extract current content into a local fixture; retain URL and all metadata verbatim. |
| 24/7 Chatbot Support: Uninterrupted Customer Service / `24-7-chatbot-support-uninterrupted-customer-service` | B — legacy, structurally compatible | Not without review | Heading IDs, FAQ answers, citations | Local one-page render and parity checklist before migration. |
| Chatbot Cost Savings in Customer Support / `chatbot-cost-savings-customer-support` | B — legacy, structurally compatible | Not without review | Numerical claims, sources, title/deck metadata | Local render plus source and claim review; do not editorially rewrite. |
| AI Chatbot Personalization and Customer Experience / `ai-chatbot-personalization-customer-experience` | B — legacy with richer article navigation | Not without review | Supplemental navigation, TOC/topic IDs, FAQ and sources | Map each existing navigation/end-matter element before one-page pilot rendering. |
| The Ultimate Guide to 24/7 Chatbot Support and Customer Expectations / `ultimate-guide-24-7-chatbot-support-customer-expectations` | B — legacy authority guide | Not without review | Long-form hierarchy, hero, sources, FAQ schema | Local payload conversion with heading/TOC snapshot comparison. |
| Always There for You: Chatbot Customer Support Benefits / `always-there-for-you-chatbot-customer-support-benefits` | B — legacy, structurally compatible | Not without review | Metadata, citations, heading anchors | Local render with canonical/OG/schema and anchor validation. |
| Calculating Chatbot ROI for Customer Service / `calculating-chatbot-roi-customer-service` | B — legacy authority guide | Not without review | Calculations, tables or lists, source links, FAQs | Manually verify semantic tables/lists and cited claims in a local render. |
| AI Chatbot Benefits for Customers / `ai-chatbot-benefits-for-customers` | B — legacy, structurally compatible | Not without review | Existing summary, FAQ, sources, ID parity | Local payload conversion and regression checklist. |
| HeyNaj Conversational UX and Chatbot Effectiveness / `heynaj-conversational-ux-chatbot-effectiveness` | B — legacy, structurally compatible | Not without review | Product-language accuracy, CTA, FAQs, metadata | Local render after preservation review; retain original wording. |
| Choosing Your AI Assistant: HeyNaj vs Chatbot.com Feature Comparison / `choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison` | C — bespoke comparison article | No | Comparison framing, tables, external references, legacy special blocks | Create a purpose-built payload mapping and run a manual line-by-line content/SEO comparison. |
| AI Chatbot CRM & Helpdesk Integration Guide / `ai-chatbot-crm-helpdesk-integration-guide` | A — current-template compatible | Pilot only | Current marker/schema, TOC IDs, media and sources | Use as the first local pilot; compare before and after output, then approve separately. |
| What Is RAG? How HeyNaj Flow Uses Your Business Knowledge / `what-is-rag-how-heynaj-flow-uses-your-business-knowledge` | A — current-template compatible | Pilot only | Current marker/schema, TOC IDs, FAQs, sources and cover image | Used only as a non-production preview fixture in this pass; do not overwrite the published route. |

## Proposed migration order

1. Keep all public routes untouched until template approval.
2. Run the RAG article as a local, non-public pilot and compare DOM, metadata,
   JSON-LD, visible content, IDs, sources, and screenshots.
3. Run the CRM/helpdesk article as a second local current-template pilot.
4. Migrate one structurally compatible legacy article at a time, starting with a
   short cluster article; obtain visual and parity approval each time.
5. Handle the featured playbook and comparison article last, through explicit
   one-off payload mappings.
6. Only after individual approval should a separate task decide whether any
   published files are updated. Never batch-regenerate all fifteen.

## Articles requiring special handling

- `after-hours-lead-capture-chatbot`: featured-playbook/legacy structure and
  supplemental content require a bespoke mapping.
- `choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison`:
  comparison-specific content, tables, wording, and references need manual
  semantic review.
- `ai-chatbot-personalization-customer-experience`: richer navigation/end matter
  must be mapped rather than discarded.
- `calculating-chatbot-roi-customer-service`: validate any table/list semantics
  and numerical-source relationships manually.

## Verification checklist for every future migration

1. Confirm the slug and canonical URL are identical.
2. Compare title, meta description, robots, Open Graph, Twitter metadata, and
   publish marker.
3. Validate BlogPosting and FAQPage JSON-LD where present.
4. Confirm exactly one H1 and one cover image with the same source and alt text.
5. Compare article text, heading order, heading IDs, TOC links, takeaways, FAQ,
   sources, CTA, dates, read time, and all supplemental blocks.
6. Check desktop and 390/320px layouts, no horizontal overflow, navigation,
   footer, and widget loading.
7. Run `node scripts/validate-site.mjs` and inspect the exact git diff before
   requesting owner approval.
