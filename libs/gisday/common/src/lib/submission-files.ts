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
}

/**
 * Why a file may not be attached, in words for the student, or null when it may. `alreadyAttached` is how many files the
 * submission holds before this one.
 */
export function submissionFileProblem(fileName: string, bytes: number, alreadyAttached: number): string | null {
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
    return `A submission can have up to ${SUBMISSION_FILE_RULES.maxFiles} files. Remove one before adding another.`;
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
