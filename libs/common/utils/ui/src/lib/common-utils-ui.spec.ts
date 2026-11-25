import { arrowKeyControl, trackFocus } from './common-utils-ui';

describe('arrowKeyControl', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const arrow = (keyCode: number, currentTarget: HTMLElement) => ({ keyCode, currentTarget }) as unknown as KeyboardEvent;

  /** A target taken out of the page has no siblings to move to (#3495): nothing happens, rather than a TypeError. */
  it('does nothing for a target no longer in the page', () => {
    const detached = document.createElement('input');

    expect(() => arrowKeyControl(arrow(40, detached), 'focus', 'li')).not.toThrow();
  });

  /** Up from the first option goes to the search input, and does nothing when there is none (#3495). */
  it('does nothing on up from the first option when there is no input to return to', () => {
    const list = document.createElement('ul');
    const first = document.createElement('li');
    first.tabIndex = 0;
    list.appendChild(first);
    document.body.appendChild(list);
    first.focus();

    expect(() => arrowKeyControl(arrow(38, first), 'focus', 'li')).not.toThrow();
    expect(document.activeElement).toBe(first);
  });

  it('moves down to the next option', () => {
    const list = document.createElement('ul');
    const [first, second] = [document.createElement('li'), document.createElement('li')];
    first.tabIndex = 0;
    second.tabIndex = 0;
    list.append(first, second);
    document.body.appendChild(list);
    first.focus();

    arrowKeyControl(arrow(40, first), 'focus', 'li');

    expect(document.activeElement).toBe(second);
  });
});

describe('trackFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('removes focus tracking when a dismiss key is pressed on a child element', () => {
    vi.useFakeTimers();

    const wrapper = document.createElement('div');
    const parent = document.createElement('div');
    const trigger = document.createElement('input');
    const child = document.createElement('button');

    parent.appendChild(trigger);
    parent.appendChild(child);
    wrapper.appendChild(parent);
    document.body.appendChild(wrapper);

    trackFocus({ currentTarget: trigger }, 'parentElement');

    expect(parent.classList.contains('focusing')).toBe(true);

    const keydownEvent = new KeyboardEvent('keydown', { bubbles: true });
    Object.defineProperty(keydownEvent, 'keyCode', { value: 13 });
    child.dispatchEvent(keydownEvent);

    expect(parent.classList.contains('focusing')).toBe(false);
  });

  it('removes focus tracking when left click occurs on a child element', () => {
    vi.useFakeTimers();

    const wrapper = document.createElement('div');
    const parent = document.createElement('div');
    const trigger = document.createElement('input');
    const child = document.createElement('button');

    parent.appendChild(trigger);
    parent.appendChild(child);
    wrapper.appendChild(parent);
    document.body.appendChild(wrapper);

    trackFocus({ currentTarget: trigger }, 'parentElement');

    expect(parent.classList.contains('focusing')).toBe(true);

    child.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));

    expect(parent.classList.contains('focusing')).toBe(false);
  });
});
