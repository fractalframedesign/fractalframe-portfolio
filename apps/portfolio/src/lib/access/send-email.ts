import nodemailer from 'nodemailer';

const TEST_SENDER = 'Showcase <onboarding@resend.dev>';

type Email = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  from?: string;
};

/** Gmail sends when GMAIL_USER and its app password are set */
function gmailSender() {
  const user = process.env.GMAIL_USER;
  return user && process.env.GMAIL_APP_PASSWORD ? `Kiran <${user}>` : undefined;
}

/**
 * Sender for emails to guests: Gmail when it is set up, otherwise Resend on
 * a verified domain (Resend's test sender can only reach the account owner).
 */
export function guestSender() {
  return (
    gmailSender() ??
    (process.env.RESEND_API_KEY && process.env.ACCESS_REQUEST_FROM
      ? process.env.ACCESS_REQUEST_FROM
      : undefined)
  );
}

/** Sends a plain-text email through Gmail or Resend; false (and logged) on any failure */
export async function sendEmail(email: Email) {
  const gmail = gmailSender();
  return gmail
    ? sendWithGmail({ ...email, from: gmail })
    : sendWithResend(email);
}

async function sendWithGmail({ from, to, replyTo, subject, text }: Email) {
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transport.sendMail({ from, to, replyTo, subject, text });
    return true;
  } catch (error) {
    console.error('Email failed', error);
    return false;
  }
}

async function sendWithResend({
  to,
  subject,
  text,
  replyTo,
  from = process.env.ACCESS_REQUEST_FROM ?? TEST_SENDER,
}: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set, email not sent');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, reply_to: replyTo, subject, text }),
    });
    if (!response.ok) {
      console.error('Email failed', await response.text());
    }
    return response.ok;
  } catch (error) {
    console.error('Email failed', error);
    return false;
  }
}
