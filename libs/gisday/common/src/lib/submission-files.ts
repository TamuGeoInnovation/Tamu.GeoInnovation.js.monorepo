/**
 * The files a student may attach to their poster or presentation submission (#2933): the slides or the poster itself,
 * so the organisers have them before the day. One set of rules, read by the API, which enforces them, and by the site,
 * which says them and stops a file that breaks them before it is sent.
 *
 * PowerPoint and PDF, up to 100 MB each, three per submission: a deck, a PDF copy and a poster. The upload volume was
 * grown to 20 GiB for them on 14 November 2026; three full-size files for every submission is about 60 submissions.
 */
export const SUBMISSION_FILE_RULES = Object.freeze({
  maxBytes: 100 * 1024 * 1024,
  maxFiles: 3,
  extensions: Object.freeze(['.pdf', '.ppt', '.pptx']),
  /** The extensions as a file input's `accept`. */
  accept: '.pdf,.ppt,.pptx'
});

/**
 * One file attached to a submission, as the API lists it. `name` is the file's name as the student uploaded it, which a
 * download keeps; the file on disk has a name of its own.
 */
export interface SubmissionFileDto {
  guid: string;
  name: string;
  /** Bytes, or null when the file is listed but missing from disk. */
  size: number | null;
  uploaded: string | Date;
  /**
   * Who uploaded it, where a list holds several people's files: the speaker's name on a session's slides, for the admins
   * (#3093). Left out of a submission's files, which are one student's.
   */
  uploadedBy?: string;
}

/** Why a speaker may not add a fourth file to a session (#3093): each speaker uploads their own, up to three. */
export const SESSION_FILES_LIMIT = `You can upload up to ${SUBMISSION_FILE_RULES.maxFiles} files for each session.`;

/**
 * What a speaker may upload for a session, in words, as the Ask for slides email says it (#3113): made from the rule the
 * upload is checked against, so the email cannot promise what the upload refuses.
 */
export const SESSION_FILES_RULE = `PowerPoint or PDF files (${SUBMISSION_FILE_RULES.extensions.join(', ')}), up to ${megabytes(
  SUBMISSION_FILE_RULES.maxBytes
)} each. ${SESSION_FILES_LIMIT}`;

/**
 * A session a speaker presents, as their edit link lists it (#3093): when and where, and the slides that speaker has
 * uploaded for it. Each speaker of a session uploads their own, up to three files under a submission's rules, and sees
 * only their own.
 */
export interface SpeakerSessionDto {
  guid: string;
  name: string;
  /** The day, as an ISO date-time from the season day, or null when none is set. */
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  /** The building and room, or null. */
  place: string | null;
  /** The files this speaker uploaded, oldest first; none is []. */
  files: Array<SubmissionFileDto>;
  /** The session has no slides (#3147), so the speaker is not asked for any and cannot upload them. */
  noSlides: boolean;
}

/** Why a session with no slides (#3147) takes none, as the speaker's page and the API both say it. */
export const NO_SLIDES_FOR_SESSION = 'No slides are needed for this session.';

/** One file of a session's slides, as the admins' list of a season's sessions reads them (#3093). */
export interface SessionSlidesDto {
  /** The session's guid. */
  event: string;
  file: SubmissionFileDto;
}

/**
 * Why a file may not be attached, in words for the student, or null when it may. `alreadyAttached` is how many files the
 * submission holds before this one; `limit` says the limit to someone who has reached it, a submission's by default, or
 * `SESSION_FILES_LIMIT` for a speaker's slides.
 */
export function submissionFileProblem(
  fileName: string,
  bytes: number,
  alreadyAttached: number,
  limit = `A submission can have up to ${SUBMISSION_FILE_RULES.maxFiles} files.`
): string | null {
  const extension = extensionOf(fileName);

  if (!SUBMISSION_FILE_RULES.extensions.includes(extension)) {
    return `${fileName} is not a PowerPoint or PDF file. Only .pdf, .ppt and .pptx files can be attached.`;
  }

  if (bytes > SUBMISSION_FILE_RULES.maxBytes) {
    return `${fileName} is ${megabytes(bytes)}; files can be up to ${megabytes(SUBMISSION_FILE_RULES.maxBytes)}.`;
  }

  if (bytes === 0) {
    return `${fileName} is empty.`;
  }

  if (alreadyAttached >= SUBMISSION_FILE_RULES.maxFiles) {
    return `${limit} Remove one before adding another.`;
  }

  return null;
}

/** The file's extension in lower case, with its dot, or '' when it has none. */
export function extensionOf(fileName: string): string {
  const dot = (fileName ?? '').lastIndexOf('.');

  return dot > 0 ? fileName.slice(dot).toLowerCase() : '';
}

/** A size for people: "4.2 MB", "820 KB". */
export function megabytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  const mb = bytes / (1024 * 1024);

  return `${mb < 10 ? mb.toFixed(1).replace(/\.0$/, '') : Math.round(mb)} MB`;
}

/** A name safe for a zip's folder or file (#2933, #3174): no characters Windows refuses, one space between words, at most 80. */
export function zipSafe(text: string | null | undefined, fallback: string): string {
  const cleaned = (text ?? '')
    .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return cleaned || fallback;
}

/** What a session's slides are saved as when downloaded together (#3174): "Panel on floods - slides.zip". */
export function slidesZipName(sessionName: string | null | undefined): string {
  return `${zipSafe(sessionName, 'session')} - slides.zip`;
}
