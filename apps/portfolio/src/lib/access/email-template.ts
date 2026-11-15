export type EmailContent = {
  heading: string;
  paragraphs: string[];
  /** A sign-in code, shown large */
  code?: string;
  button?: { label: string; href: string };
};

const SIGN_OFF = 'Kiran';

// Emails can't read the site's CSS variables, so the colours are written out
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const STYLES = {
  body: 'margin: 0; padding: 0; background: #f4f4f5;',
  outer: `width: 100%; background: #f4f4f5; font-family: ${FONT};`,
  card: 'width: 100%; max-width: 560px; background: #ffffff; border-radius: 12px;',
  cell: 'padding: 32px;',
  heading:
    'margin: 0 0 16px; font-size: 22px; line-height: 1.3; font-weight: 600; color: #18181b;',
  paragraph:
    'margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #3f3f46;',
  link: 'color: #18181b; text-decoration: underline;',
  code: 'margin: 0 0 16px; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; text-align: center; font-family: ui-monospace, Menlo, monospace; font-size: 36px; letter-spacing: 8px; font-weight: 600; color: #18181b;',
  buttonWrap: 'margin: 8px 0 24px;',
  button:
    'display: inline-block; background:#18181b; color:#ffffff; border-radius:8px; padding:12px 20px; text-decoration:none; font-weight:600; font-size: 16px;',
  signOff: 'margin: 0; font-size: 16px; line-height: 1.5; color: #71717a;',
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes a paragraph, keeps its line breaks and turns web addresses into links */
function paragraphHtml(paragraph: string) {
  return paragraph
    .split(/(https?:\/\/\S+)/)
    .map((part, index) => {
      // Odd parts are the addresses the split captured
      if (index % 2 === 0) return escapeHtml(part).replace(/\n/g, '<br>');
      // Punctuation that ends the sentence is not part of the address
      const url = part.replace(/[.,;:!?)]+$/, '');
      const rest = part.slice(url.length);
      return `<a href="${escapeHtml(url)}" style="${STYLES.link}">${escapeHtml(url)}</a>${escapeHtml(rest)}`;
    })
    .join('');
}

/** One template for every email to a guest: an HTML card and its plain-text twin */
export function renderEmail({
  heading,
  paragraphs,
  code,
  button,
}: EmailContent) {
  const body = paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);
  // Kiran's own messages already end with his name
  if (body.at(-1) === SIGN_OFF) body.pop();

  const text = [
    heading,
    ...body,
    ...(code ? [`Your code: ${code}`] : []),
    ...(button ? [`${button.label}: ${button.href}`] : []),
    SIGN_OFF,
  ].join('\n\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="${STYLES.body}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${STYLES.outer}">
<tr>
<td align="center" style="padding: 24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${STYLES.card}">
<tr>
<td style="${STYLES.cell}">
<h1 style="${STYLES.heading}">${escapeHtml(heading)}</h1>
${code ? `<p style="${STYLES.code}">${escapeHtml(code)}</p>\n` : ''}${body
    .map(
      (paragraph) =>
        `<p style="${STYLES.paragraph}">${paragraphHtml(paragraph)}</p>`,
    )
    .join('\n')}
${
  button
    ? `<p style="${STYLES.buttonWrap}"><a href="${escapeHtml(button.href)}" style="${STYLES.button}">${escapeHtml(button.label)}</a></p>\n`
    : ''
}<p style="${STYLES.signOff}">${SIGN_OFF}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

  return { text, html };
}
