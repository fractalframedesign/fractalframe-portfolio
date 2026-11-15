// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SignInState } from '@/lib/access/actions/sign-in-messages';

import SignInCard from './sign-in-card';

const actions = vi.hoisted(() => ({
  startSignIn: vi.fn(),
  verifySignIn: vi.fn(),
}));
vi.mock('@/lib/access/actions/sign-in', () => actions);
vi.mock('@/lib/access/actions/unlock', () => ({ unlock: vi.fn() }));
vi.mock('@/lib/access/actions/request-access', () => ({
  requestAccess: vi.fn(),
}));

const project = { slug: 'cactus-plant', name: 'Cactus Plant' };

function renderCard(initialEmail?: string) {
  return render(
    <SignInCard
      project={project}
      next="/projects/cactus-plant"
      initialEmail={initialEmail}
      autoFocus={false}
    />,
  );
}

/** Types an email and presses Continue; the mocked action answers with `result` */
async function continueWith(email: string, result: SignInState) {
  actions.startSignIn.mockResolvedValueOnce(result);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: email },
  });
  await act(async () => {
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!);
  });
}

function emailSentToAction(call = 0) {
  return (actions.startSignIn.mock.calls[call]![1] as FormData).get('email');
}

beforeEach(() => {
  actions.startSignIn.mockReset();
  actions.verifySignIn.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('SignInCard', () => {
  it('moves to the request form with the email prefilled when the email is unknown', async () => {
    renderCard();
    await continueWith('new@example.com', {
      step: 'request',
      email: 'new@example.com',
    });

    expect(screen.getByText(/on my guest list yet/)).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(
      'new@example.com',
    );
    expect(screen.getByLabelText('Name')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send request' })).toBeTruthy();
  });

  it('moves to the code step and counts down the resend link when a code was sent', async () => {
    vi.useFakeTimers();
    renderCard();
    await continueWith('ada@example.com', {
      step: 'code',
      email: 'ada@example.com',
      retryAfterSeconds: 60,
    });

    expect(screen.getByText(/We sent a 6-digit code to/)).toBeTruthy();
    expect(screen.getByLabelText('6-digit code')).toBeTruthy();
    const resend = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Resend code in 60s',
    });
    expect(resend.disabled).toBe(true);

    await act(async () => vi.advanceTimersByTime(1000));
    expect(
      screen.getByRole('button', { name: 'Resend code in 59s' }),
    ).toBeTruthy();

    for (let i = 0; i < 59; i++) {
      await act(async () => vi.advanceTimersByTime(1000));
    }
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Resend code' })
        .disabled,
    ).toBe(false);
  });

  it('resends to the same email and restarts the countdown', async () => {
    renderCard('ada@example.com');
    actions.startSignIn.mockResolvedValueOnce({
      step: 'code',
      email: 'ada@example.com',
      retryAfterSeconds: 60,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Resend code' }));
    });

    expect(emailSentToAction()).toBe('ada@example.com');
    expect(
      screen.getByRole('button', { name: 'Resend code in 60s' }),
    ).toBeTruthy();
  });

  it('sends the typed code with the email and shows what the server says', async () => {
    renderCard('ada@example.com');
    actions.verifySignIn.mockResolvedValueOnce({
      step: 'code',
      email: 'ada@example.com',
      error: 'That code isn’t right. 4 tries left.',
    });
    // The sixth digit sends the form by itself
    await act(async () => {
      fireEvent.change(screen.getByLabelText('6-digit code'), {
        target: { value: '123456' },
      });
    });

    expect(actions.verifySignIn).toHaveBeenCalledOnce();

    const sent = actions.verifySignIn.mock.calls.at(-1)![1] as FormData;
    expect(Object.fromEntries(sent)).toMatchObject({
      project: 'cactus-plant',
      next: '/projects/cactus-plant',
      email: 'ada@example.com',
      code: '123456',
    });
    expect(screen.getByRole('alert').textContent).toBe(
      'That code isn’t right. 4 tries left.',
    );
  });

  it('"Use a different email" returns to the email step with the field editable', async () => {
    renderCard('ada@example.com');
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Use a different email' }),
      );
    });

    const field = screen.getByLabelText<HTMLInputElement>('Email');
    expect(field.value).toBe('ada@example.com');
    expect(field.readOnly).toBe(false);

    // The typed email is the one that gets the code, not the prefilled one
    await continueWith('grace@example.com', {
      step: 'code',
      email: 'grace@example.com',
      retryAfterSeconds: 60,
    });
    expect(emailSentToAction()).toBe('grace@example.com');
    expect(screen.getByText('grace@example.com')).toBeTruthy();
  });

  it('"Use a password instead" shows the password form, and Back returns', async () => {
    renderCard();
    fireEvent.click(
      screen.getByRole('button', { name: 'Use a password instead' }),
    );
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.queryByLabelText('Email')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  it('shows an error from the email step beside the field', async () => {
    renderCard();
    await continueWith('ada@example.com', {
      step: 'email',
      email: 'ada@example.com',
      error:
        'We can’t send codes right now. Please try again in a few minutes.',
    });
    expect(screen.getByRole('alert').textContent).toContain(
      'We can’t send codes right now.',
    );
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(
      'ada@example.com',
    );
  });
});
