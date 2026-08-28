// Shared by the site and embedded verbatim in the n8n publisher Code node.
// This is a whitelist: review links, tokens, emails and private research never leave n8n.
export function normalizeApprovedBlog(input) {
  const text = (value, label) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing approved ${label}`);
    return value;
  };
  const array = (value, label) => {
    let result = value;
    for (let depth = 0; depth < 8 && typeof result === 'string'; depth++) {
      try { result = JSON.parse(result); } catch { throw new Error(`Invalid saved ${label} JSON`); }
    }
    if (!Array.isArray(result)) throw new Error(`Missing approved ${label} array; restore the saved draft before publishing`);
    return result;
  };
  const url = (value, label) => {
    const result = text(value, label);
    if (!/^https:\/\/[^\s<>"'@]+$/i.test(result)) throw new Error(`Invalid HTTPS ${label}`);
    return result;
  };
  const content_id = text(input.content_id, 'content_id');
  if (!/^[a-zA-Z0-9_-]+$/.test(content_id)) throw new Error('Invalid content_id');
  const slug = text(input.slug, 'slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid blog slug');
  const key_takeaways = array(input.key_takeaways || input.takeaways, 'Key Takeaways')
    .map(item => text(typeof item === 'string' ? item : item?.text ?? item?.takeaway ?? item?.value, 'takeaway'));
  if (key_takeaways.length !== 4) throw new Error('Exactly four approved Key Takeaways are required');
  const faq = array(input.faq, 'FAQs').map(item => ({
    question: text(item?.question ?? item?.q, 'FAQ question'),
    answer: text(item?.answer ?? item?.a, 'FAQ answer'),
  }));
  if (faq.length !== 3) throw new Error('Exactly three approved FAQs are required');
  const outbound_citations = array(input.outbound_citations, 'references').map(item => ({
    url: url(item?.url ?? item?.source_url, 'reference URL'),
    anchor_text: text(item?.anchor_text ?? item?.source_title ?? item?.title, 'reference label'),
  }));
  if (!outbound_citations.length) throw new Error('Approved references are required');
  const review_revision = Number(input.review_revision);
  if (!Number.isSafeInteger(review_revision) || review_revision < 1) throw new Error('Invalid review_revision');
  return {
    content_id, topic_id: text(input.topic_id, 'topic_id'), slug,
    title: text(input.title, 'title'), meta_description: text(input.meta_description, 'meta description'),
    introduction: text(input.introduction, 'introduction'),
    article_html: text(input.article_html || input.content_html, 'article HTML'),
    key_takeaways, faq, outbound_citations, cta: text(input.cta, 'CTA'),
    hero_image_url: url(input.hero_image_url, 'cover URL'),
    hero_image_alt: text(input.hero_image_alt || input.title, 'cover alt text'),
    hero_image_public_id: text(input.hero_image_public_id || input.cloudinary_public_id, 'cover public ID'),
    review_revision, article_type: input.article_type || 'blog_post',
  };
}
