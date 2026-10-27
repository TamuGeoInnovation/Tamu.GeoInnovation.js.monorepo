import { isWithinPolygon, LatLon } from '@tamu-gisc/common/utils/geometry';

import { ICompetitionSeasonFormQuestion } from '../entities/all.entities';
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
 * The worst location accuracy, in metres, the app accepts without a person looking. Scoring tells
 * plaques apart within 10 m, so a rougher fix cannot be trusted to place one.
 */
export const REVIEW_MAX_ACCURACY_METRES = 15;

/**
 * More submissions than this many, from one participant within `REVIEW_PACE_SECONDS`, is faster than
 * anyone walking between memorials and photographing them.
 */
export const REVIEW_PACE_SUBMISSIONS = 10;
export const REVIEW_PACE_SECONDS = 120;

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
 * - its location is on Texas A&M property in Brazos County;
 * - the phone gave the location's accuracy, within `REVIEW_MAX_ACCURACY_METRES`;
 * - the participant has not already submitted this type nearby, by the scoring's own rule (`isOwnRepeat`);
 * - the participant has made fewer than `REVIEW_PACE_SUBMISSIONS` in `REVIEW_PACE_SECONDS`, this one
 *   included.
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
  const type = typeQuestion ? submission.value?.[typeQuestion.attribute] : undefined;
  // The name question of this submission's own type, so a form that names only some types does not flag
  // the others (#2428 review).
  const settings = typeQuestion?.options?.find((option) => option.value === type);
  const nameAttribute = settings?.nameAttribute;
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
    if (!TEXAS_AM_BRAZOS_COUNTY_AREAS.some((area) => isWithinPolygon(location, area.corners))) {
      reasons.push('Not on Texas A&M property in Brazos County');
    }

    const accuracy = Number(submission.location.accuracy);

    if (!(accuracy > 0)) {
      reasons.push('Location accuracy not recorded');
    } else if (accuracy > REVIEW_MAX_ACCURACY_METRES) {
      reasons.push(`Location accurate only to ${Math.round(accuracy)} m`);
    }

    const repeat = counted.some((other) => {
      const otherLocation = usableLocation(other.location as never);
      const otherType = typeQuestion ? other.value?.[typeQuestion.attribute] : undefined;

      return otherLocation && otherType === type && isOwnRepeat({ location: otherLocation }, { location }, settings);
    });

    if (repeat) {
      reasons.push('Already submitted by this participant');
    }
  }

  const windowStart = submission.created.getTime() - REVIEW_PACE_SECONDS * 1000;
  const recent = counted.filter((other) => other.created.getTime() > windowStart).length + 1;

  if (recent >= REVIEW_PACE_SUBMISSIONS) {
    reasons.push(`${recent} submissions in ${REVIEW_PACE_SECONDS / 60} minutes`);
  }

  return reasons;
}
