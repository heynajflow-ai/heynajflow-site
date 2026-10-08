# Blog article migration result

Status: Local-only migration; owner review required before any checkpoint or deployment.

## Inventory and parity

| Article | Class | Migrated? | Content parity | SEO parity | Schema parity | TOC | Responsive | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| after-hours-lead-capture-chatbot | C | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Class C structural mapping recorded below. |
| advanced-chatbot-features-customer-loyalty | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| how-advanced-chatbot-features-build-unshakeable-customer-loyalty | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| how-chatbots-elevate-customer-experience | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| 24-7-chatbot-support-uninterrupted-customer-service | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| chatbot-cost-savings-customer-support | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| ai-chatbot-personalization-customer-experience | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| ultimate-guide-24-7-chatbot-support-customer-expectations | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| always-there-for-you-chatbot-customer-support-benefits | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| calculating-chatbot-roi-customer-service | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| ai-chatbot-benefits-for-customers | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| heynaj-conversational-ux-chatbot-effectiveness | B | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison | C | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Class C structural mapping recorded below. |
| ai-chatbot-crm-helpdesk-integration-guide | A | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |
| what-is-rag-how-heynaj-flow-uses-your-business-knowledge | A | Yes | PASS | PASS | PASS | Present / PASS | PASS: 1440, 1280, 1024, 768, 390, 320 | Canonical shell replaces legacy presentation only. |

## Class C structural before/after plans

### after-hours-lead-capture-chatbot

| Old block | New template location |
| --- | --- |
| Legacy hero figcaption | Canonical cover figcaption |
| Featured-playbook heading hierarchy, ordered flow, blockquote, and lists | Canonical article body with original IDs and semantic elements retained |
| Legacy aside navigation | Canonical TOC generated from the same original topic links |
| FAQ and references; no standalone legacy closing CTA | Canonical FAQ and Sources sections; no new CTA payload introduced |

### choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison

| Old block | New template location |
| --- | --- |
| Legacy hero figcaption | Canonical cover figcaption |
| Comparison framing, headings, blockquote, lists, and inline links | Canonical article body with original semantic HTML and link destinations retained |
| Legacy aside navigation | Canonical TOC generated from the same original topic links |
| FAQ, references, and closing CTA | Canonical FAQ, Sources, and CTA sections |

## Guardrails retained

- No registry content ID, slug, canonical URL, or publishing metadata is changed.
- Legacy presentation classes are removed from migrated semantic content.
- Opening paragraphs use the canonical article-introduction treatment and are not copied with legacy visual classes, inline font weight, fixed width, uppercase styling, or manual visual line breaks.
- No article is committed, pushed, deployed, or published by this migration.

## Final cleanup recheck

- Mobile containment: all 15 migrated articles were rechecked visually and by rendered-element geometry at 390px and 320px. The reading grid already uses a zero-minimum flexible track and the article flow is now protected through generic minimum-width zero, maximum-width 100%, and border-box containment on semantic article descendants. No global overflow hiding, fixed text widths, manual line breaks, truncation, or font-size reduction was added.
- Legacy presentation audit: article-content wrappers contain no residual inline width, font-weight, text-transform, white-space, or legacy layout attributes. Semantic article structure, IDs, headings, lists, quotes, sources, and externally sourced citations remain intact.
- Product-truth audit: the following 13 articles changed their legacy canonical CTA from “Start a free pilot conversation” at /book/ to “Get Started.” at /get-started/: 24-7-chatbot-support-uninterrupted-customer-service, advanced-chatbot-features-customer-loyalty, ai-chatbot-benefits-for-customers, ai-chatbot-crm-helpdesk-integration-guide, ai-chatbot-personalization-customer-experience, always-there-for-you-chatbot-customer-support-benefits, calculating-chatbot-roi-customer-service, chatbot-cost-savings-customer-support, choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison, heynaj-conversational-ux-chatbot-effectiveness, how-advanced-chatbot-features-build-unshakeable-customer-loyalty, how-chatbots-elevate-customer-experience, and ultimate-guide-24-7-chatbot-support-customer-expectations. The RAG article already used a current product CTA and was unchanged.
- After-hours product-truth corrections: removed the obsolete 14-day pilot, $18.99 monthly, $99.99 six-month, current-plan, pricing/pilot-source, and pilot-preparation claims. The visible cost section, FAQ, TOC label, structured-data FAQ, source reference, and closing CTA now state that HeyNaj Flow is free to use; there is no pilot period or paid feature tier; optional coffee support does not change access.
- No other editorial rewrite was made. These intentional product-truth corrections are the only content and first-party destination changes after the original parity pass.
