import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';

/** One action in an `ActionMenuComponent`: what is emitted when it is chosen, and its words. */
export interface ActionMenuItem {
  id: string;
  label: string;
  /** A Material icon's name, shown before the words. */
  icon?: string;
}

let nextId = 0;

/**
 * One button that opens a short list of actions (#3092), so a page's related actions, such as its emails, do not stack
 * side by side across the screen. It follows the WAI-ARIA menu button pattern:
 *
 * - The button has `aria-haspopup="menu"` and `aria-expanded`, and `aria-controls` names the list while it is open.
 * - The list is a `menu` labelled by the button, of `menuitem`s reached by the arrow keys, Home and End, not by Tab.
 * - Enter, Space or the down arrow on the button opens it on the first item; the up arrow on the last.
 * - Enter, Space or a click on an item emits its `id` as `chosen` and closes the list.
 * - Escape, a click outside or Tab closes it, choosing nothing. Escape and a choice put the focus back on the button.
 *
 * The button takes the page's own look through `triggerClass`, such as `selected-action` in an admin list's selection
 * bar or `__form-action` in a form section's toolbar, so it reads as one of the actions it sits among.
 *
 * @example
 * <tamu-gisc-action-menu label="Email these speakers" icon="forward_to_inbox" triggerClass="__form-action"
 *   [items]="[{ id: 'profile', label: 'Profile email' }, { id: 'details', label: 'Session details' }]"
 *   (chosen)="email($event)"></tamu-gisc-action-menu>
 */
@Component({
  selector: 'tamu-gisc-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss']
})
export class ActionMenuComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);

  /** The button's words. */
  public readonly label = input.required<string>();

  /** A Material icon's name, shown after the words, before the arrow. */
  public readonly icon = input<string>();

  /** The actions, in the order listed. */
  public readonly items = input<ReadonlyArray<ActionMenuItem>>([]);

  /** Classes for the button, so it takes the look of the actions around it. */
  public readonly triggerClass = input('');

  /** Which way the list opens: `up` for a bar along the bottom of the screen. */
  public readonly opens = input<'down' | 'up'>('down');

  /** Which edge of the button the list lines up with: `end` for a button at the right of the page. */
  public readonly align = input<'start' | 'end'>('start');

  /** The `id` of the action chosen. */
  public readonly chosen = output<string>();

  public readonly open = signal(false);

  private readonly uid = nextId++;
  public readonly buttonId = `tamu-gisc-action-menu-button-${this.uid}`;
  public readonly menuId = `tamu-gisc-action-menu-${this.uid}`;

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private readonly menuItems = viewChildren<ElementRef<HTMLButtonElement>>('item');

  /** A click on the button opens or closes the list; opened by the pointer, the first item takes the focus. */
  public toggle() {
    if (this.open()) {
      this.close(true);
    } else {
      this.show(0);
    }
  }

  public onButtonKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        // Claimed, so the button's own click does not close the list as soon as it opens.
        event.preventDefault();
        this.show(0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.show(this.items().length - 1);
        break;
    }
  }

  /** Space on a button clicks it when the key comes up: claimed, so the list just opened by its keydown stays open. */
  public onButtonKeyup(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  public onMenuKeydown(event: KeyboardEvent, index: number) {
    const count = this.items().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusItem((index + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusItem((index - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(count - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.choose(this.items()[index]);
        break;
      case 'Escape':
        // Claimed, so a page that gives Escape a meaning of its own (an admin details page going back to its list,
        // #2942) leaves this one alone.
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        // The focus moves on as Tab sends it; the list closes behind it.
        this.close(false);
        break;
    }
  }

  public choose(item: ActionMenuItem) {
    this.close(true);
    this.chosen.emit(item.id);
  }

  /** A press anywhere outside closes the list, choosing nothing. */
  @HostListener('document:mousedown', ['$event'])
  public onDocumentMousedown(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  private show(index: number) {
    this.open.set(true);
    // Drawn now, so its items exist to take the focus.
    this.cdr.detectChanges();
    this.focusItem(index);
  }

  private focusItem(index: number) {
    this.menuItems()[index]?.nativeElement.focus();
  }

  private close(refocus: boolean) {
    this.open.set(false);

    if (refocus) {
      this.button().nativeElement.focus();
    }
  }
}
