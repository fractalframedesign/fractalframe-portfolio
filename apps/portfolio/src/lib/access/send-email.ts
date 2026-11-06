const TEST_SENDER = 'Showcase <onboarding@resend.dev>';

/**
 * Sender for emails to guests. Resend's test sender can only reach the
 * account owner, so guests need ACCESS_REQUEST_FROM on a verified domain.
 */
export function guestSender() {
  return process.env.RESEND_API_KEY && process.env.ACCESS_REQUEST_FROM
    ? process.env.ACCESS_REQUEST_FROM
    : undefined;
}

/** Sends a plain-text email through Resend; false (and logged) on any failure */
export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
  from = process.env.ACCESS_REQUEST_FROM ?? TEST_SENDER,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  from?: string;
}) {
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
