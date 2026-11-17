/** Where the sign-in card is: asking for the email, the code, or an access request */
export type SignInState = {
  step: 'email' | 'code' | 'request';
  email?: string;
  error?: string;
  /** Seconds until another code can be sent */
  retryAfterSeconds?: number;
};

// Kept out of sign-in.ts: a 'use server' file may only export async functions
export const MESSAGES = {
  notNeeded: 'This project doesn’t need a password.',
  badEmail: 'Enter a valid email address.',
  tooMany: 'Too many codes requested. Try again in 15 minutes.',
  outage: 'We can’t send codes right now. Please try again in a few minutes.',
  emailFailed: 'The email didn’t send. Try again.',
  badCode: 'Enter the 6-digit code.',
  wrongCode: (left: number) =>
    left > 0
      ? `That code isn’t right. ${left} ${left === 1 ? 'try' : 'tries'} left.`
      : 'That code has been used up. Request a new one.',
  expiredCode: 'That code has expired. Request a new one.',
};
