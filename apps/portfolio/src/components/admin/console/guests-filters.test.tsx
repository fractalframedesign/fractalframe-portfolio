// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import GuestsFilters from './guests-filters';

const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
  usePathname: () => '/admin/guests',
}));

beforeAll(() => {
  // Radix Select relies on browser APIs that jsdom does not implement
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => push.mockClear());
afterEach(cleanup);

async function choose(filter: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: filter }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('GuestsFilters', () => {
  it('sets the status in the URL', async () => {
    search = '';
    render(<GuestsFilters />);

    await choose('Status', 'Paused');

    expect(push).toHaveBeenCalledWith('/admin/guests?status=paused', {
      scroll: false,
    });
  });

  it('All removes the filter, leaving a bare path', async () => {
    search = 'status=paused';
    render(<GuestsFilters status="paused" />);

    await choose('Status', 'All');

    expect(push).toHaveBeenCalledWith('/admin/guests', { scroll: false });
  });
});
