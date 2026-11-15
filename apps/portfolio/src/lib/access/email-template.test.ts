import { afterEach, expect, test, vi } from 'vitest';

import { escapeHtml, renderEmail } from './email-template';
import { sendEmail } from './send-email';

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
});

test('renders heading, paragraphs, code and button in html and text', () => {
  const { html, text } = renderEmail({
    heading: 'Your sign-in code',
    paragraphs: ['Enter it on Cactus Plant.'],
    code: '482913',
    button: {
      label: 'Open Cactus Plant',
      href: 'https://example.com/projects/cactus-plant?email=a%40b.com',
    },
  });
  expect(html).toMatch(/^<!doctype html>/);
  expect(html).toContain('letter-spacing: 8px');
  expect(html).toContain('>482913<');
  expect(html).toContain(
    'href="https://example.com/projects/cactus-plant?email=a%40b.com"',
  );
  expect(html).toContain('>Open Cactus Plant<');
  expect(text).toBe(`Your sign-in code

Enter it on Cactus Plant.

Your code: 482913

Open Cactus Plant: https://example.com/projects/cactus-plant?email=a%40b.com

Kiran`);
});

test('escapes html in text and links urls in paragraphs', () => {
  const { html } = renderEmail({
    heading: '<b>Hi</b>',
    paragraphs: ['See https://example.com/x & more'],
  });
  expect(html).toContain('&lt;b&gt;Hi&lt;/b&gt;');
  expect(html).toContain('<a href="https://example.com/x"');
  expect(html).toContain('&amp; more');
  expect(html).not.toContain('<b>');
});

test('escapeHtml covers quotes, so a value can never break out of an attribute', () => {
  expect(escapeHtml(`"><script>alert('x')</script>&`)).toBe(
    '&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;',
  );
  const { html } = renderEmail({
    heading: 'Hi',
    paragraphs: [],
    button: { label: 'Open', href: 'https://example.com/?a=1&b="2"' },
  });
  expect(html).toContain('href="https://example.com/?a=1&amp;b=&quot;2&quot;"');
});

test('a full stop after a link is not part of the link, and line breaks are kept', () => {
  const { html } = renderEmail({
    heading: 'Hi',
    paragraphs: ['Cactus Plant\nhttps://example.com/projects/cactus-plant.'],
  });
  expect(html).toContain(
    'Cactus Plant<br><a href="https://example.com/projects/cactus-plant"',
  );
  expect(html).toContain('cactus-plant</a>.');
});

test('a message that already ends with Kiran is not signed twice', () => {
  const { html, text } = renderEmail({
    heading: 'Access',
    paragraphs: ['Hi Jane,', 'Kiran'],
  });
  expect(text.match(/Kiran/g)).toHaveLength(1);
  expect(html.match(/Kiran/g)).toHaveLength(1);
});

test('sendEmail passes html to Resend beside the text', async () => {
  process.env.RESEND_API_KEY = 'key';
  const fetchMock = vi.fn<
    (url: string, init: RequestInit) => Promise<Response>
  >(async () => new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  expect(
    await sendEmail({
      to: 'ada@example.com',
      subject: 'Hi',
      text: 'plain',
      html: '<p>rich</p>',
    }),
  ).toBe(true);
  expect(JSON.parse(fetchMock.mock.calls[0]![1].body as string)).toMatchObject({
    text: 'plain',
    html: '<p>rich</p>',
  });
});
