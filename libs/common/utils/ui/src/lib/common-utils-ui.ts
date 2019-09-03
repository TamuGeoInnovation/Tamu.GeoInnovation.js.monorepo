/**
 * Adds arrow key navigation to non-native select-option elements. Focuses next or previous based on key pressed
 *
 * @param event Event object
 * @param action Action to take place. Only 'focus' is currently supported
 * @param target DOM selector for which the action should happen
 */
export function arrowKeyControl(event: KeyboardEvent, action: string, target: string): void {
  // Catch up and down arrow keys
  if ([38, 40].includes(event.keyCode)) {
    if (action === 'focus') {
      const elementList = Array.from((event.currentTarget as HTMLElement).parentElement.querySelectorAll(target));

      const indexOfFocused = elementList.findIndex((element) => {
        return element === document.activeElement;
      });

      if (indexOfFocused > -1) {
        if (event.keyCode === 40) {
          if (indexOfFocused < elementList.length - 1) {
            (elementList[indexOfFocused + 1] as any).focus({ preventScroll: false });
          }
        } else if (event.keyCode === 38) {
          if (indexOfFocused > 0) {
            (elementList[indexOfFocused - 1] as any).focus({ preventScroll: false });
          } else {
            ((event.currentTarget as HTMLElement).parentElement.querySelector(
              '.input-action-container input'
            ) as HTMLElement).focus({ preventScroll: false });
          }
        }
      } else if (elementList.length > 0 && event.keyCode === 40) {
        (elementList[0] as any).focus({ preventScroll: false });
      }
    }
  }
}

/**
 * Tracks focus within an element. Used in dialogs which view visibility is true only
 * if any of children elements have focus. The parent element receives a class and visibility
 * is set with CSS.
 *
 * Disables focus altogether with SPACE, ENTER, and ESCAPE keys
 *
 * @param event Event object
 * @param target HTMLElement property. In most cases, it is 'parentElement'
 */
export function trackFocus(event, target) {
  // Set the target element
  const el = event.currentTarget[target];

  // Add class to input parent element to show results dropdown
  el.classList.add('focusing');

  const removeFocus = () => {
    el.classList.remove('focusing');
    clearTimeout(timer);
  };

  // Every 100ms check if the currently focused element exists within the parent element "el".
  // If it does not, remove focus from dialog, hiding it
  const timer = setInterval(() => {
    const focusedElement = document.activeElement;
    if (!el.contains(focusedElement)) {
      removeFocus();
    }
  }, 100);

  // Add tracking classes to keep track of added event listener to prevent adding duplicates
  if (!el.classList.contains('keydown-listen')) {
    // If a selection is made with ENTER or SPACE OR ESCAPE key is pressed, remove focus
    el.addEventListener('keydown', (keydownEvent) => {
      const dismissKeyCodes = [13, 32, 27];

      if (dismissKeyCodes.includes(keydownEvent.keyCode)) {
        if (keydownEvent.target !== keydownEvent.target) {
          removeFocus();
        }
      }
    });

    el.classList.add('keydown-listen');
  }

  // Add tracking classes to keep track of added event listener to prevent adding duplicates
  if (!el.classList.contains('mousedown-listen')) {
    // If left-mouse click on a dropdown suggestion, remove focus from dialog, hiding it
    el.addEventListener('mousedown', (mousedownEvent) => {
      if (mousedownEvent.button === 0) {
        if (mousedownEvent.target !== mousedownEvent.target) {
          removeFocus();
        }
      }
    });

    el.classList.add('mousedown-listen');
  }
}
