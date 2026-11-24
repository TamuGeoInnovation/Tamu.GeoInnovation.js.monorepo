import { Component, Directive, TemplateRef, computed, contentChild, input, output, signal, viewChild } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { DatatableComponent, NgxDatatableModule, SortPropDir } from '@swimlane/ngx-datatable';

import { DashboardScrollComponent } from '@tamu-gisc/gisday/platform/ngx/common';

/** One row of a dashboard's table: a thing counted (an event, a university, a feature type) and its counts. */
export interface DashboardTableRow {
  /** Unique among the rows: what `toggled` emits. */
  key: string;
  name: string;
  /** A line under the name, such as an event's venue. */
  note?: string | null;
  /** When the thing happens, shown in its own sortable column if any row has one. */
  when?: string | null;
  total: number;
  counts: Record<string, number>;
}

/** A count column: its key in each row's `counts`, and its heading. */
export interface DashboardTableColumn {
  key: string;
  label: string;
  /**
   * The total row's figure, when the column's counts do not add up: a person counted in two rows is one person (#2894).
   * Without it, the column's sum.
   */
  total?: number;
}

/**
 * The narrowest each kind of column may be, in pixels (#3006), small enough that the check-in dashboard's ten columns
 * fit the 879 px a 1280 px screen gives the table beside the admin menu. At 88 px a count column, they did not, and the
 * last columns, and an opened event's Export as CSV and times, were cut off with no way to scroll to them. A count
 * column's narrowest still holds its heading's longest word, "academia" (66 px), inside its narrower padding.
 *
 * Each column also grows in proportion to its narrowest (its `flexGrow` is the same number), so wherever the table fits,
 * no column is ever below its narrowest. ngx-datatable's flex mode does not give back the width a column held at its
 * minimum takes from the others, so a column whose share falls below its minimum leaves the table wider than its box.
 */
export const DASHBOARD_TABLE_WIDTHS = { name: 192, when: 88, total: 66, count: 75 } as const;

/**
 * The table's narrowest: every column at its narrowest. The table is never drawn narrower, so in less space it scrolls
 * in its own box rather than cutting off its last columns.
 */
export function dashboardTableMinWidth(countColumns: number, hasWhen: boolean): number {
  const { name, when, total, count } = DASHBOARD_TABLE_WIDTHS;

  return name + (hasWhen ? when : 0) + total + countColumns * count;
}

/** What a row opens to: `<ng-template tamuGiscDashboardRowDetail let-row>`, given the row. */
@Directive({ selector: '[tamuGiscDashboardRowDetail]' })
export class DashboardRowDetailDirective {}

/** The property a count column reads from a row the table draws. */
export function countProp(key: string): string {
  return `count_${key}`;
}

/**
 * The rows as the table draws them: each count also a property of its own. ngx-datatable's total row reads a column's
 * property as one name, not a path, so a column on `counts.industry` would total 0.
 */
export function tableRowsOf(rows: Array<DashboardTableRow>): Array<DashboardTableRow & Record<string, unknown>> {
  return rows.map((row) => ({ ...row, ...Object.fromEntries(Object.entries(row.counts).map(([key, n]) => [countProp(key), n])) }));
}

/**
 * The sort to keep when the table changes it: as the table asks, except that a column clicked for the first time starts
 * with the highest when it is a count. The table itself always starts a column A to Z, or lowest first.
 */
export function adjustSorts(next: Array<SortPropDir>, previous: Array<SortPropDir>, ascending: Set<string>): Array<SortPropDir> {
  const sort = next[0];

  if (!sort) {
    return [];
  }

  const prop = String(sort.prop);
  const fresh = !previous.some((p) => String(p.prop) === prop);

  return fresh && !ascending.has(prop) ? [{ prop, dir: 'desc' }] : [{ prop, dir: sort.dir }];
}

/** Names compared as a reader would, ignoring case; a missing time sorts last. */
export function compareNames(a: string | null, b: string | null): number {
  return (a ?? '').localeCompare(b ?? '', undefined, { sensitivity: 'base', numeric: true });
}

export function compareTimes(a: string | null, b: string | null): number {
  return (a ? new Date(a).getTime() : Infinity) - (b ? new Date(b).getTime() : Infinity);
}

/**
 * A dashboard's table of counts (#2891): a row per thing counted, a column per category, and a total row that stays
 * at the bottom whatever the order. A click on a heading sorts by it, and again reverses it. A click on a row opens
 * what the page gives it under that row, one row at a time. Drawn with ngx-datatable, as the admin's other sortable
 * tables are (the research competition list, #2808). First used by the RSVP dashboard (#2878).
 */
@Component({
  selector: 'tamu-gisc-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.scss'],
  imports: [NgxDatatableModule, NgTemplateOutlet, DatePipe, DashboardScrollComponent]
})
export class DashboardTableComponent {
  public readonly rows = input.required<Array<DashboardTableRow>>();
  public readonly columns = input.required<Array<DashboardTableColumn>>();
  /** The first column's heading, and the total row's name. */
  public readonly nameLabel = input('Name');
  public readonly totalLabel = input('All');
  /** The total column's heading, such as "Checked in". */
  public readonly totalHeading = input('Total');
  /** How `when` is shown, in Central time. */
  public readonly whenFormat = input('EEE MMM d, h:mm a');

  /** The key of the row opened, or null when it is closed. */
  public readonly toggled = output<string | null>();

  public readonly detail = contentChild(DashboardRowDetailDirective, { read: TemplateRef });
  private readonly table = viewChild(DatatableComponent);

  public readonly tableRows = computed(() => tableRowsOf(this.rows()));
  public readonly countProp = countProp;
  public readonly hasWhen = computed(() => this.rows().some((r) => Boolean(r.when)));
  public readonly widths = DASHBOARD_TABLE_WIDTHS;
  public readonly minWidth = computed(() => dashboardTableMinWidth(this.columns().length, this.hasWhen()));
  public readonly sorts = signal<Array<SortPropDir>>([]);
  private readonly opened = signal<string | null>(null);

  public readonly compareNames = compareNames;
  public readonly compareTimes = compareTimes;
  public readonly sum = (cells: Array<number>) => cells.reduce((total, n) => total + (Number(n) || 0), 0);
  /** Each count column's total: its own, or its sum. Made once per set of columns, so the table is not redrawn. */
  public readonly summaries = computed(
    () => new Map(this.columns().map((c) => [c.key, c.total === undefined ? this.sum : () => c.total]))
  );
  public readonly totalName = () => this.totalLabel();
  public readonly blank = () => '';

  public onSortsChange(next: Array<SortPropDir>) {
    this.sorts.set(adjustSorts(next, this.sorts(), new Set(['name', 'when'])));
  }

  public onActivate(event: { type: string; row: DashboardTableRow; event: Event }) {
    const key = event.event instanceof KeyboardEvent ? event.event.key : null;

    if (event.type === 'click' || key === 'Enter' || key === ' ') {
      this.toggle(event.row);
    }
  }

  public isOpen(row: DashboardTableRow): boolean {
    return this.opened() === row.key;
  }

  /** Opens the row, closing any other, or closes it if it is open. */
  public toggle(row: DashboardTableRow) {
    const detail = this.table()?.rowDetail;
    const closing = this.opened() === row.key;

    detail?.collapseAllRows();

    if (closing) {
      this.opened.set(null);
    } else {
      detail?.toggleExpandRow(row);
      this.opened.set(row.key);
    }

    this.toggled.emit(this.opened());
  }
}
