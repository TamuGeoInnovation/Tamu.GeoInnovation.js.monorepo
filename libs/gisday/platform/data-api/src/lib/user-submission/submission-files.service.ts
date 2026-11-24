import { createReadStream } from 'fs';
import { mkdir, rename, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
  UnsupportedMediaTypeException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import JSZip from 'jszip';

import { OwnershipUser, isOwnerOrPermitted } from '@tamu-gisc/common/nest/auth';
import {
  SubmissionFileDto,
  closedAt,
  closedMessage,
  extensionOf,
  isDeadlineCompetition,
  submissionFileProblem,
  zipSafe
} from '@tamu-gisc/gisday/common';

import { Asset, Submission } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';

/** The asset `type` of a file attached to a submission. */
export const SUBMISSION_FILE_TYPE = 'submission-file';

/** Where uploads land while they arrive, inside APP_DATA so the move to their folder is a rename on one disk. */
export function uploadingDirectory(): string {
  return join(`${process.env.APP_DATA}`, '.uploading');
}

/**
 * The files students attach to their poster and presentation submissions (#2933), and the admins' downloads of them.
 *
 * A student may list, add and remove the files of their own submission. Anyone with `read:competitions` may list and
 * download every submission's files, singly or as one zip for a season; `update:competitions` may also add and remove.
 * The rules for what may be attached are `SUBMISSION_FILE_RULES`, shared with the site.
 */
@Injectable()
export class SubmissionFilesService {
  constructor(
    @InjectRepository(Submission) private readonly submissions: Repository<Submission>,
    @InjectRepository(Asset) private readonly assets: Repository<Asset>,
    private readonly assetsService: AssetsService
  ) {}

  public async list(submissionGuid: string, user: OwnershipUser): Promise<Array<SubmissionFileDto>> {
    const submission = await this.submissionFor(submissionGuid, user, 'read:competitions');

    return Promise.all((submission.files ?? []).sort(byUploaded).map((file) => fileDto(file)));
  }

  /**
   * Attaches an uploaded file, already written to disk by Multer, to the submission. The file is moved into the
   * submission's folder, or removed if it may not be attached.
   */
  public async add(submissionGuid: string, user: OwnershipUser, upload: Express.Multer.File): Promise<SubmissionFileDto> {
    try {
      if (!upload) {
        throw new BadRequestException('No file was sent.');
      }

      const submission = await this.submissionFor(submissionGuid, user, 'update:competitions');

      refuseIfFilesClosed(submission, user);

      const problem = submissionFileProblem(upload.originalname, upload.size, submission.files?.length ?? 0);

      if (problem) {
        throw new BadRequestException(problem);
      }

      const { guid, path } = await storeUpload(upload, `submissions/${submission.guid}`);
      const saved = await this.assets.save(
        this.assets.create({ guid, name: upload.originalname, path, type: SUBMISSION_FILE_TYPE, submission })
      );

      return fileDto(saved);
    } finally {
      await discardUpload(upload);
    }
  }

  public async remove(submissionGuid: string, fileGuid: string, user: OwnershipUser): Promise<void> {
    const submission = await this.submissionFor(submissionGuid, user, 'update:competitions');

    refuseIfFilesClosed(submission, user);

    const file = this.fileOf(submission, fileGuid);

    await this.assets.delete(file.guid);
    await this.assetsService.deleteAssetFiles([file]);
  }

  /** One file, under the name it was uploaded with. */
  public async download(submissionGuid: string, fileGuid: string, user: OwnershipUser): Promise<StreamableFile> {
    const submission = await this.submissionFor(submissionGuid, user, 'read:competitions');
    return fileDownload(this.fileOf(submission, fileGuid), 'SubmissionFilesService');
  }

  /**
   * One file, to be shown in the page rather than saved (#3090): an admin looking through a submission's files. Only
   * a PDF previews: a browser draws one itself, and none draws a PowerPoint, which stays a download until it can be
   * converted on the server. The route lets only those who may read the competitions in; a file is found only among
   * this submission's own.
   */
  public async preview(submissionGuid: string, fileGuid: string, user: OwnershipUser): Promise<StreamableFile> {
    const file = this.fileOf(await this.submissionFor(submissionGuid, user, 'read:competitions'), fileGuid);

    if (extensionOf(file.name) !== '.pdf') {
      throw new UnsupportedMediaTypeException(`${file.name} has no preview: download it instead.`);
    }

    return fileDownload(file, 'SubmissionFilesService', 'inline');
  }

  /**
   * Every file of a season's submissions as one zip, a folder per submission: its type, its title and the start of its
   * guid, so two submissions with one title stay apart. With `only`, just those submissions of the season: the rows the
   * admin ticked, or the ones the filters show (#3174). A guid that is not one of the season's is ignored.
   */
  public async zipForSeason(seasonGuid: string, user: OwnershipUser, only?: ReadonlyArray<string>): Promise<StreamableFile> {
    if (!isOwnerOrPermitted(user, '', 'read:competitions')) {
      throw new ForbiddenException();
    }

    const submissions = await this.submissions.find({
      where: { season: { guid: seasonGuid } },
      relations: { files: true, season: true }
    });
    const picked = only?.length ? submissions.filter((s) => only.includes(s.guid)) : submissions;
    const withFiles = picked.filter((s) => s.files?.length);

    if (withFiles.length === 0) {
      throw new NotFoundException(
        only?.length
          ? 'None of the submissions picked has a file attached.'
          : 'No submission in this season has a file attached.'
      );
    }

    const year = withFiles[0].season?.year ?? 'season';

    return zipOfFiles(
      withFiles.map((submission) => ({ folder: submissionFolder(submission), files: submission.files })),
      only?.length ? `gisday-${year}-submission-files-${withFiles.length}.zip` : `gisday-${year}-submission-files.zip`,
      'SubmissionFilesService',
      `The files listed for ${only?.length ? 'these submissions' : 'this season'} are missing from the server.`
    );
  }

  /**
   * The submission, with its files, if `user` owns it or holds `permission`. A submission that is not theirs is
   * reported as not found, so a guid cannot be used to learn whether a submission exists.
   */
  private async submissionFor(guid: string, user: OwnershipUser, permission: string): Promise<Submission> {
    const submission = await this.submissions.findOne({ where: { guid }, relations: { files: true, season: true } });

    if (!submission || !isOwnerOrPermitted(user, submission.accountGuid, permission)) {
      throw new NotFoundException('Submission not found.');
    }

    return submission;
  }

  private fileOf(submission: Submission, fileGuid: string): Asset {
    const file = (submission.files ?? []).find((f) => f.guid === fileGuid);

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    return file;
  }
}

/**
 * Keeps an upload Multer has written to the uploading folder: moved, under a new guid and its own extension, into
 * `folder` under APP_DATA. The submissions' files (#2933) and the session speakers' slides (#3093) are kept this way.
 */
export async function storeUpload(upload: Express.Multer.File, folder: string): Promise<{ guid: string; path: string }> {
  const guid = crypto.randomUUID();
  const path = `${folder}/${guid}${extensionOf(upload.originalname)}`;

  await mkdir(join(`${process.env.APP_DATA}`, folder), { recursive: true });
  await rename(upload.path, join(`${process.env.APP_DATA}`, path));

  return { guid, path };
}

/** Removes what is left of an upload: nothing once `storeUpload` has moved it, the whole file if it was refused. */
export async function discardUpload(upload: Express.Multer.File | undefined): Promise<void> {
  if (upload?.path) {
    await unlink(upload.path).catch(() => undefined);
  }
}

/** A kept file as the API lists it: its name, its size on disk (null when missing) and when it came. */
export async function fileDto(file: Asset): Promise<SubmissionFileDto> {
  const size = await stat(join(`${process.env.APP_DATA}`, file.path))
    .then((s) => s.size)
    .catch(() => null);

  return { guid: file.guid, name: file.name, size, uploaded: file.created };
}

/**
 * One kept file, streamed under the name it was uploaded with; not found, and logged, when it is missing from disk.
 * Saved by the browser by default, or, `inline`, shown in the page (#3090).
 */
export async function fileDownload(
  file: Asset,
  context: string,
  shown: 'attachment' | 'inline' = 'attachment'
): Promise<StreamableFile> {
  const onDisk = join(`${process.env.APP_DATA}`, file.path);
  const size = await stat(onDisk)
    .then((s) => s.size)
    .catch(() => null);

  if (size === null) {
    Logger.error(`File ${onDisk} is listed but missing from disk.`, context);
    throw new NotFoundException(`${file.name} is missing from the server.`);
  }

  return new StreamableFile(createReadStream(onDisk), {
    type: contentTypeOf(file.name),
    length: size,
    disposition: contentDisposition(shown, file.name)
  });
}

/**
 * Kept files as one zip, a folder each, under the names they were uploaded with: the season's submissions (#2933) and a
 * session's slides (#3174). Files are stored, not compressed: PowerPoint and PDF are already compressed, and storing streams
 * them through without holding them in memory. A file missing from disk is logged and left out; not found, with
 * `allMissing`, when every one is.
 */
export async function zipOfFiles(
  folders: ReadonlyArray<{ folder: string; files: ReadonlyArray<Asset> }>,
  name: string,
  context: string,
  allMissing: string
): Promise<StreamableFile> {
  const zip = new JSZip();
  let added = 0;

  for (const { folder, files } of folders) {
    const into = zip.folder(folder);
    const used = new Set<string>();

    for (const file of [...files].sort(byUploaded)) {
      const onDisk = join(`${process.env.APP_DATA}`, file.path);
      const exists = await stat(onDisk)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        Logger.error(`File ${onDisk} is listed but missing from disk; left out of the zip.`, context);
        continue;
      }

      into.file(uniqueName(file.name, used), createReadStream(onDisk), { binary: true });
      added++;
    }
  }

  if (added === 0) {
    throw new NotFoundException(allMissing);
  }

  return streamedZip(zip, name);
}

/**
 * A zip, streamed to the browser as an attachment named `name`: shared by every download built as one (#2933, #3174),
 * and the VGI export (#545). Stored, not compressed, unless asked: photos, PowerPoint and PDF are already compressed,
 * and storing streams each entry through as it is.
 */
export function streamedZip(zip: JSZip, name: string, compression: 'STORE' | 'DEFLATE' = 'STORE'): StreamableFile {
  const stream = zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true, compression }) as Readable;

  return new StreamableFile(stream, { type: 'application/zip', disposition: attachment(name) });
}

/**
 * Refuses a student's upload or removal once their competition's files have closed (#2934). The admins, who may update
 * the competitions, are not held to it.
 */
function refuseIfFilesClosed(submission: Submission, user: OwnershipUser): void {
  if (isOwnerOrPermitted(user, '', 'update:competitions')) {
    return;
  }

  const at = closedAt(submission.season, submission.submissionType, 'files');

  if (at && isDeadlineCompetition(submission.submissionType)) {
    throw new ForbiddenException(closedMessage(submission.submissionType, 'files', at));
  }
}

function byUploaded(a: Asset, b: Asset): number {
  return new Date(a.created).getTime() - new Date(b.created).getTime();
}

/** A folder name for a submission inside the zip: "presentation - Texas Watersheds - 1a2b3c4d". */
export function submissionFolder(submission: Pick<Submission, 'guid' | 'title' | 'submissionType'>): string {
  return `${submission.submissionType ?? 'submission'} - ${zipSafe(submission.title, 'Untitled')} - ${submission.guid.slice(0, 8)}`;
}

/** The name itself, or "name (2).ext" when the folder already has one by that name. */
export function uniqueName(name: string, used: Set<string>): string {
  const extension = extensionOf(name);
  const stem = extension ? name.slice(0, -extension.length) : name;
  let candidate = name;

  for (let n = 2; used.has(candidate.toLowerCase()); n++) {
    candidate = `${stem} (${n})${extension}`;
  }

  used.add(candidate.toLowerCase());

  return candidate;
}

function contentTypeOf(name: string): string {
  switch (extensionOf(name)) {
    case '.pdf':
      return 'application/pdf';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    default:
      return 'application/octet-stream';
  }
}

/** A Content-Disposition that keeps a name with accents or spaces: an ASCII fallback, and the name itself (RFC 6266). */
export function attachment(name: string): string {
  return contentDisposition('attachment', name);
}

/** The same for a file to be saved (`attachment`) or shown in the page (`inline`, #3090), under the name it came with. */
export function contentDisposition(shown: 'attachment' | 'inline', name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');

  return `${shown}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
