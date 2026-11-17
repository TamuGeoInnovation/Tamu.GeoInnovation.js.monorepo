/**
 * The rubrics competition judges score against (#3183): one per season for each judged competition type, posters and
 * research presentations, shared by graduate and undergraduate. Each is a list of criteria, each worth some points and
 * describing four levels of work. An admin edits them on the Rubrics page; a season without one starts from the standard
 * rubric below, the competition organizer's (16 November 2026).
 *
 * One set of rules, read by the API, which enforces them, and by the site, which shows them.
 */

/** The competition types a rubric is for, as `Submission.submissionType` names them. */
export const RUBRIC_COMPETITION_TYPES = Object.freeze(['poster', 'presentation'] as const);

export type RubricCompetitionType = (typeof RUBRIC_COMPETITION_TYPES)[number];

/** Whether a value is a competition type a rubric can be for. */
export function isRubricCompetitionType(value: unknown): value is RubricCompetitionType {
  return RUBRIC_COMPETITION_TYPES.includes(value as RubricCompetitionType);
}

/** One level of a criterion: its name and what work at that level looks like. */
export interface RubricLevel {
  label: string;
  description: string;
}

/** One criterion of a rubric: what is judged, the most it can score, and its levels, best first. */
export interface RubricCriterionValue {
  /** Kept when the rubric is saved, so a judge's scores stay with their criterion; none for a new criterion. */
  guid?: string;
  name: string;
  maxPoints: number;
  levels: Array<RubricLevel>;
}

/** A rubric as the admin page edits it and the API takes it. */
export interface RubricValue {
  competitionType: RubricCompetitionType | string;
  name: string;
  description: string | null;
  criteria: Array<RubricCriterionValue>;
}

/** The four levels the standard rubrics describe, best first. */
export const RUBRIC_LEVEL_LABELS = Object.freeze([
  'Excellent (A)',
  'Proficient (B)',
  'Developing (C)',
  'Needs Improvement (D/F)'
] as const);

/** The longest a rubric's text may be. */
export const RUBRIC_LIMITS = Object.freeze({
  name: 255,
  description: 4000,
  criteria: 30,
  levels: 10,
  levelLabel: 100,
  levelDescription: 2000,
  maxPoints: 1000
});

/** A criterion from its name, points and the four levels' descriptions, in the standard levels' order. */
function criterion(name: string, maxPoints: number, descriptions: [string, string, string, string]): RubricCriterionValue {
  return {
    name,
    maxPoints,
    levels: RUBRIC_LEVEL_LABELS.map((label, i) => ({ label, description: descriptions[i] }))
  };
}

/**
 * The standard rubrics (#3183), from the competition organizer's PDFs of 16 November 2026: each 100 points over seven
 * criteria. A season without a rubric for a competition starts from one of these on the admin page.
 */
export const DEFAULT_RUBRICS: Readonly<Record<RubricCompetitionType, RubricValue>> = Object.freeze({
  presentation: {
    competitionType: 'presentation',
    name: 'Geography Research Presentation Rubric',
    description:
      'Students will research a geographic topic (e.g., environmental issue, regional development, urbanization, migration, cultural landscape, etc.) and present their findings in a clear, analytical, and visually engaging presentation.',
    criteria: [
      criterion('Geographic Understanding & Content Accuracy', 20, [
        'Demonstrates a deep understanding of geographic concepts; all information is accurate and relevant; integrates spatial thinking and geographic terminology effectively.',
        'Shows solid understanding; minor factual errors; uses geographic terms appropriately.',
        'Basic understanding; some inaccuracies or vague references to geographic concepts.',
        'Limited or inaccurate understanding; major factual errors; lacks geographic focus.'
      ]),
      criterion('Data Interpretation & Analysis', 20, [
        'Insightful analysis of data, maps, and graphs; clearly connects data to geographic patterns and processes.',
        'Good interpretation; connections mostly clear; some analysis could be deeper.',
        'Descriptive rather than analytical; limited connection between data and conclusions.',
        'Little or no data analysis; lacks interpretation of geographic evidence.'
      ]),
      criterion('Research & Sources', 15, [
        'Uses multiple credible, current academic and geographic sources (e.g., journals, GIS data, official reports); cites correctly in APA/MLA format.',
        'Adequate variety of sources; mostly credible and recent; minor citation errors.',
        'Limited or mixed-quality sources; incomplete or inconsistent citation.',
        'Minimal or poor-quality sources; missing or incorrect citations.'
      ]),
      criterion('Visuals & Geographic Representation', 15, [
        'Maps, charts, and visuals are high-quality, relevant, and clearly labeled; effectively enhance understanding.',
        'Visuals are clear and relevant; some labels or design could be improved.',
        'Visuals are basic, partially relevant, or not clearly explained.',
        'Missing, unclear, or unrelated visuals.'
      ]),
      criterion('Organization & Structure', 10, [
        'Clear, logical flow; strong introduction and conclusion; effective transitions; presentation stays on topic.',
        'Mostly well-organized; minor issues with flow or focus.',
        'Some structure; transitions uneven; may wander from topic.',
        'Disorganized or confusing; lacks clear structure.'
      ]),
      criterion('Delivery & Engagement', 10, [
        'Presenter speaks clearly and confidently; maintains audience engagement; strong pacing and visuals integration.',
        'Mostly clear and confident; minor issues with pacing or engagement.',
        'Somewhat unclear or rushed; limited audience connection.',
        'Unclear, monotone, or disorganized delivery; little engagement.'
      ]),
      criterion('Critical Thinking & Geographic Insight', 10, [
        'Demonstrates strong analytical insight into geographic processes, patterns, and implications; connects local and global scales.',
        'Shows good insight and some spatial reasoning; some connections could be stronger.',
        'Limited insight; mainly descriptive; lacks depth in geographic reasoning.',
        'No evident critical thinking or spatial analysis.'
      ])
    ]
  },
  poster: {
    competitionType: 'poster',
    name: 'Geography Poster Presentation Rubric',
    description:
      'Students will design a geography poster that visually and analytically presents a geographic topic (e.g., climate change, urbanization, population distribution, migration, land use, environmental management, etc.). The poster should demonstrate geographic understanding, strong visual organization, and the effective use of maps, charts, and spatial data.',
    criteria: [
      criterion('Geographic Understanding & Accuracy', 20, [
        'Deep understanding of geographic concepts; information is accurate and relevant; demonstrates strong use of spatial thinking and terminology.',
        'Solid understanding; minor factual errors; good use of geographic terms.',
        'Basic understanding; some inaccuracies or vague geographic references.',
        'Limited or inaccurate understanding; lacks geographic focus or contains major errors.'
      ]),
      criterion('Spatial Data & Visual Representation', 20, [
        'Maps, graphs, and spatial visuals are high-quality, clearly labeled, accurate, and enhance understanding.',
        'Visuals are relevant and mostly clear; minor design or labeling issues.',
        'Visuals are basic or partially unclear; limited connection to geographic content.',
        'Missing, unclear, or unrelated visuals or maps.'
      ]),
      criterion('Research & Data Quality', 15, [
        'Uses multiple credible, current academic and geographic sources (e.g., journals, GIS data, reports); all sources cited correctly.',
        'Adequate sources; mostly credible and recent; minor citation issues.',
        'Limited or mixed-quality sources; incomplete or inconsistent citation.',
        'Few or poor-quality sources; missing or incorrect citations.'
      ]),
      criterion('Poster Organization & Design', 15, [
        'Layout is clear, logical, and visually engaging; information flows smoothly; balanced text and visuals; easy to read from a distance.',
        'Mostly well-organized; minor spacing or design inconsistencies.',
        'Somewhat cluttered or text-heavy; organization could be improved.',
        'Disorganized, hard to follow, or visually confusing layout.'
      ]),
      criterion('Clarity & Conciseness of Text', 10, [
        'Text is clear, concise, and well-edited; effectively summarizes key geographic findings.',
        'Text mostly clear and concise; minor grammar or clarity issues.',
        'Some vague or overly wordy sections; needs editing for clarity.',
        'Text unclear or too dense; numerous language or grammar issues.'
      ]),
      criterion('Creativity & Visual Impact', 10, [
        'Poster is visually striking and creative while maintaining academic tone; strong use of color, design, and layout principles.',
        'Good visual appeal; design supports content but could be more polished.',
        'Some creativity; design somewhat plain or inconsistent.',
        'Little or no visual creativity; design detracts from message.'
      ]),
      criterion('Interpretation & Geographic Insight', 10, [
        'Demonstrates deep analysis of patterns, processes, and spatial relationships; connects local and global scales.',
        'Good interpretation and spatial reasoning; connections mostly clear.',
        'Limited analysis; more descriptive than analytical.',
        'No evident interpretation or geographic reasoning.'
      ])
    ]
  }
});

/** The most a rubric's criteria add up to. */
export function rubricTotal(rubric: { criteria?: ReadonlyArray<{ maxPoints: number }> | null }): number {
  return (rubric.criteria ?? []).reduce((sum, c) => sum + (Number(c.maxPoints) || 0), 0);
}

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

/**
 * Why a rubric may not be saved, or null when it may: a competition type a rubric is for, a name, a description of a
 * sensible size if any, and at least one criterion, each with a name, a whole number of points above zero, and levels
 * that each have a label and a description.
 */
export function rubricProblem(rubric: unknown): string | null {
  const r = (rubric ?? {}) as Partial<Record<keyof RubricValue, unknown>>;

  if (!isRubricCompetitionType(r.competitionType)) {
    return `A rubric is for one of: ${RUBRIC_COMPETITION_TYPES.join(', ')}.`;
  }

  if (!isText(r.name, RUBRIC_LIMITS.name)) {
    return `The rubric needs a name, up to ${RUBRIC_LIMITS.name} characters.`;
  }

  if (r.description !== undefined && r.description !== null) {
    if (typeof r.description !== 'string' || r.description.length > RUBRIC_LIMITS.description) {
      return `The description must be text, up to ${RUBRIC_LIMITS.description} characters.`;
    }
  }

  if (!Array.isArray(r.criteria) || r.criteria.length === 0) {
    return 'A rubric needs at least one criterion.';
  }

  if (r.criteria.length > RUBRIC_LIMITS.criteria) {
    return `A rubric can have up to ${RUBRIC_LIMITS.criteria} criteria.`;
  }

  for (const [i, value] of r.criteria.entries()) {
    const c = (value ?? {}) as Partial<Record<keyof RubricCriterionValue, unknown>>;
    const which = `Criterion ${i + 1}`;

    if (!isText(c.name, RUBRIC_LIMITS.name)) {
      return `${which} needs a name, up to ${RUBRIC_LIMITS.name} characters.`;
    }

    if (!Number.isInteger(c.maxPoints) || (c.maxPoints as number) < 1 || (c.maxPoints as number) > RUBRIC_LIMITS.maxPoints) {
      return `${which}'s points must be a whole number from 1 to ${RUBRIC_LIMITS.maxPoints}.`;
    }

    if (c.guid !== undefined && c.guid !== null && typeof c.guid !== 'string') {
      return `${which}'s id must be text.`;
    }

    if (!Array.isArray(c.levels) || c.levels.length > RUBRIC_LIMITS.levels) {
      return `${which}'s levels must be a list of up to ${RUBRIC_LIMITS.levels}.`;
    }

    for (const level of c.levels) {
      const l = (level ?? {}) as Partial<Record<keyof RubricLevel, unknown>>;

      if (!isText(l.label, RUBRIC_LIMITS.levelLabel)) {
        return `Each of ${which.toLowerCase()}'s levels needs a name, up to ${RUBRIC_LIMITS.levelLabel} characters.`;
      }

      if (typeof l.description !== 'string' || l.description.length > RUBRIC_LIMITS.levelDescription) {
        return `Each of ${which.toLowerCase()}'s levels needs a description, up to ${RUBRIC_LIMITS.levelDescription} characters.`;
      }
    }
  }

  return null;
}
