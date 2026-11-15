import { getShowcaseProject } from '@/lib/showcase';

/**
 * Only follow `next` back into the same project (its showcase or its case
 * study), never anywhere else. Default: the demo if it has one.
 */
export function safeNext(slug: string, next: string) {
  const showcase = `/showcase/${slug}`;
  const caseStudy = `/projects/${slug}`;
  const fallback = getShowcaseProject(slug) ? showcase : caseStudy;

  // Resolve it the way the browser will (dot segments, %2e%2e, //host),
  // then accept only the same site and the same project
  let url: URL;
  try {
    url = new URL(next, 'https://same.site');
  } catch {
    return fallback;
  }
  if (url.origin !== 'https://same.site' || next.includes('\\')) {
    return fallback;
  }
  const path = url.pathname;
  const within = (base: string) => path === base || path.startsWith(`${base}/`);
  return within(showcase) || within(caseStudy)
    ? `${path}${url.search}${url.hash}`
    : fallback;
}
