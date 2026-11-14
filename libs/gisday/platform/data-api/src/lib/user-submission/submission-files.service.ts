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
  StreamableFile
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import JSZip from 'jszip';

import { OwnershipUser, isOwnerOrPermitted } from '@tamu-gisc/common/nest/auth';
import { SubmissionFileDto, extensionOf, submissionFileProblem } from '@tamu-gisc/gisday/common';

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

    return Promise.all((submission.files ?? []).sort(byUploaded).map((file) => this.toDto(file)));
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
      const problem = submissionFileProblem(upload.originalname, upload.size, submission.files?.length ?? 0);

      if (problem) {
        throw new BadRequestException(problem);
      }

      const guid = crypto.randomUUID();
      const folder = `submissions/${submission.guid}`;
      const path = `${folder}/${guid}${extensionOf(upload.originalname)}`;

      await mkdir(join(`${process.env.APP_DATA}`, folder), { recursive: true });
      await rename(upload.path, join(`${process.env.APP_DATA}`, path));

      const saved = await this.assets.save(
        this.assets.create({ guid, name: upload.originalname, path, type: SUBMISSION_FILE_TYPE, submission })
      );

      return this.toDto(saved);
    } finally {
      // Gone once moved; still there if anything above refused it.
      if (upload?.path) {
        await unlink(upload.path).catch(() => undefined);
      }
    }
  }

  public async remove(submissionGuid: string, fileGuid: string, user: OwnershipUser): Promise<void> {
    const submission = await this.submissionFor(submissionGuid, user, 'update:competitions');
    const file = this.fileOf(submission, fileGuid);

    await this.assets.delete(file.guid);
    await this.assetsService.deleteAssetFiles([file]);
  }

  /** One file, under the name it was uploaded with. */
  public async download(submissionGuid: string, fileGuid: string, user: OwnershipUser): Promise<StreamableFile> {
    const submission = await this.submissionFor(submissionGuid, user, 'read:competitions');
    const file = this.fileOf(submission, fileGuid);
    const onDisk = join(`${process.env.APP_DATA}`, file.path);
    const size = await stat(onDisk)
      .then((s) => s.size)
      .catch(() => null);

    if (size === null) {
      Logger.error(`Submission file ${onDisk} is listed but missing from disk.`, 'SubmissionFilesService');
      throw new NotFoundException(`${file.name} is missing from the server.`);
    }

    return new StreamableFile(createReadStream(onDisk), {
      type: contentTypeOf(file.name),
      length: size,
      disposition: attachment(file.name)
    });
  }

  /**
   * Every file of a season's submissions as one zip, a folder per submission: its type, its title and the start of its
   * guid, so two submissions with one title stay apart. Files are stored, not compressed: PowerPoint and PDF are already
   * compressed, and storing streams them through without holding them in memory.
   */
  public async zipForSeason(seasonGuid: string, user: OwnershipUser): Promise<StreamableFile> {
    if (!isOwnerOrPermitted(user, '', 'read:competitions')) {
      throw new ForbiddenException();
    }

    const submissions = await this.submissions.find({
      where: { season: { guid: seasonGuid } },
      relations: { files: true, season: true }
    });
    const withFiles = submissions.filter((s) => s.files?.length);

    if (withFiles.length === 0) {
      throw new NotFoundException('No submission in this season has a file attached.');
    }

    const zip = new JSZip();
    let added = 0;

    for (const submission of withFiles) {
      const folder = zip.folder(submissionFolder(submission));
      const used = new Set<string>();

      for (const file of submission.files.sort(byUploaded)) {
        const onDisk = join(`${process.env.APP_DATA}`, file.path);
        const exists = await stat(onDisk)
          .then(() => true)
          .catch(() => false);

        if (!exists) {
          Logger.error(
            `Submission file ${onDisk} is listed but missing from disk; left out of the zip.`,
            'SubmissionFilesService'
          );
          continue;
        }

        folder.file(uniqueName(file.name, used), createReadStream(onDisk), { binary: true });
        added++;
      }
    }

    if (added === 0) {
      throw new NotFoundException('The files listed for this season are missing from the server.');
    }

    const year = withFiles[0].season?.year ?? 'season';
    const stream = zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true, compression: 'STORE' }) as Readable;

    return new StreamableFile(stream, {
      type: 'application/zip',
      disposition: attachment(`gisday-${year}-submission-files.zip`)
    });
  }

  /**
   * The submission, with its files, if `user` owns it or holds `permission`. A submission that is not theirs is
   * reported as not found, so a guid cannot be used to learn whether a submission exists.
   */
  private async submissionFor(guid: string, user: OwnershipUser, permission: string): Promise<Submission> {
    const submission = await this.submissions.findOne({ where: { guid }, relations: { files: true } });

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

  private async toDto(file: Asset): Promise<SubmissionFileDto> {
    const size = await stat(join(`${process.env.APP_DATA}`, file.path))
      .then((s) => s.size)
      .catch(() => null);

    return { guid: file.guid, name: file.name, size, uploaded: file.created };
  }
}

function byUploaded(a: Asset, b: Asset): number {
  return new Date(a.created).getTime() - new Date(b.created).getTime();
}

/** A folder name for a submission inside the zip: "presentation - Texas Watersheds - 1a2b3c4d". */
export function submissionFolder(submission: Pick<Submission, 'guid' | 'title' | 'submissionType'>): string {
  const title = (submission.title ?? 'Untitled')
    .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return `${submission.submissionType ?? 'submission'} - ${title} - ${submission.guid.slice(0, 8)}`;
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
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');

  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
