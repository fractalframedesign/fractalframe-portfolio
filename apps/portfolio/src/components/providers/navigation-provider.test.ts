// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scrollAfterNavigation } from './navigation-provider';

describe('scrollAfterNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('scrolls to the top when the link names no section', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    scrollAfterNavigation('/about');

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  it('scrolls to the named section once the new page has rendered it', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    scrollAfterNavigation('/about#principles');
    // the new page renders a moment later
    vi.advanceTimersByTime(50);
    const section = document.createElement('section');
    section.id = 'principles';
    document.body.append(section);
    vi.advanceTimersByTime(50);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(section);
  });
});
