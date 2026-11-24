import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { JudgingService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { DEFAULT_RUBRICS, RubricDto } from '@tamu-gisc/gisday/common';

import { RubricsComponent, rubricForm, rubricValue } from './rubrics.component';

/** A saved poster rubric of two criteria, made up. */
const poster = (): RubricDto => ({
  guid: 'r-1',
  competitionType: 'poster',
  name: 'A poster rubric',
  description: 'Made-up words.',
  criteria: [
    {
      guid: 'c-1',
      position: 0,
      name: 'Clarity',
      maxPoints: 20,
      levels: [{ label: 'Excellent (A)', description: 'Clear.' }]
    },
    { guid: 'c-2', position: 1, name: 'Design', maxPoints: 10, levels: [] }
  ]
});

/** #3183: the admins' Rubrics page, one rubric per competition type for the season, edited in place. */
describe('RubricsComponent (#3183)', () => {
  async function open(rubrics: Array<RubricDto>) {
    const judging = {
      rubrics: jest.fn(() => of(JSON.parse(JSON.stringify(rubrics)))),
      createRubric: jest.fn(() => of({})),
      updateRubric: jest.fn((_guid: string, value: object) => of({ ...poster(), ...value }))
    };

    TestBed.configureTestingModule({
      imports: [RubricsComponent],
      providers: [
        // The season is picked from the address (#3329).
        provideRouter([]),
        { provide: JudgingService, useValue: judging },
        {
          provide: SeasonService,
          useValue: {
            activeSeason$: of({ guid: 'season-2026', year: 2026 }),
            seasons$: of([{ guid: 'season-2026', year: 2026 }])
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(RubricsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const click = async (label: string, within: ParentNode = root) => {
      Array.from(within.querySelectorAll<HTMLInputElement>('input[type="button"], input[type="submit"]'))
        .find((b) => b.value === label)
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { fixture, root, judging, click, component: fixture.componentInstance };
  }

  it("reads the active season's rubrics", async () => {
    const { judging } = await open([]);

    expect(judging.rubrics).toHaveBeenCalledWith('season-2026');
  });

  it('offers to start each rubric the season lacks from the standard one, and sends it', async () => {
    const { root, judging, click } = await open([poster()]);

    expect(root.textContent).toContain('This season has no research presentation rubric yet.');

    await click('Start from the standard rubric');

    expect(judging.createRubric).toHaveBeenCalledWith('season-2026', DEFAULT_RUBRICS.presentation);
    expect(judging.rubrics).toHaveBeenCalledTimes(2);
  });

  it('shows a saved rubric to edit, with its total, and saves its criteria with their ids and points as numbers', async () => {
    const { root, judging, click, component } = await open([poster()]);
    const panel = component.panels()[0];

    expect(root.querySelector('.total')?.textContent).toBe('Total: 30 points');

    panel.form.controls.criteria.at(1).controls.maxPoints.setValue('15');
    await click('Save rubric');

    expect(judging.updateRubric).toHaveBeenCalledWith('r-1', {
      name: 'A poster rubric',
      description: 'Made-up words.',
      criteria: [
        { guid: 'c-1', name: 'Clarity', maxPoints: 20, levels: [{ label: 'Excellent (A)', description: 'Clear.' }] },
        { guid: 'c-2', name: 'Design', maxPoints: 15, levels: [] }
      ]
    });
    expect(root.textContent).toContain('Saved.');
  });

  it('adds a criterion with the standard levels to describe, and removes one', async () => {
    const { component } = await open([poster()]);
    const form = component.panels()[0].form;

    component.addCriterion(form);
    component.removeCriterion(form, 0);

    const value = rubricValue(form);

    expect(value.criteria.map((c) => c.guid)).toEqual(['c-2', undefined]);
    expect(value.criteria[1].levels.map((l) => l.label)).toEqual([
      'Excellent (A)',
      'Proficient (B)',
      'Developing (C)',
      'Needs Improvement (D/F)'
    ]);
  });

  it('refuses a rubric it cannot save, saying why, and sends nothing', async () => {
    const { root, judging, click, component } = await open([poster()]);

    component.panels()[0].form.controls.criteria.at(0).controls.maxPoints.setValue('0');
    await click('Save rubric');

    expect(judging.updateRubric).not.toHaveBeenCalled();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain("Criterion 1's points must be a whole number");
  });

  it('turns a saved rubric into a form and back unchanged', () => {
    const saved = poster();

    expect(rubricValue(rubricForm(saved))).toEqual({
      name: saved.name,
      description: saved.description,
      criteria: saved.criteria.map((c) => ({ guid: c.guid, name: c.name, maxPoints: c.maxPoints, levels: c.levels }))
    });
  });
});
