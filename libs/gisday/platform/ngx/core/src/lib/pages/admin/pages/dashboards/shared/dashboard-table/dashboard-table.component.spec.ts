import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { PERSON_TYPE_COLUMNS } from '../dashboard-people/dashboard-people.component';
import { VGI_COLUMNS } from '../../vgi-dashboard/vgi-dashboard.component';
import {
  compareNames,
  compareTimes,
  DASHBOARD_TABLE_WIDTHS,
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

  it('keeps the bordered frame around the table as wide as the table, so the box around both scrolls to its last columns (#3135)', () => {
    // The frame is the shared .datatable-container, whose overflow: hidden rounds its corners. Since #3121 moved the
    // scrolling out to tamu-gisc-dashboard-scroll, a frame only as wide as the box cut the table off at the box's edge,
    // and the box, holding nothing wider than itself, drew no rail: Playwright measured 669 px of box and frame around
    // an 871 px check-ins table at 1024 px, with the box's scroll width 669.
    const frame = (fixture.nativeElement as HTMLElement).querySelector('.datatable-container') as HTMLElement;

    expect(frame.style.minWidth).toBe(`${narrowest()}px`);
  });
});

describe('DashboardTableComponent sideways scroll (#3029, #3135)', () => {
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
    // #3120 caps an opened row's people; the table itself is as tall as its rows, its rail standing in for its scrollbar.
    expect(box().classList).not.toContain('dashboard-scroll-capped');
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

  // #3135: loaded at 1280 px and resized to 1024 px in place, the table must end as a fresh 1024 px load draws it, its
  // rail measured again. The box narrows first; ngx-datatable recomputes the columns after it, from a ResizeObserver
  // of its own, so the table's width is only known once that has run. Until then the box shows the shared spinner.
  const spinner = () => (fixture.nativeElement as HTMLElement).querySelector('tamu-gisc-dashboard-scroll .loader');
  const railWidth = () => (rail()?.firstElementChild as HTMLElement | null)?.style.width;
  /** Well past the time the box waits, after the last resize, for the table to settle. */
  const recomputed = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    fixture.detectChanges();
  };

  it('measures the rail again once a resized table has recomputed its columns, and drops it when the table fits again (#3135)', async () => {
    // Loaded at 1280 px: the table fits.
    await resize(867, 867);
    expect(rail()?.hidden).toBe(true);

    // Resized to 1024 px: the box is narrower at once, the columns at their narrowest only after.
    await resize(669, 867);
    layOut(box(), 669, 799);
    await recomputed();

    expect(rail()?.hidden).toBe(false);
    expect(railWidth()).toBe('799px');

    // And back to 1280 px: no rail where none is needed.
    await resize(867, 867);
    await recomputed();

    expect(rail()?.hidden).toBe(true);
  });

  it('shows the shared spinner while a resized table recomputes, and takes it away once the rail is measured (#3135)', async () => {
    await resize(867, 867);
    expect(spinner()).toBeNull();

    await resize(669, 867);
    expect(spinner()).not.toBeNull();

    layOut(box(), 669, 799);
    await recomputed();

    expect(spinner()).toBeNull();
    expect(railWidth()).toBe('799px');
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

/**
 * #3219: at 1280 px the Check-ins dashboard's "Checked in" heading was cut inside its first word ("Checkec / in"). A
 * column is drawn at its narrowest whenever the table is wider than its box, so each word of a count or total column's
 * heading must fit inside that column's narrowest less its padding. A heading may break between words, and at a soft
 * hyphen ("Under­graduate"), so those are the pieces measured.
 *
 * A unit test cannot draw text, so the widths are measured: Chrome on gisday.tamu.edu, 23 November 2026, Open Sans at
 * 14 px, as the headings are drawn. "Checked" (57.9 px) had 0.1 px to spare in its 58 and was cut, so each word needs a
 * pixel more than its own width. A word that is not listed fails the check until it is measured.
 */
describe("DashboardTableComponent headings (#3219)", () => {
  const WORD_WIDTHS: Record<string, number> = {
    Total: 33.9,
    Checked: 57.9,
    in: 12.7,
    'Sub-': 30.5,
    missions: 59.5,
    RSVPs: 41.3,
    'Under-': 47.3,
    graduate: 61.3,
    Graduate: 63.9,
    'Student,': 57.3,
    'classi-': 41.5,
    fication: 50.7,
    not: 22.9,
    given: 36.1,
    Faculty: 47.9,
    '&': 10.5,
    academia: 65.4,
    Industry: 56.5,
    Not: 24.9,
    New: 30.2,
    finds: 33.6,
    Repeats: 54.5,
    People: 46.5,
    'Un-': 24.2,
    verified: 51.2,
    Verified: 52.5,
    'Dis-': 26.1,
    carded: 47
  };
  /** A count or total heading's padding, 0.25rem each side (the table's stylesheet). */
  const PADDING = 8;
  const SPARE = 1;

  /** The pieces a heading may be broken into: its words, and each word's parts at a soft hyphen, with the hyphen. */
  function pieces(heading: string): Array<string> {
    return heading.split(/\s+/).flatMap((word) => {
      const parts = word.split('­');

      return parts.map((part, i) => (i < parts.length - 1 ? `${part}-` : part));
    });
  }

  /** Each piece that does not fit, with its width: none, for a heading that breaks only between words. */
  function tooWide(heading: string, narrowest: number): Array<string> {
    return pieces(heading)
      .filter((piece) => !(piece in WORD_WIDTHS) || WORD_WIDTHS[piece] + SPARE > narrowest - PADDING)
      .map((piece) => `${piece} (${WORD_WIDTHS[piece] ?? 'not measured'})`);
  }

  // The total column's headings, from each dashboard's page: the default, Check-ins and the VGI dashboard.
  it.each(['Total', 'Checked in', 'Sub­missions'])('keeps the total heading %j whole at its narrowest', (heading) => {
    expect(tooWide(heading, DASHBOARD_TABLE_WIDTHS.total)).toEqual([]);
  });

  it.each([{ key: 'rsvps', label: 'RSVPs' }, ...PERSON_TYPE_COLUMNS, ...VGI_COLUMNS].map((column) => column.label))(
    'keeps the count heading %j whole at its narrowest',
    (heading) => {
      expect(tooWide(heading, DASHBOARD_TABLE_WIDTHS.count)).toEqual([]);
    }
  );
});
