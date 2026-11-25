import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SearchComponent } from './search.component';
import { SearchResult, SearchResultItem, SearchService } from '../../services/search.service';

/**
 * Choosing a result closes the drop down, and the browser focusing the chosen option does not reopen it (#2844).
 *
 * The options are chosen on `mousedown`, deliberately: the input's own `blur` would otherwise hide the list
 * before a `click` could land on it. But `mousedown` runs *before* the browser moves focus, so the order is
 * `setSelected` -> `loseFocus()`, and then the chosen option takes focus and fires `(focus)="setFocus()"`,
 * which opens the list again. The `document:click` handler cannot undo it either, because by then the list is
 * open and the click is inside the component.
 *
 * What a visitor sees is a list that will not go away, sitting over the panel underneath - in the trip planner,
 * over the other endpoint's box and over the route it just calculated, which reads as nothing having happened
 * ([#2843](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2843) was reported partly
 * because of it).
 */
describe('SearchComponent: choosing a result closes the drop down', () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;

  const PARENT = {
    name: 'Building',
    displayTemplate: '${name}',
    features: []
  } as unknown as SearchResultItem<unknown>;

  const FEATURE = { name: 'Memorial Student Center' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: EnvironmentService, useValue: { value: vi.fn() } },
        { provide: SearchService, useValue: { search: vi.fn(), getSources: vi.fn().mockReturnValue(of([])), store: of([]) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  it('stays closed when the chosen option takes focus straight after the selection', () => {
    // The list is open, as it is while a visitor is picking from it.
    component.setFocus();
    expect(component.searchResultsActive).toBe(true);

    // `mousedown` on an option.
    component.setSelected(FEATURE, PARENT);
    expect(component.searchResultsActive, 'choosing a result should close the drop down').toBe(false);

    // The browser now focuses the option that was clicked, which fires the template's `(focus)="setFocus()"`.
    component.setFocus();

    expect(
      component.searchResultsActive,
      'the drop down reopened when the chosen option took focus, so it stays over the panel underneath'
    ).toBe(false);
  });

  it('still opens when a visitor focuses the box again afterwards', () => {
    component.setFocus();
    component.setSelected(FEATURE, PARENT);
    // The focus the browser gives the chosen option.
    component.setFocus();

    // A visitor clicking back into the box must get the list, or they can never search again.
    component.setFocus();

    expect(component.searchResultsActive, 'the box no longer opens its list when it is focused again').toBe(true);
  });
});

/**
 * Walking the results with the arrow keys (#3471). Down from the box goes to the first result; down at the last one stays
 * there; up from the first goes back to the box. The search keeps this when it moves to the shared keyboard navigation,
 * which by default wraps round at both ends instead, as the autocomplete wants.
 */
describe('SearchComponent: the arrow keys', () => {
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: EnvironmentService, useValue: { value: vi.fn() } },
        { provide: SearchService, useValue: { search: vi.fn(), getSources: vi.fn().mockReturnValue(of([])), store: of() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    // Three results showing, as after typing a search.
    fixture.componentInstance.searchResults = new SearchResult<unknown>({
      results: [
        {
          name: 'Building',
          displayTemplate: '{{name}}',
          features: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
          breadcrumbs: { source: undefined, value: '' }
        }
      ]
    });
    fixture.componentInstance.searchResultStatus = true;
    // The component is OnPush: results set from outside are drawn once it is marked for check.
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.componentInstance.setFocus();
    fixture.detectChanges();
  });

  afterEach(() => fixture.nativeElement.remove());

  const box = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const results = () => Array.from(fixture.nativeElement.querySelectorAll('.result-item .focusable')) as HTMLElement[];
  const press = (key: 'ArrowDown' | 'ArrowUp') => {
    const legacy = { ArrowDown: 40, ArrowUp: 38 }[key];
    (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: legacy, bubbles: true }));
    fixture.detectChanges();
  };

  it('goes from the box to the first result, and stays on the last', () => {
    expect(results()).toHaveLength(3);
    box().focus();

    press('ArrowDown');
    expect(document.activeElement).toBe(results()[0]);

    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    expect(document.activeElement, 'down at the last result wrapped round instead of staying').toBe(results()[2]);
  });

  it('goes back up to the box from the first result, and no further', () => {
    expect(results()).toHaveLength(3);
    box().focus();
    press('ArrowDown');

    press('ArrowUp');
    expect(document.activeElement, 'up from the first result did not go back to the box').toBe(box());

    press('ArrowUp');
    expect(document.activeElement, 'up from the box moved focus').toBe(box());
  });
});
