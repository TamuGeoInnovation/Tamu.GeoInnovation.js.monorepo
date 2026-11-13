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
    fixture.componentRef.setInput('counts', { shown: 2, total: 9 });
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('says how many it shows of how many while searching', () => {
    expect(open('tex').querySelector('.admin-search-count').textContent.replace(/\s+/g, ' ').trim()).toBe('Showing 2 of 9.');
  });

  it('says nothing about counts with no search', () => {
    expect(open('').querySelector('.admin-search-count')).toBeNull();
  });
});
