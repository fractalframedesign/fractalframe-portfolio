// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import RakutenLinkProcess from './rakuten-link-process';

afterEach(cleanup);

describe('RakutenLinkProcess', () => {
  it('introduces the iterations and alignment work', () => {
    render(<RakutenLinkProcess />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Endless iterations' }),
    ).toBeTruthy();
    expect(
      screen.getByText(/stakeholder, business and brand alignment/),
    ).toBeTruthy();
  });

  it('steps through four illustrated scenes with buttons', async () => {
    const user = userEvent.setup();
    render(<RakutenLinkProcess />);

    expect(screen.getByText('1 / 4')).toBeTruthy();
    expect(screen.getByText('A big canvas full of comments')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('2 / 4')).toBeTruthy();
    expect(
      screen.getByText('Comments and cursors on every screen'),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByText('4 / 4')).toBeTruthy();
    expect(screen.getByText('Whiteboarding the UI flows')).toBeTruthy();
  });

  it('moves with the arrow keys and jumps from the dots', async () => {
    const user = userEvent.setup();
    render(<RakutenLinkProcess />);

    screen.getByRole('region', { name: 'Endless iterations' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 4')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(
      screen.getByText('Calls with everyone, again and again'),
    ).toBeTruthy();
  });

  it('says the scenes are illustrations', () => {
    render(<RakutenLinkProcess />);

    expect(screen.getByText(/Illustrations of the process/)).toBeTruthy();
  });
});
