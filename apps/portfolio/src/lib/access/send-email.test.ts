import { afterEach, describe, expect, test, vi } from 'vitest';

const mail = vi.hoisted(() => ({
  sendMail: vi.fn(),
  createTransport: vi.fn(),
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: mail.createTransport },
}));

import { guestSender, sendEmail } from './send-email';

const ENV = [
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'RESEND_API_KEY',
  'ACCESS_REQUEST_FROM',
] as const;

afterEach(() => {
  for (const key of ENV) delete process.env[key];
  vi.unstubAllGlobals();
  mail.sendMail.mockReset();
  mail.createTransport.mockReset();
});

function gmail() {
  process.env.GMAIL_USER = 'fractalframe.design@gmail.com';
  process.env.GMAIL_APP_PASSWORD = 'abcd efgh ijkl mnop';
  mail.createTransport.mockReturnValue({ sendMail: mail.sendMail });
}

describe('guestSender', () => {
  test('Gmail when its app password is set, else a verified Resend sender, else none', () => {
    expect(guestSender()).toBeUndefined();
    process.env.RESEND_API_KEY = 'key';
    process.env.ACCESS_REQUEST_FROM = 'Kiran <hello@example.com>';
    expect(guestSender()).toBe('Kiran <hello@example.com>');
    gmail();
    expect(guestSender()).toBe('Kiran <fractalframe.design@gmail.com>');
  });
});

describe('sendEmail', () => {
  test('sends through Gmail when it is set up', async () => {
    gmail();
    mail.sendMail.mockResolvedValue({ messageId: '1' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(
      await sendEmail({
        to: 'ada@x.com',
        subject: 'Hi',
        text: 'Body',
        replyTo: 'kiranspingle@gmail.com',
      }),
    ).toBe(true);
    expect(mail.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'fractalframe.design@gmail.com',
        pass: 'abcd efgh ijkl mnop',
      },
    });
    expect(mail.sendMail).toHaveBeenCalledWith({
      from: 'Kiran <fractalframe.design@gmail.com>',
      to: 'ada@x.com',
      replyTo: 'kiranspingle@gmail.com',
      subject: 'Hi',
      text: 'Body',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('a Gmail failure returns false', async () => {
    gmail();
    mail.sendMail.mockRejectedValue(new Error('Invalid login'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await sendEmail({ to: 'a@x.com', subject: 's', text: 't' })).toBe(
      false,
    );
  });

  test('without Gmail it uses Resend', async () => {
    process.env.RESEND_API_KEY = 'key';
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendEmail({ to: 'a@x.com', subject: 's', text: 't' })).toBe(
      true,
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(mail.createTransport).not.toHaveBeenCalled();
  });
});
