import { buildTailwindTokens } from '@/lib/tailwind-tokens';

export const dynamic = 'force-static';

export async function GET() {
  const { css } = await buildTailwindTokens();

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tokens.tailwind.css"',
    },
  });
}
