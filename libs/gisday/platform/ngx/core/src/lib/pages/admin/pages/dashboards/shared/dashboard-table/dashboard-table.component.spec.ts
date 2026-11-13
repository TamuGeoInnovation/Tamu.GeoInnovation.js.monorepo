import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
