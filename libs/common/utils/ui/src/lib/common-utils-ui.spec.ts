import { trackFocus } from './common-utils-ui';

describe('trackFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('removes focus tracking when a dismiss key is pressed on a child element', () => {
    jest.useFakeTimers();

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
    jest.useFakeTimers();

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
