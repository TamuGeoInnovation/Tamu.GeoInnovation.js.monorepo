import { DEFAULT_RUBRICS, RUBRIC_COMPETITION_TYPES, RUBRIC_LEVEL_LABELS, rubricProblem, rubricTotal } from '../index';

/** #3183: the rubrics judges score against, and the standard ones a season starts from. */
describe('The judging rubrics (#3183)', () => {
  describe('the standard rubrics, from the competition organizer', () => {
    it('has one for posters and one for research presentations', () => {
      expect(Object.keys(DEFAULT_RUBRICS).sort()).toEqual([...RUBRIC_COMPETITION_TYPES].sort());
      expect(DEFAULT_RUBRICS.presentation.name).toBe('Geography Research Presentation Rubric');
      expect(DEFAULT_RUBRICS.poster.name).toBe('Geography Poster Presentation Rubric');
    });

    it.each(RUBRIC_COMPETITION_TYPES)('the %s rubric is 100 points over seven criteria', (type) => {
      const rubric = DEFAULT_RUBRICS[type];

      expect(rubric.competitionType).toBe(type);
      expect(rubric.criteria).toHaveLength(7);
      expect(rubricTotal(rubric)).toBe(100);
      expect(rubric.criteria.map((c) => c.maxPoints)).toEqual([20, 20, 15, 15, 10, 10, 10]);
    });

    it.each(RUBRIC_COMPETITION_TYPES)('every criterion of the %s rubric describes the four levels, best first', (type) => {
      for (const criterion of DEFAULT_RUBRICS[type].criteria) {
        expect(criterion.levels.map((l) => l.label)).toEqual([...RUBRIC_LEVEL_LABELS]);
        criterion.levels.forEach((level) => expect(level.description.length).toBeGreaterThan(20));
      }
    });

    it("keeps the organizer's names and words", () => {
      expect(DEFAULT_RUBRICS.presentation.criteria.map((c) => c.name)).toEqual([
        'Geographic Understanding & Content Accuracy',
        'Data Interpretation & Analysis',
        'Research & Sources',
        'Visuals & Geographic Representation',
        'Organization & Structure',
        'Delivery & Engagement',
        'Critical Thinking & Geographic Insight'
      ]);
      expect(DEFAULT_RUBRICS.poster.criteria.map((c) => c.name)).toEqual([
        'Geographic Understanding & Accuracy',
        'Spatial Data & Visual Representation',
        'Research & Data Quality',
        'Poster Organization & Design',
        'Clarity & Conciseness of Text',
        'Creativity & Visual Impact',
        'Interpretation & Geographic Insight'
      ]);
      expect(DEFAULT_RUBRICS.poster.criteria[5].levels[3].description).toBe(
        'Little or no visual creativity; design detracts from message.'
      );
      expect(DEFAULT_RUBRICS.presentation.description).toMatch(/^Students will research a geographic topic/);
    });

    it('can be saved as they are', () => {
      RUBRIC_COMPETITION_TYPES.forEach((type) => expect(rubricProblem(DEFAULT_RUBRICS[type])).toBeNull());
    });
  });

  describe('what may be saved', () => {
    const valid = () => ({
      competitionType: 'poster',
      name: 'A made-up rubric',
      description: null,
      criteria: [{ name: 'Clarity', maxPoints: 10, levels: [{ label: 'Good', description: 'Clear.' }] }]
    });

    it('a rubric with a type, a name and a criterion', () => {
      expect(rubricProblem(valid())).toBeNull();
    });

    it('not one for a competition no rubric is for', () => {
      expect(rubricProblem({ ...valid(), competitionType: 'paper' })).toMatch(/poster, presentation/);
    });

    it('not one without a name', () => {
      expect(rubricProblem({ ...valid(), name: '  ' })).toMatch(/needs a name/);
    });

    it('not one without criteria', () => {
      expect(rubricProblem({ ...valid(), criteria: [] })).toBe('A rubric needs at least one criterion.');
    });

    it('not a criterion without a name', () => {
      expect(rubricProblem({ ...valid(), criteria: [{ ...valid().criteria[0], name: '' }] })).toMatch(
        /Criterion 1 needs a name/
      );
    });

    it.each([0, -5, 2.5, '10', null])('not a criterion worth %s points', (maxPoints) => {
      expect(rubricProblem({ ...valid(), criteria: [{ ...valid().criteria[0], maxPoints }] })).toMatch(
        /whole number from 1/
      );
    });

    it('not a level without a name', () => {
      expect(
        rubricProblem({ ...valid(), criteria: [{ ...valid().criteria[0], levels: [{ label: '', description: 'x' }] }] })
      ).toMatch(/levels needs a name/);
    });
  });
});
