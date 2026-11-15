import { getSiteUrl } from '@/lib/site';

type RequestEmail = {
  name: string;
  email: string;
  message: string;
  projectName: string;
};

/*
 * Email clients ignore stylesheets and CSS variables, so the colours are
 * written out here. They are the light values of the site tokens.
 */
const COLOR = {
  page: '#f7f7f7', // muted
  card: '#ffffff', // card
  border: '#e8e8e8', // border
  text: '#131313', // foreground
  subtle: '#6e6e76', // muted-foreground
  button: '#131313', // primary
  buttonText: '#fafafa', // primary-foreground
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** The email Kiran gets when someone asks for access, as plain text and HTML */
export function requestEmail({
  name,
  email,
  message,
  projectName,
}: RequestEmail) {
  const requestsUrl = `${getSiteUrl()}/admin/requests`;
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    project: escapeHtml(projectName),
    message: escapeHtml(message).replaceAll('\n', '<br>'),
  };

  const text = [
    `${name} <${email}> asked for access to ${projectName}.`,
    message && `Message:\n${message}`,
    `Give access: ${requestsUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const label = `margin:0 0 4px;font-size:12px;line-height:16px;color:${COLOR.subtle};`;
  const value = `margin:0;font-size:15px;line-height:22px;color:${COLOR.text};`;

  const messageBlock = message
    ? `<tr><td style="padding:16px 0 0;">
        <p style="${label}">Message</p>
        <p style="${value}padding:12px 14px;background:${COLOR.page};border-radius:6px;">${safe.message}</p>
      </td></tr>`
    : '';

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background:${COLOR.page};font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:12px;">
      <tr><td style="padding:28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td>
            <p style="margin:0 0 8px;font-size:12px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR.subtle};">Access request</p>
            <h1 style="margin:0;font-size:22px;line-height:28px;font-weight:600;color:${COLOR.text};">${safe.name} wants to see ${safe.project}</h1>
          </td></tr>
          <tr><td style="padding:20px 0 0;">
            <p style="${label}">From</p>
            <p style="${value}">${safe.name}<br><a href="mailto:${safe.email}" style="color:${COLOR.subtle};text-decoration:underline;">${safe.email}</a></p>
          </td></tr>
          <tr><td style="padding:16px 0 0;">
            <p style="${label}">Project</p>
            <p style="${value}">${safe.project}</p>
          </td></tr>
          ${messageBlock}
          <tr><td style="padding:24px 0 0;">
            <a href="${requestsUrl}" style="display:inline-block;padding:12px 22px;background:${COLOR.button};color:${COLOR.buttonText};font-size:15px;line-height:20px;font-weight:600;text-decoration:none;border-radius:6px;">Give access</a>
          </td></tr>
          <tr><td style="padding:16px 0 0;">
            <p style="margin:0;font-size:13px;line-height:18px;color:${COLOR.subtle};">The button opens Requests in your admin console. Reply to this email to write back to ${safe.name}.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return {
    subject: `Access request: ${projectName} from ${name}`,
    text,
    html,
  };
}
