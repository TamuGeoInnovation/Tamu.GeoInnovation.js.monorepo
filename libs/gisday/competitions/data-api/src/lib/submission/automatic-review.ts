import { isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';

import { ICompetitionSeasonFormQuestion, ReviewLimits } from '../entities/all.entities';
import { hasName, isOwnRepeat, usableLocation } from '../leaderboard/leaderboard.service';

/**
 * Who reviewed a submission the app reviewed as it was saved (#2164), in place of a person's account id.
 * A person's decision replaces it.
 */
export const AUTOMATIC_REVIEWER = 'automatic';

/**
 * The reason given when the review itself failed, so the submission is saved unverified for a person
 * (#2428 review).
 */
export const COULD_NOT_REVIEW = 'Could not review automatically';

/**
 * Where Texas A&M property in Brazos County lies, roughly: the Main and West campuses with Easterwood
 * Airport, and the RELLIS campus. Rectangles, so they take in some neighbouring land; the check is there
 * to catch a location nowhere near campus, and failing it only asks a person to look.
 */
export const TEXAS_AM_BRAZOS_COUNTY_AREAS: Array<{ name: string; corners: Array<LatLon> }> = [
  {
    name: 'Main and West campuses',
    corners: [
      { latitude: 30.585, longitude: -96.38 },
      { latitude: 30.632, longitude: -96.38 },
      { latitude: 30.632, longitude: -96.32 },
      { latitude: 30.585, longitude: -96.32 }
    ]
  },
  {
    name: 'RELLIS campus',
    corners: [
      { latitude: 30.625, longitude: -96.5 },
      { latitude: 30.665, longitude: -96.5 },
      { latitude: 30.665, longitude: -96.455 },
      { latitude: 30.625, longitude: -96.455 }
    ]
  }
];

/**
 * The review's limits where a season's form sets none (#2430): 2026's.
 *
 * - Accuracy 15 m: scoring tells plaques apart within 10 m, so a rougher fix cannot be trusted to place one.
 * - 10 submissions in 120 s from one participant is faster than anyone walking between memorials and photographing them.
 * - Texas A&M property in Brazos County.
 */
export const DEFAULT_REVIEW_LIMITS: ReviewLimits = {
  maxAccuracyMetres: 15,
  paceSubmissions: 10,
  paceSeconds: 120,
  areas: TEXAS_AM_BRAZOS_COUNTY_AREAS
};

/**
 * What the automatic review reads from a submission. Decimals may arrive as text from the database.
 */
export interface ReviewedSubmission {
  created: Date;
  value: Record<string, unknown>;
  location: { latitude: number | string; longitude: number | string; accuracy?: number | string };
  /** How many photographs it has. */
  photos: number;
  /** Discarded by a person; it no longer counts against the participant. */
  discarded?: boolean;
}

/**
 * Why a submission needs a person to look at it, or nothing when the app can verify it (#2164):
 *
 * - it has a photo;
 * - it has a name, when its type has a name question (`nameAttribute`), counted as `hasName` counts it;
 * - its location is in one of the review's areas;
 * - the phone gave the location's accuracy, within the review's `maxAccuracyMetres`;
 * - the participant has not already submitted this type nearby, by the scoring's own rule (`isOwnRepeat`);
 * - the participant has made fewer than `paceSubmissions` in `paceSeconds`, this one included.
 *
 * The limits are the type's own `review` settings in the season's form, each falling back to `DEFAULT_REVIEW_LIMITS`
 * (#2430).
 *
 * `earlier` is the same participant's submissions in the season made before this one.
 */
export function automaticReviewReasons(
  submission: ReviewedSubmission,
  earlier: Array<ReviewedSubmission>,
  form: Array<Partial<ICompetitionSeasonFormQuestion>>
): Array<string> {
  const reasons: Array<string> = [];
  const typeQuestion = form?.find((q) => q.isDiscriminator === true);
  // The form is stored as the Designer wrote it, so its type question may lack an attribute.
  const typeAttribute = typeQuestion?.attribute;
  const type = typeAttribute ? submission.value?.[typeAttribute] : undefined;
  // The name question of this submission's own type, so a form that names only some types does not flag
  // the others (#2428 review).
  const settings = typeQuestion?.options?.find((option) => option.value === type);
  const nameAttribute = settings?.nameAttribute;
  const limits: ReviewLimits = { ...DEFAULT_REVIEW_LIMITS, ...settings?.review };
  const location = usableLocation(submission.location as never);
  const counted = earlier.filter((other) => !other.discarded);

  if (!(submission.photos > 0)) {
    reasons.push('No photo');
  }

  if (nameAttribute && !hasName(submission.value?.[nameAttribute])) {
    reasons.push('No name');
  }

  if (!location) {
    reasons.push('No location');
  } else {
    if (!limits.areas.some((area) => isWithinPolygon(location, area.corners))) {
      reasons.push(
        limits.areas === TEXAS_AM_BRAZOS_COUNTY_AREAS
          ? 'Not on Texas A&M property in Brazos County'
          : `Not in the season's area: ${limits.areas.map((area) => area.name).join(', ')}`
      );
    }

    const accuracy = Number(submission.location.accuracy);

    if (!(accuracy > 0)) {
      reasons.push('Location accuracy not recorded');
    } else if (accuracy > limits.maxAccuracyMetres) {
      reasons.push(`Location accurate only to ${Math.round(accuracy)} m`);
    }

    const repeat = counted.some((other) => {
      const otherLocation = usableLocation(other.location as never);
      const otherType = typeAttribute ? other.value?.[typeAttribute] : undefined;

      return otherLocation && otherType === type && isOwnRepeat({ location: otherLocation }, { location }, settings);
    });

    if (repeat) {
      reasons.push('Already submitted by this participant');
    }
  }

  const windowStart = submission.created.getTime() - limits.paceSeconds * 1000;
  const recent = counted.filter((other) => other.created.getTime() > windowStart).length + 1;

  if (recent >= limits.paceSubmissions) {
    const minutes = limits.paceSeconds / 60;

    reasons.push(`${recent} submissions in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  return reasons;
}
