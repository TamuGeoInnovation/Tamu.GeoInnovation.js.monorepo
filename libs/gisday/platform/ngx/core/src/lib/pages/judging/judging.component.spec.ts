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
 * #3183: a judge's page, from their emailed judging link. A card per entry, a score per criterion with its levels, Save,
 * and how many are scored; read-only once judging closes.
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
    const card = (title: string) =>
      Array.from(root.querySelectorAll<HTMLFormElement>('form.submission')).find((f) =>
        f.querySelector('.form-section-title')?.textContent?.includes(title)
      );
    const save = async (title: string) => {
      card(title).querySelector<HTMLInputElement>('input[type="submit"]').click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { fixture, root, judging, card, save, component: fixture.componentInstance };
  }

  it('shows a card per entry with its title, presenters and abstract, and a score box per criterion with its levels', async () => {
    const { root, card } = await open();

    expect(root.querySelector('h2')?.textContent).toContain('Graduate poster competition');
    expect(Array.from(root.querySelectorAll('.form-section-title')).map((t) => t.textContent?.trim())).toEqual([
      'Aquifers',
      'Rivers'
    ]);

    const aquifers = card('Aquifers');

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

  it('shows what the judge saved before, and how many entries they have scored', async () => {
    const { root, card, component } = await open();

    expect(root.querySelector('.progress')?.textContent).toBe('1 of 2 scored');
    expect(component.formFor(judgePage().competitions[0].submissions[1]).getRawValue()).toEqual({
      'c-1': '10',
      'c-2': '5',
      comment: 'Good.'
    });
    expect(card('Rivers').querySelector('.saved')?.textContent).toContain('Scored 15 of 30 points');
  });

  it('saves the scores as numbers with the comment, and counts the entry as scored', async () => {
    const { root, card, save, judging, component } = await open();

    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '18', 'c-2': '7', comment: 'Clear.' });
    await save('Aquifers');

    expect(judging.assess).toHaveBeenCalledWith('a-link', 's-1', { scores: { 'c-1': 18, 'c-2': 7 }, comment: 'Clear.' });
    expect(card('Aquifers').querySelector('.saved')?.textContent).toContain('Saved, 25 of 30 points');
    expect(root.querySelector('.progress')?.textContent).toBe('2 of 2 scored');
  });

  it('refuses a score above the criterion’s points before sending anything', async () => {
    const { card, save, judging, component } = await open();

    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '21', 'c-2': '7' });
    await save('Aquifers');

    expect(judging.assess).not.toHaveBeenCalled();
    expect(card('Aquifers').querySelector('[role="alert"]')?.textContent).toContain(
      'Clarity is scored as a whole number from 0 to 20.'
    );
  });

  it("shows the API's reason when it refuses the scores", async () => {
    const refused = jest.fn(() =>
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: JUDGING_CLOSED_MESSAGE } }))
    );
    const { card, save, component } = await open({ assess: refused });

    component.formFor(judgePage().competitions[0].submissions[0]).patchValue({ 'c-1': '1', 'c-2': '1' });
    await save('Aquifers');

    expect(card('Aquifers').querySelector('[role="alert"]')?.textContent).toContain(JUDGING_CLOSED_MESSAGE);
  });

  it('is read-only once judging is closed, and says so', async () => {
    const { root, card } = await open({ page: judgePage(true) });

    expect(root.textContent).toContain('Judging is closed for this competition');
    expect(card('Rivers').querySelector('input[type="submit"]')).toBeNull();
    expect(
      Array.from(card('Rivers').querySelectorAll<HTMLInputElement>('input[type="number"]')).every((i) => i.disabled)
    ).toBe(true);
  });

  it('says when the link does not work, or there is none', async () => {
    expect((await open({ page: 'invalid' })).root.textContent).toContain('This link has expired or is not valid');

    TestBed.resetTestingModule();

    const none = await open({ token: null });

    expect(none.root.textContent).toContain('This page opens from the link in your judging email.');
    expect(none.judging.forLink).not.toHaveBeenCalled();
  });
});
