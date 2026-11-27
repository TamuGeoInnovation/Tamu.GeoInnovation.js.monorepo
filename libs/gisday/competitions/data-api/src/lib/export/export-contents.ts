import { Repository } from 'typeorm';
import { toCsv } from '@tamu-gisc/common/utils/ui';

import { CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

/**
 * What a VGI export holds (#650, #545): `submissions.csv`, a row per submission, and each submission's photos under
 * `medias/<submission>/images/`, the layout #650's queued export wrote. The zip streamed from the request (#545) is the
 * only export now: the queued one went with `bull` (#3788).
 */

/** A photo's file extension, from its type. */
export function mimeToExtension(mimeType?: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff'
  };

  return (mimeType && map[mimeType.toLowerCase()]) || '.bin';
}

/** A competition season's submissions, oldest first, with their locations and statuses but not their photos' bytes. */
export function exportedSubmissions(
  repo: Repository<CompetitionSubmission>,
  competitionSeasonGuid: string
): Promise<Array<CompetitionSubmission>> {
  return repo.find({
    where: { season: { guid: competitionSeasonGuid } },
    relations: { location: true, validationStatus: true, blobs: true },
    select: {
      blobs: { guid: true, mimeType: true, fieldName: true, sha256: true }
    },
    order: { created: 'ASC' }
  });
}

/** A submission's photos, with their bytes. */
export function exportedMedia(repo: Repository<SubmissionMedia>, submissionGuid: string): Promise<Array<SubmissionMedia>> {
  return repo.find({ where: { submission: { guid: submissionGuid } } });
}

/** Where a photo goes in the export. */
export function mediaPath(submissionGuid: string, media: Pick<SubmissionMedia, 'guid' | 'mimeType'>): string {
  return `medias/${submissionGuid}/images/${media.guid}${mimeToExtension(media.mimeType)}`;
}

/**
 * A submission's row in `submissions.csv`: who, when, where, its status, its photos, then each of its answers. Its
 * photo count is of those it has, as the queued export counted them, even when one could not be written.
 */
export function exportRow(
  submission: CompetitionSubmission,
  imagePaths: Array<string>,
  imageCount = imagePaths.length
): Record<string, unknown> {
  let formValues: object;

  try {
    formValues = typeof submission.value === 'string' ? JSON.parse(submission.value) : submission.value || {};
  } catch {
    formValues = {};
  }

  return {
    submission_guid: submission.guid,
    user_guid: submission.userGuid,
    created: submission.created.toISOString(),
    latitude: submission.location?.latitude,
    longitude: submission.location?.longitude,
    accuracy: submission.location?.accuracy,
    altitude: submission.location?.altitude,
    validation_status: submission.validationStatus?.status || 'unverified',
    image_count: imageCount,
    image_paths: imagePaths.join(';'),
    ...formValues
  };
}

/**
 * `submissions.csv`, from the rows, through the shared `toCsv`, which escapes formulas (#3332). The header is the first
 * row's keys, as papaparse's own header was.
 */
export function exportCsv(rows: Array<Record<string, unknown>>): string {
  return toCsv(Object.keys(rows[0] ?? {}), rows);
}
