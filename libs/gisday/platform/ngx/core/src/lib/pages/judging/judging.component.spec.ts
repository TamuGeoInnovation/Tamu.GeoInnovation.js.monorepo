import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { JudgingService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { JUDGING_CLOSED_MESSAGE, JudgePageDto } from '@tamu-gisc/gisday/common';

import { JudgingComponent } from './judging.component';

/** A judge's page, as a link opens it: one competition, its rubric, and two entries, one already scored. Made-up people. */
function judgePage(closed = false): JudgePageDto {
  return {
    firstName: 'Dana',
    lastName: 'Judge',
    expires: '2026-11-23T18:00:00.000Z',
    competitions: [
      {
        competition: 'graduate-poster',
        label: 'Graduate poster competition',
        sessions: [{ guid: 'e-1', name: 'Graduate posters' }],
        closed,
        rubric: {
          guid: 'r-1',
          competitionType: 'poster',
          name: 'A rubric',
          description: null,
          criteria: [
            {
              guid: 'c-1',
              position: 0,
              name: 'Clarity',
              maxPoints: 20,
              levels: [
                { label: 'Excellent (A)', description: 'Crystal clear.' },
                { label: 'Needs Improvement (D/F)', description: 'Hard to follow.' }
              ]
            },
            { guid: 'c-2', position: 1, name: 'Design', maxPoints: 10, levels: [] }
          ]
        },
        submissions: [
          {
            guid: 's-1',
            title: 'Aquifers',
            presenters: ['Avery Example', 'Blair Sample'],
            abstract: 'About aquifers.',
            format: 'group',
            assessment: null
          },
          {
            guid: 's-2',
            title: 'Rivers',
            presenters: ['Casey Test'],
            abstract: null,
            format: 'individual',
            assessment: { scores: { 'c-1': 10, 'c-2': 5 }, total: 15, comment: 'Good.', updated: '2026-11-19T18:00:00Z' }
          }
        ]
      }
    ]
  };
}

/**
 * #3183: a judge's page, from their emailed judging link. A row per entry; an entry opens in a details panel (#3230) with
 * a score per criterion and its levels, Save, and how many are scored; read-only once judging closes.
 */
describe('JudgingComponent (#3183)', () => {
  async function open(options: { page?: JudgePageDto | 'invalid'; assess?: jest.Mock; token?: string | null } = {}) {
    const judging = {
      forLink: jest.fn(() =>
        options.page === 'invalid'
          ? throwError(() => new HttpErrorResponse({ status: 404 }))
          : of(JSON.parse(JSON.stringify(options.page ?? judgePage())))
      ),
      assess:
        options.assess ??
        jest.fn((_token: string, _submission: string, a: { scores: Record<string, number>; comment: string }) =>
          of({
            scores: a.scores,
            total: Object.values(a.scores).reduce((x, y) => x + y, 0),
            comment: a.comment,
            updated: '2026-11-19T19:00:00Z'
          })
        )
    };

    TestBed.configureTestingModule({
      imports: [JudgingComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap(options.token === null ? {} : { token: options.token ?? 'a-link' })) }
        },
        { provide: JudgingService, useValue: judging }
      ]
    });

    const fixture = TestBed.createComponent(JudgingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    // An entry's row in its tab's list (#3200), which opens it in the details panel (#3230).
    const row = (title: string) =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('button.entry')).find((b) =>
        b.querySelector('.entry-title')?.textContent?.includes(title)
      );
    const panel = () => root.querySelector<HTMLElement>('tamu-gisc-details-panel');
    const openEntry = async (title: string) => {
      row(title).click();
      await settle();

      return panel();
    };
    const save = async () => {
      panel().querySelector<HTMLInputElement>('input[type="submit"]').click();
      await settle();
    };
    const press = async (key: string, target: EventTarget = document) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle();
    };
    const button = (text: string) =>
      Array.from(panel()?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) => b.textContent?.trim() === text);

    return { fixture, root, judging, row, panel, openEntry, save, press, button, settle, component: fixture.componentInstance };
  }

  it('opens an entry in a panel with its title, presenters and abstract, and a score box per criterion with its levels', async () => {
    const { root, openEntry } = await open();

    expect(root.querySelector('.tab.active')?.textContent).toContain('Graduate poster competition');
    expect(Array.from(root.querySelectorAll('.entry-title')).map((t) => t.textContent?.trim())).toEqual([
      'Aquifers',
      'Rivers'
    ]);

    const aquifers = await openEntry('Aquifers');

    expect(aquifers.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Aquifers');
    expect(aquifers.querySelector('.panel-title')?.textContent).toBe('Aquifers');
    expect(aquifers.querySelector('.presenters')?.textContent).toBe('Avery Example, Blair Sample');
    expect(aquifers.textContent).toContain('About aquifers.');
    expect(Array.from(aquifers.querySelectorAll('.criterion > p')).map((p) => p.textContent?.trim())).toEqual([
      'Clarity (0 to 20)',
      'Design (0 to 10)'
    ]);
    expect(aquifers.querySelectorAll('input[type="number"]')).toHaveLength(2);
    // #3191: each criterion's levels as boxes side by side, like the rubric's table, always shown: no Levels toggle.
    const firstCriterion = aquifers.querySelector('.criterion');

    expect(firstCriterion?.querySelector('details')).toBeNull();
    expect(
      Array.from(firstCriterion?.querySelectorAll('.levels > .level') ?? []).map((box) => [
        box.querySelector('.level-label')?.textContent,
        box.querySelector('.level-description')?.textContent
      ])
    ).toEqual([
      ['Excellent (A)', 'Crystal clear.'],
      ['Needs Improvement (D/F)', expect.any(String)]
    ]);
  });

  /** #3200: a tab per competition, the first open; each entry a row; entries by first author's last name. */
  describe('tabs and entries (#3200)', () => {
    const tabs = (root: HTMLElement) =>
      Array.from(root.querySelectorAll<HTMLElement>('tamu-gisc-tabs .tab')).map((t) => ({
        label: t.textContent?.trim(),
        selected: t.getAttribute('aria-selected')
      }));

    it('shows a tab per competition with the first open, and switches on a click', async () => {
      const { root, fixture, row } = await open({ page: twoCompetitions() });

      expect(tabs(root)).toEqual([
        { label: 'Graduate poster competition', selected: 'true' },
        { label: 'Undergraduate poster competition', selected: 'false' }
      ]);
      expect(row('Aquifers')).toBeDefined();
      expect(row('Wetlands')).toBeUndefined();

      root.querySelectorAll<HTMLElement>('tamu-gisc-tabs .tab')[1].click();
      fixture.detectChanges();

      expect(tabs(root).map((t) => t.selected)).toEqual(['false', 'true']);
      expect(row('Wetlands')).toBeDefined();
      expect(row('Aquifers')).toBeUndefined();
    });

    it("shows each entry as a row: its title, the authors and the judge's score or Not scored yet", async () => {
      const { root, row } = await open();

      const parts = (title: string) =>
        Array.from(row(title)?.querySelectorAll(':scope > span') ?? []).map((p) => p.textContent?.trim());

      expect(parts('Aquifers')).toEqual(['Aquifers', 'Avery Example, Blair Sample', 'Not scored yet']);
      expect(parts('Rivers')).toEqual(['Rivers', 'Casey Test', 'Scored 15 of 30']);
      // The form is in the panel, not the list.
      expect(root.querySelector('form.submission')).toBeNull();
    });

    it("lists the entries by their first author's last name, an entry with no authors last", async () => {
      const page = judgePage();
      const [one] = page.competitions[0].submissions;

      page.competitions[0].submissions = [
        { ...one, guid: 'a', title: 'Zebra', presenters: ['Morgan Young', 'Avery Adams'] },
        { ...one, guid: 'b', title: 'No one', presenters: [] },
        { ...one, guid: 'c', title: 'Ice', presenters: ['Jordan Álvarez'] },
        { ...one, guid: 'd', title: 'Hills', presenters: ['casey baker'] }
      ];

      const { root } = await open({ page });

      expect(Array.from(root.querySelectorAll('.entry-title')).map((t) => t.textContent?.trim())).toEqual([
        'Ice',
        'Hills',
        'Zebra',
        'No one'
      ]);
    });
  });

  /** #3230: a search box on the page and on the panel; each entry in its own panel; Escape closes it. */
  describe('the search and the details panel (#3230)', () => {
    const type = async (box: HTMLElement, text: string, settle: () => Promise<void>) => {
      const input = box.querySelector<HTMLInputElement>('.judge-search input');

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();

      return Array.from(box.querySelectorAll<HTMLButtonElement>('.judge-search .match'));
    };
    const text = (e: Element) => e.textContent?.replace(/\s+/g, ' ').trim();

    it('finds an entry by its title or an author in every competition, and opens it on its tab, clearing the search', async () => {
      const { root, settle, panel, component } = await open({ page: twoCompetitions() });

      expect((await type(root, 'blair', settle)).map(text)).toEqual([
        'Aquifers | Avery Example, Blair Sample · Graduate poster competition'
      ]);
      expect((await type(root, 'wetl', settle)).map(text)).toEqual([
        'Wetlands | Drew Sample · Undergraduate poster competition'
      ]);
      // Not by the abstract (decided 2A).
      expect(await type(root, 'about aquifers', settle)).toEqual([]);
      expect(root.querySelector('.judge-search .category-name')?.textContent).toContain('No entries match');

      (await type(root, 'wetl', settle))[0].click();
      await settle();

      expect(panel()?.querySelector('.panel-title')?.textContent).toBe('Wetlands');
      expect(panel()?.querySelector('.panel-competition')?.textContent).toBe('Undergraduate poster competition');
      expect(component.tab()).toBe(1);
      expect(component.search.value).toBe('');
    });

    it('has the search on the panel too, to go straight to another entry', async () => {
      const { openEntry, settle, panel } = await open();

      const opened = await openEntry('Aquifers');
      (await type(opened, 'casey', settle))[0].click();
      await settle();

      expect(panel()?.querySelector('.panel-title')?.textContent).toBe('Rivers');
    });

    it('moves to the entry before or after with Previous and Next, saying where it is', async () => {
      const { openEntry, button, panel, settle } = await open();

      await openEntry('Aquifers');

      expect(panel().querySelector('.panel-position')?.textContent).toBe('1 of 2');
      expect(button('Previous')?.disabled).toBe(true);

      button('Next').click();
      await settle();

      expect(panel().querySelector('.panel-title')?.textContent).toBe('Rivers');
      expect(panel().querySelector('.panel-position')?.textContent).toBe('2 of 2');
      expect(button('Next')?.disabled).toBe(true);

      button('Previous').click();
      await settle();

      expect(panel().querySelector('.panel-title')?.textContent).toBe('Aquifers');
    });

    it('closes on Escape, on Close, and on a click beside it', async () => {
      const { openEntry, press, panel, button, settle } = await open();

      await openEntry('Aquifers');
      await press('Escape');
      expect(panel()).toBeNull();

      await openEntry('Aquifers');
      button('Close').click();
      await settle();
      expect(panel()).toBeNull();

      await openEntry('Aquifers');
      panel().querySelector<HTMLElement>('.details-panel-backdrop').click();
      await settle();
      expect(panel()).toBeNull();
    });

    it("closes only the search's matches on Escape in the search box while they are listed", async () => {
      const { openEntry, press, panel, settle } = await open();

      const opened = await openEntry('Aquifers');
      await type(opened, 'casey', settle);
      await press('Escape', opened.querySelector('.judge-search input'));

      expect(panel()).not.toBeNull();
      expect(opened.querySelector('.judge-search .search-results-container')).toBeNull();

      await press('Escape');

      expect(panel()).toBeNull();
    });

    it('asks before leaving scores that are changed and not saved, and keeps them on Stay (decided 5B)', async () => {
      const { openEntry, press, panel, button, settle, component } = await open();

      await openEntry('Aquifers');
      const form = component.formFor(judgePage().competitions[0].submissions[0]);
      form.patchValue({ 'c-1': '17' });
      form.markAsDirty();

      await press('Escape');

      expect(panel()?.querySelector('.leave-ask')?.textContent).toContain('not saved');

      button('Stay').click();
      await settle();

      expect(panel()?.querySelector('.leave-ask')).toBeNull();
      expect(form.getRawValue()['c-1']).toBe('17');

      // Next asks too; Escape on the question is Stay.
      button('Next').click();
      await settle();
      expect(panel()?.querySelector('.leave-ask')).not.toBeNull();
      await press('Escape');
      expect(panel()?.querySelector('.leave-ask')).toBeNull();
      expect(panel()?.querySelector('.panel-title')?.textContent).toBe('Aquifers');
    });

    it('puts the saved scores back on Leave without saving, and goes where the judge asked', async () => {
      const { openEntry, press, panel, button, settle, component } = await open();

      await openEntry('Rivers');
      const rivers = judgePage().competitions[0].submissions[1];
      component.formFor(rivers).patchValue({ 'c-1': '1' });
      component.formFor(rivers).markAsDirty();

      await press('Escape');
      button('Leave without saving').click();
      await settle();

      expect(panel()).toBeNull();
      expect(component.formFor(rivers).getRawValue()['c-1']).toBe('10');
      expect(component.unsaved(rivers)).toBe(false);
    });

    it('does not ask once the scores are saved', async () => {
      const { openEntry, press, panel, save, component } = await open();

      await openEntry('Aquifers');
      const form = component.formFor(judgePage().competitions[0].submissions[0]);
      form.patchValue({ 'c-1': '18', 'c-2': '7' });
      form.markAsDirty();
      await save();
      await press('Escape');

      expect(panel()).toBeNull();
    });
  });

  it('shows what the judge saved before, and how many entries they have scored', async () => {
    const { root, openEntry, component } = await open();

    expect(root.querySelector('.progress')?.textContent).toBe('1 of 2 scored');
    expect(component.formFor(judgePage().competitions[0].submissions[1]).getRawValue()).toEqual({
      'c-1': '10',
      'c-2': '5',
      comment: 'Good.'
    });
    expect((await openEntry('Rivers')).querySelector('.saved')?.textContent).toContain('Scored 15 of 30 points');
  });

  it('saves the scores as numbers with the comment, and counts the entry as scored', async () => {
    const { root, openEntry, panel, save, judging, component } = await open();

    await openEntry('Aquifers');
    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '18', 'c-2': '7', comment: 'Clear.' });
    await save();

    expect(judging.assess).toHaveBeenCalledWith('a-link', 's-1', { scores: { 'c-1': 18, 'c-2': 7 }, comment: 'Clear.' });
    expect(panel().querySelector('.saved')?.textContent).toContain('Saved, 25 of 30 points');
    expect(root.querySelector('.progress')?.textContent).toBe('2 of 2 scored');
  });

  it('refuses a score above the criterion’s points before sending anything', async () => {
    const { openEntry, panel, save, judging, component } = await open();

    await openEntry('Aquifers');
    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '21', 'c-2': '7' });
    await save();

    expect(judging.assess).not.toHaveBeenCalled();
    expect(panel().querySelector('.submission [role="alert"]')?.textContent).toContain(
      'Clarity is scored as a whole number from 0 to 20.'
    );
  });

  it("shows the API's reason when it refuses the scores", async () => {
    const refused = jest.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: JUDGING_CLOSED_MESSAGE } }))
    );
    const { openEntry, panel, save, component } = await open({ assess: refused });

    await openEntry('Aquifers');
    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '1', 'c-2': '1' });
    await save();

    expect(panel().querySelector('.submission [role="alert"]')?.textContent).toContain(JUDGING_CLOSED_MESSAGE);
  });

  it('is read-only once judging is closed, and says so', async () => {
    const { root, openEntry } = await open({ page: judgePage(true) });

    expect(root.textContent).toContain('Judging is closed for this competition');

    const rivers = await openEntry('Rivers');

    expect(rivers.querySelector('input[type="submit"]')).toBeNull();
    expect(Array.from(rivers.querySelectorAll<HTMLInputElement>('input[type="number"]')).every((i) => i.disabled)).toBe(true);
  });

  it('says when the link does not work, or there is none', async () => {
    expect((await open({ page: 'invalid' })).root.textContent).toContain('This link has expired or is not valid');

    TestBed.resetTestingModule();

    const none = await open({ token: null });

    expect(none.root.textContent).toContain('This page opens from the link in your judging email.');
    expect(none.judging.forLink).not.toHaveBeenCalled();
  });
});

/** The same judge in two competitions: the graduate one as above, and a made-up undergraduate one. */
function twoCompetitions(): JudgePageDto {
  const page = judgePage();
  const [graduate] = page.competitions;

  page.competitions.push({
    ...graduate,
    competition: 'undergraduate-poster',
    label: 'Undergraduate poster competition',
    submissions: [{ ...graduate.submissions[0], guid: 's-9', title: 'Wetlands', presenters: ['Drew Sample'] }]
  });

  return page;
}
