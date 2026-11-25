import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { AdminSearchComponent } from './admin-search.component';

/** #2914: the search box, and its count only while a search is in use. */
describe('AdminSearchComponent', () => {
  function open(value: string) {
    TestBed.configureTestingModule({ imports: [AdminSearchComponent] });
    const fixture = TestBed.createComponent(AdminSearchComponent);
    fixture.componentRef.setInput('control', new FormControl(value, { nonNullable: true }));
    fixture.componentRef.setInput('placeholder', 'Search by name');
    fixture.componentRef.setInput('one', 'class');
    fixture.componentRef.setInput('many', 'classes');
    fixture.componentRef.setInput('counts', { shown: 2, total: 9 });
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('says how many it shows of how many while searching', () => {
    expect(open('tex').querySelector('.admin-search-count').textContent.replace(/\s+/g, ' ').trim()).toBe('Showing 2 of 9 classes.');
  });

  it('says how many the list holds with no search', () => {
    expect(open('').querySelector('.admin-search-count').textContent.replace(/\s+/g, ' ').trim()).toBe('9 classes.');
  });
});

/** #3051: every admin search box has the X that clears it, as the public searches have since #2963. */
describe('AdminSearchComponent clear button', () => {
  function open() {
    TestBed.configureTestingModule({ imports: [AdminSearchComponent] });
    const fixture = TestBed.createComponent(AdminSearchComponent);
    const control = new FormControl('', { nonNullable: true });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    return { fixture, control, root: fixture.nativeElement as HTMLElement };
  }

  /** Types into the box, as a visitor would. */
  function type(page: ReturnType<typeof open>, text: string) {
    const input = page.root.querySelector('tamu-gisc-textbox input') as HTMLInputElement;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    page.fixture.detectChanges();
  }

  const clearButton = (root: HTMLElement) => root.querySelector('tamu-gisc-textbox button.textbox-clear') as HTMLButtonElement;

  it('shows the X, named for the search, once something is typed', () => {
    const page = open();
    expect(clearButton(page.root)).toBeNull();

    type(page, 'goldber');

    expect(clearButton(page.root)).not.toBeNull();
    expect(clearButton(page.root).getAttribute('aria-label')).toBe('Clear the search');
  });

  it('empties the box and the search when pressed, so the list shows everything again', () => {
    const page = open();
    const searches: string[] = [];
    page.control.valueChanges.subscribe((v) => searches.push(v));
    type(page, 'goldber');

    clearButton(page.root).click();
    page.fixture.detectChanges();

    expect(page.control.value).toBe('');
    expect(searches).toEqual(['goldber', '']);
    expect((page.root.querySelector('tamu-gisc-textbox input') as HTMLInputElement).value).toBe('');
    expect(clearButton(page.root)).toBeNull();
  });
});
