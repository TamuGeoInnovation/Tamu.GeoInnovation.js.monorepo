import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import * as Papa from 'papaparse';
import * as JSZip from 'jszip';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

import { CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';

const BATCH_SIZE = 20;

function mimeToExtension(mimeType?: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff'
  };

  return map[mimeType?.toLowerCase()] || '.bin';
}

async function addDirectoryToZip(dirPath: string, zipFolder: JSZip): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await addDirectoryToZip(fullPath, zipFolder.folder(entry.name));
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
    const submissions = await this.submissionRepo.find({
      where: { season: { guid: seasonGuid } },
      relations: ['location', 'validationStatus', 'blobs'],
      select: {
        blobs: { guid: true, mimeType: true, fieldName: true, sha256: true }
      },
      order: { created: 'ASC' }
    });

    const totalSubmissions = submissions.length;
    this.logger.log(`Found ${totalSubmissions} submissions for season ${seasonGuid}`);

    const exportDir = path.join(os.tmpdir(), 'vgi-exports', String(job.id));
    const mediasDir = path.join(exportDir, 'medias');
    await fs.ensureDir(mediasDir);

    // 2. Batch process: extract images + build CSV rows
    const csvRows = [];

    for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
      const batch = submissions.slice(i, i + BATCH_SIZE);

      for (const submission of batch) {
        const submissionMediaDir = path.join(mediasDir, submission.guid, 'images');
        await fs.ensureDir(submissionMediaDir);

        // Load blob binary data for this submission
        let mediaEntities: SubmissionMedia[] = [];

        try {
          mediaEntities = await this.mediaRepo.find({
            where: { submission: { guid: submission.guid } }
          });
        } catch (err) {
          this.logger.warn(`Failed to load media for submission ${submission.guid}: ${err.message}`);
        }

        const imagePaths: string[] = [];

        for (const media of mediaEntities) {
          try {
            const ext = mimeToExtension(media.mimeType);
            const filename = `${media.guid}${ext}`;
            const relPath = `medias/${submission.guid}/images/${filename}`;
            await fs.writeFile(path.join(exportDir, relPath), media.blob as any);
            imagePaths.push(relPath);
          } catch (err) {
            this.logger.warn(`Failed to write media ${media.guid} for submission ${submission.guid}: ${err.message}`);
          }
        }

        // Parse form values and build CSV row
        let formValues = {};

        try {
          formValues = typeof submission.value === 'string' ? JSON.parse(submission.value) : submission.value || {};
        } catch {
          formValues = {};
        }

        csvRows.push({
          submission_guid: submission.guid,
          user_guid: submission.userGuid,
          created: submission.created?.toISOString(),
          latitude: submission.location?.latitude,
          longitude: submission.location?.longitude,
          accuracy: submission.location?.accuracy,
          altitude: submission.location?.altitude,
          validation_status: submission.validationStatus?.status || 'unverified',
          image_count: mediaEntities.length,
          image_paths: imagePaths.join(';'),
          ...formValues
        });
      }

      // Update progress (reserve last 10% for CSV + ZIP generation)
      const rawProgress = Math.round(((i + BATCH_SIZE) / totalSubmissions) * 90);
      await job.progress(Math.min(rawProgress, 90));
    }

    // 3. Generate CSV
    const csvString = Papa.unparse(csvRows, { header: true });
    const csvPath = path.join(exportDir, 'submissions.csv');
    await fs.writeFile(csvPath, csvString, 'utf8');

    this.logger.log(`CSV generated with ${csvRows.length} rows`);

    // 4. Create ZIP using jszip
    const zip = new JSZip();
    zip.file('submissions.csv', await fs.readFile(csvPath));

    // Walk medias directory and add all images
    const mediasExists = await fs.pathExists(mediasDir);

    if (mediasExists) {
      await addDirectoryToZip(mediasDir, zip.folder('medias'));
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
