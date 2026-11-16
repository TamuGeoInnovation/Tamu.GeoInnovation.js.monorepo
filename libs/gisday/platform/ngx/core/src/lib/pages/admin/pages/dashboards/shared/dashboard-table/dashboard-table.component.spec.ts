import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import {
  compareNames,
  compareTimes,
  DashboardRowDetailDirective,
  DashboardTableComponent,
  DashboardTableRow,
  adjustSorts
} from './dashboard-table.component';

const rows: Array<DashboardTableRow> = [
  { key: 'b', name: 'Workshop', note: 'ILCB 111', when: '2026-11-18T15:00:00.000Z', total: 3, counts: { students: 2, industry: 1 } },
  { key: 'a', name: 'keynote', note: null, when: '2026-11-17T20:00:00.000Z', total: 5, counts: { students: 1, industry: 4 } },
  { key: 'c', name: 'Career fair', note: null, when: '2026-11-19T15:00:00.000Z', total: 1, counts: { students: 1, industry: 0 } }
];

@Component({
  imports: [DashboardTableComponent, DashboardRowDetailDirective],
  template: `
    <tamu-gisc-dashboard-table [rows]="rows" [columns]="columns" nameLabel="Event" totalLabel="All events" (toggled)="opened.set($event)">
      <ng-template tamuGiscDashboardRowDetail let-row><p class="detail">People of {{ row.name }}</p></ng-template>
    </tamu-gisc-dashboard-table>
  `
})
class HostComponent {
  public rows = rows;
  public columns = [
    { key: 'students', label: 'Students' },
    { key: 'industry', label: 'Industry' }
  ];
  public opened = signal<string | null>('unset');
}

describe('DashboardTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  const headings = () => Array.from(root.querySelectorAll('.datatable-header-cell-label')).map((h) => h.textContent.trim());
  const names = () =>
    Array.from(root.querySelectorAll('datatable-row-wrapper .dashboard-table-name .bold')).map((n) => n.textContent.trim());
  const summary = () =>
    Array.from(root.querySelectorAll('datatable-summary-row .datatable-body-cell')).map((c) => c.textContent.trim());
  const heading = (label: string) =>
    Array.from(root.querySelectorAll('.datatable-header-cell-label')).find((h) => h.textContent.trim() === label) as HTMLElement;

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    root = fixture.nativeElement as HTMLElement;
    await settle();
  });

  it('heads a column for the name, the time, the total and each category, and keeps the rows in the order given', () => {
    expect(headings()).toEqual(['Event', 'When', 'Total', 'Students', 'Industry']);
    expect(names()).toEqual(['Workshop', 'keynote', 'Career fair']);
  });

  it('adds up every row in a total row, named, at the bottom', () => {
    expect(summary()).toEqual(['All events', '', '9', '4', '5']);
  });

  it('sorts by a name A to Z first, ignoring case, and reverses on a second click', async () => {
    heading('Event').click();
    await settle();
    expect(names()).toEqual(['Career fair', 'keynote', 'Workshop']);

    heading('Event').click();
    await settle();
    expect(names()).toEqual(['Workshop', 'keynote', 'Career fair']);
  });

  it('sorts by a count highest first, and keeps the total row at the bottom', async () => {
    heading('Industry').click();
    await settle();

    expect(names()).toEqual(['keynote', 'Workshop', 'Career fair']);
    expect(summary()[0]).toBe('All events');
  });

  it('sorts by time earliest first, which puts the rows back in date order', async () => {
    heading('Total').click();
    await settle();
    heading('When').click();
    await settle();

    expect(names()).toEqual(['keynote', 'Workshop', 'Career fair']);
  });

  it("opens a row to show what the page gives it, one row at a time, and closes it on a second click", async () => {
    const cell = (name: string) =>
      Array.from(root.querySelectorAll('datatable-row-wrapper .datatable-body-cell')).find((c) => c.textContent.includes(name)) as HTMLElement;

    cell('Workshop').click();
    await settle();
    expect(fixture.componentInstance.opened()).toBe('b');
    expect(Array.from(root.querySelectorAll('.detail')).map((d) => d.textContent)).toEqual(['People of Workshop']);

    cell('keynote').click();
    await settle();
    expect(fixture.componentInstance.opened()).toBe('a');
    expect(Array.from(root.querySelectorAll('.detail')).map((d) => d.textContent)).toEqual(['People of keynote']);

    cell('keynote').click();
    await settle();
    expect(fixture.componentInstance.opened()).toBeNull();
    expect(root.querySelector('.detail')).toBeNull();
  });
});

/** The check-in dashboard's table: an event, its time, who checked in, the RSVPs beside them and six person types. */
@Component({
  imports: [DashboardTableComponent],
  template: `<tamu-gisc-dashboard-table [rows]="rows" [columns]="columns" totalHeading="Checked in"></tamu-gisc-dashboard-table>`
})
class CheckInsHostComponent {
  public rows = rows;
  public columns = ['rsvps', 'undergraduate', 'graduate', 'student', 'academia', 'industry', 'not-given'].map((key) => ({
    key,
    label: key
  }));
}

describe('DashboardTableComponent widths (#3006)', () => {
  // The width the admin page gives the table on a 1280 px screen, measured in Playwright on the RSVPs and Check-ins
  // dashboards. A unit test cannot lay a page out; that measurement is the evidence the table fits.
  const AT_1280 = 879;

  let fixture: ComponentFixture<CheckInsHostComponent>;

  const columns = () =>
    fixture.debugElement.query(By.directive(DatatableComponent)).injector.get(DatatableComponent).columnTemplates();
  const narrowest = () => columns().reduce((sum, column) => sum + (column.minWidth() ?? 0), 0);

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [CheckInsHostComponent] });
    fixture = TestBed.createComponent(CheckInsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("fits the check-in dashboard's ten columns, each at its narrowest, in the width a 1280 px screen gives the table", () => {
    expect(columns()).toHaveLength(10);
    expect(narrowest()).toBeLessThanOrEqual(AT_1280);
  });

  it('grows each column in proportion to its narrowest, so a table that fits has no column squeezed below it', () => {
    const ratios = columns().map((column) => (column.flexGrow() ?? 0) / (column.minWidth() ?? 1));

    expect(new Set(ratios).size).toBe(1);
  });

  it('is never narrower than its columns at their narrowest, so a narrower screen scrolls it in its own box rather than cutting columns off', () => {
    const table = (fixture.nativeElement as HTMLElement).querySelector('ngx-datatable') as HTMLElement;

    expect(table.style.minWidth).toBe(`${narrowest()}px`);
  });
});

describe('DashboardTableComponent sideways scroll (#3029)', () => {
  // At 1024 px the table is wider than its box, and the box's own scrollbar is at the bottom of a table that can be 60
  // rows long. A unit test cannot lay a page out, so the box's widths are given here, and the browser is told it changed
  // size as a ResizeObserver would; Playwright measured the real page at 1024 and 1280 px.
  let fixture: ComponentFixture<CheckInsHostComponent>;
  // Every ResizeObserver made, and what it watches: ngx-datatable makes its own, which are left alone.
  let observers: Array<{ observer: ResizeObserver; callback: ResizeObserverCallback; targets: Set<Element> }>;
  const original = globalThis.ResizeObserver;

  /** Tells whoever watches the table's box that it changed size, as the browser would. */
  function resized() {
    for (const { observer, callback, targets } of observers) {
      if (targets.has(box())) {
        callback([{ target: box() } as unknown as ResizeObserverEntry], observer);
      }
    }
  }

  const box = () => (fixture.nativeElement as HTMLElement).querySelector('.dashboard-scroll') as HTMLElement;
  const rail = () => (fixture.nativeElement as HTMLElement).querySelector('.dashboard-scroll-rail') as HTMLElement | null;

  /** Gives an element the layout jsdom does not have: its widths, and a scroll position that can be set. */
  function layOut(element: HTMLElement, clientWidth: number, scrollWidth: number) {
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(element, 'scrollLeft', { configurable: true, writable: true, value: 0 });
  }

  async function resize(clientWidth: number, scrollWidth: number) {
    layOut(box(), clientWidth, scrollWidth);
    resized();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    observers = [];
    globalThis.ResizeObserver = class {
      private readonly targets = new Set<Element>();

      constructor(callback: ResizeObserverCallback) {
        observers.push({ observer: this as unknown as ResizeObserver, callback, targets: this.targets });
      }
      public observe(target: Element) {
        this.targets.add(target);
      }
      public unobserve(target: Element) {
        this.targets.delete(target);
      }
      public disconnect() {
        this.targets.clear();
      }
    } as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({ imports: [CheckInsHostComponent] });
    fixture = TestBed.createComponent(CheckInsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    globalThis.ResizeObserver = original;
  });

  it('keeps a sideways scrollbar under the table, pinned to the bottom of the window, when the table is wider than its box', async () => {
    await resize(600, 891);

    expect(rail()).not.toBeNull();
    expect(rail()?.hidden).toBe(false);
    expect((rail()?.firstElementChild as HTMLElement).style.width).toBe('891px');
  });

  it('scrolls the table with that scrollbar, and the scrollbar with the table', async () => {
    await resize(600, 891);
    layOut(rail() as HTMLElement, 600, 891);

    (rail() as HTMLElement).scrollLeft = 150;
    rail()?.dispatchEvent(new Event('scroll'));
    expect(box().scrollLeft).toBe(150);

    box().scrollLeft = 40;
    box().dispatchEvent(new Event('scroll'));
    expect((rail() as HTMLElement).scrollLeft).toBe(40);
  });

  it('shows no second scrollbar when the table fits its box', async () => {
    await resize(891, 891);

    expect(rail()?.hidden ?? true).toBe(true);
  });
});

describe('adjustSorts()', () => {
  const ascending = new Set(['name', 'when']);

  it('starts a count with the highest, where the table would start with the lowest', () => {
    expect(adjustSorts([{ prop: 'total', dir: 'asc' }], [], ascending)).toEqual([{ prop: 'total', dir: 'desc' }]);
  });

  it('starts a name or a time with the first, as the table does', () => {
    expect(adjustSorts([{ prop: 'name', dir: 'asc' }], [{ prop: 'total', dir: 'desc' }], ascending)).toEqual([{ prop: 'name', dir: 'asc' }]);
  });

  it('lets a second click on the same column reverse it', () => {
    expect(adjustSorts([{ prop: 'total', dir: 'asc' }], [{ prop: 'total', dir: 'desc' }], ascending)).toEqual([{ prop: 'total', dir: 'asc' }]);
  });
});

describe('compareNames() and compareTimes()', () => {
  it('compare names ignoring case, and numbers in names by value', () => {
    expect(['b', 'A', 'Room 10', 'Room 9'].sort(compareNames)).toEqual(['A', 'b', 'Room 9', 'Room 10']);
  });

  it('put a missing time last', () => {
    expect([null, '2026-11-18T15:00:00Z', '2026-11-17T15:00:00Z'].sort(compareTimes)).toEqual([
      '2026-11-17T15:00:00Z',
      '2026-11-18T15:00:00Z',
      null
    ]);
  });
});
