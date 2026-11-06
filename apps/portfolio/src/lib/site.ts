/**
 * Canonical site URL: explicit env var, then the project's production domain on
 * Vercel, then localhost. Never the per-deployment VERCEL_URL, which changes on
 * every build and sits behind Vercel's deployment protection, so share previews
 * and sitemap links pointing at it break.
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  );
}
