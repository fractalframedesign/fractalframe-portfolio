// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

const projects = [
  { slug: 'fintech-components', name: 'Fintech components' },
  { slug: 'justos', name: 'JustOS' },
];

async function choose(filter: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: filter }));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('GuestsFilters', () => {
  it('sets the status in the URL and keeps the project', async () => {
    search = 'project=fintech-components';
    render(
      <GuestsFilters projects={projects} project="fintech-components" />,
    );

    await choose('Status', 'Paused');

    expect(push).toHaveBeenCalledWith(
      '/admin/guests?project=fintech-components&status=paused',
      { scroll: false },
    );
  });

  it('removes the status from the URL when All is picked', async () => {
    search = 'project=fintech-components&status=paused';
    render(
      <GuestsFilters
        projects={projects}
        project="fintech-components"
        status="paused"
      />,
    );

    await choose('Status', 'All');

    expect(push).toHaveBeenCalledWith(
      '/admin/guests?project=fintech-components',
      { scroll: false },
    );
  });

  it('removes every filter, leaving a bare path', async () => {
    search = 'project=justos';
    render(<GuestsFilters projects={projects} project="justos" />);

    await choose('Project', 'All');

    expect(push).toHaveBeenCalledWith('/admin/guests', { scroll: false });
  });
});
