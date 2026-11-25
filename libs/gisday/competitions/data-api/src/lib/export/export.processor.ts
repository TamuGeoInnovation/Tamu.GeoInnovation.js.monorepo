import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type Job } from 'bull';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import JSZip from 'jszip';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

import { CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

import { exportCsv, exportedMedia, exportedSubmissions, exportRow, mediaPath } from './export-contents';

const BATCH_SIZE = 20;

/**
 * The folder `name` in `zip`. JSZip's types allow null, but its folder() returns a folder for every non-empty name
 * (and the zip itself for an empty one); only a regular expression gives anything else.
 */
function folderIn(zip: JSZip, name: string): JSZip {
  // Cannot be null: a string name always gives a folder (see above).
  return zip.folder(name)!;
}

async function addDirectoryToZip(dirPath: string, zipFolder: JSZip): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await addDirectoryToZip(fullPath, folderIn(zipFolder, entry.name));
    } else {
      zipFolder.file(entry.name, await fs.readFile(fullPath));
    }
  }
}

@Processor('vgi-export')
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    @InjectRepository(CompetitionSubmission) private readonly submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionMedia) private readonly mediaRepo: Repository<SubmissionMedia>
  ) {}

  @Process('export-season')
  async handleExport(job: Job<{ seasonGuid: string }>): Promise<{ filePath: string }> {
    const { seasonGuid } = job.data;

    this.logger.log(`Starting export for season ${seasonGuid}`);

    // 1. Query all submissions (metadata only, no blob binary)
    const submissions = await exportedSubmissions(this.submissionRepo, seasonGuid);

    const totalSubmissions = submissions.length;
    this.logger.log(`Found ${totalSubmissions} submissions for season ${seasonGuid}`);

    const exportDir = path.join(os.tmpdir(), 'vgi-exports', String(job.id));
    const mediasDir = path.join(exportDir, 'medias');
    await fs.ensureDir(mediasDir);

    // 2. Batch process: extract images + build CSV rows
    const csvRows: Array<Record<string, unknown>> = [];

    for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
      const batch = submissions.slice(i, i + BATCH_SIZE);

      for (const submission of batch) {
        const submissionMediaDir = path.join(mediasDir, submission.guid, 'images');
        await fs.ensureDir(submissionMediaDir);

        // Load blob binary data for this submission
        let mediaEntities: SubmissionMedia[] = [];

        try {
          mediaEntities = await exportedMedia(this.mediaRepo, submission.guid);
        } catch (err) {
          this.logger.warn(`Failed to load media for submission ${submission.guid}: ${err.message}`);
        }

        const imagePaths: string[] = [];

        for (const media of mediaEntities) {
          try {
            const relPath = mediaPath(submission.guid, media);
            await fs.writeFile(path.join(exportDir, relPath), media.blob as any);
            imagePaths.push(relPath);
          } catch (err) {
            this.logger.warn(`Failed to write media ${media.guid} for submission ${submission.guid}: ${err.message}`);
          }
        }

        csvRows.push(exportRow(submission, imagePaths, mediaEntities.length));
      }

      // Update progress (reserve last 10% for CSV + ZIP generation)
      const rawProgress = Math.round(((i + BATCH_SIZE) / totalSubmissions) * 90);
      await job.progress(Math.min(rawProgress, 90));
    }

    // 3. Generate CSV
    const csvString = exportCsv(csvRows);
    const csvPath = path.join(exportDir, 'submissions.csv');
    await fs.writeFile(csvPath, csvString, 'utf8');

    this.logger.log(`CSV generated with ${csvRows.length} rows`);

    // 4. Create ZIP using jszip
    const zip = new JSZip();
    zip.file('submissions.csv', await fs.readFile(csvPath));

    // Walk medias directory and add all images
    const mediasExists = await fs.pathExists(mediasDir);

    if (mediasExists) {
      await addDirectoryToZip(mediasDir, folderIn(zip, 'medias'));
    }

    // Stream ZIP to disk
    const zipPath = path.join(exportDir, `vgi-export-${seasonGuid}.zip`);
    const zipStream = zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    await pipeline(zipStream, createWriteStream(zipPath));

    this.logger.log(`ZIP archive created at ${zipPath}`);

    // 5. Clean up temp files (keep only ZIP)
    await fs.remove(mediasDir);
    await fs.remove(csvPath);

    await job.progress(100);
    return { filePath: zipPath };
  }
}
