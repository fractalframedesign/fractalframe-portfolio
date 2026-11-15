import { describe, expect, it } from 'vitest';

import { requestEmail } from './request-email';

const request = {
  name: 'Aiko Tanaka',
  email: 'aiko@example.com',
  message: 'I would like to read it.',
  projectName: 'Rakuten Link',
};

describe('requestEmail', () => {
  it('has a Give access button that opens Requests in the admin console', () => {
    const { html, text } = requestEmail(request);
    expect(html).toMatch(/href="[^"]+\/admin\/requests"[^>]*>Give access</);
    expect(text).toMatch(/Give access: \S+\/admin\/requests/);
  });

  it('says who asked, for which project, and what they wrote', () => {
    const { subject, html, text } = requestEmail(request);
    expect(subject).toBe('Access request: Rakuten Link from Aiko Tanaka');
    for (const part of Object.values(request)) {
      expect(html).toContain(part);
      expect(text).toContain(part);
    }
  });

  it('leaves the message block out when there is no message', () => {
    const { html, text } = requestEmail({ ...request, message: '' });
    expect(html).not.toContain('Message');
    expect(text).not.toContain('Message');
  });

  it('shows what a visitor typed as text, never as HTML', () => {
    const { html } = requestEmail({
      ...request,
      name: '<script>alert(1)</script>',
      message: '<img src=x onerror=alert(1)>\nsecond line',
    });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('<br>second line');
  });
});
