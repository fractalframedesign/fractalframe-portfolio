// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AccessWatcher from './access-watcher';

function respond(...statuses: string[]) {
  const fetchMock = vi.fn();
  for (const status of statuses)
    fetchMock.mockResolvedValueOnce(Response.json({ status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('AccessWatcher', () => {
  it('checks once on a public project and stops', async () => {
    const fetchMock = respond('public');
    const onLocked = vi.fn();
    render(<AccessWatcher slug="bloom" onLocked={onLocked} />);
    await flush();
    await act(async () => vi.advanceTimersByTime(120_000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/access/bloom', {
      cache: 'no-store',
    });
    expect(onLocked).not.toHaveBeenCalled();
  });

  it('keeps checking an open project and locks the page once access is gone', async () => {
    respond('open', 'open', 'locked');
    const onLocked = vi.fn();
    render(<AccessWatcher slug="cactus-plant" onLocked={onLocked} />);
    await flush();
    await act(async () => vi.advanceTimersByTime(30_000));
    await flush();
    expect(onLocked).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(30_000));
    await flush();
    expect(onLocked).toHaveBeenCalledTimes(1);
  });

  it('checks again when the visitor comes back to the tab', async () => {
    const fetchMock = respond('open', 'locked');
    const onLocked = vi.fn();
    render(<AccessWatcher slug="cactus-plant" onLocked={onLocked} />);
    await flush();
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onLocked).toHaveBeenCalledTimes(1);
  });

  it('a failed check never locks the page', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const onLocked = vi.fn();
    render(<AccessWatcher slug="cactus-plant" onLocked={onLocked} />);
    await flush();
    expect(onLocked).not.toHaveBeenCalled();
  });
});
