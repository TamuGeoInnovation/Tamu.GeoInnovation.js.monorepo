import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

import * as fs from 'fs/promises';
import JSZip from 'jszip';

import { Season, streamedZip } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';
import { exportCsv, exportedMedia, exportedSubmissions, exportRow, mediaPath } from './export-contents';
import { InitiateExportDto, ExportTaskResponseDto, ExportStatusResponseDto } from './export.dto';

@Injectable()
export class ExportService {
  constructor(
    @InjectQueue('vgi-export') private readonly exportQueue: Queue,
    @InjectRepository(CompetitionSeason) private readonly seasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private readonly platformSeasonRepo: Repository<Season>,
    @InjectRepository(CompetitionSubmission) private readonly submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionMedia) private readonly mediaRepo: Repository<SubmissionMedia>
  ) {}

  /**
   * The season's VGI submissions as one zip, built in the request and streamed (#545), as a session's slides and the
   * competition files are (#3185): `submissions.csv` and each submission's photos, as the queued export writes them.
   * The queue (#650) needs a Redis, which the cluster does not have, so a job there would never run. `seasonGuid` is
   * a GIS Day season, as the admin Submissions page asks for one, and the active season without it.
   */
  async zipForSeason(seasonGuid?: string): Promise<StreamableFile> {
    const season = await this.platformSeasonRepo.findOne({ where: seasonGuid ? { guid: seasonGuid } : { active: true } });
    const competitionSeason = season && (await this.seasonRepo.findOne({ where: { season: { guid: season.guid } } }));

    if (!season || !competitionSeason) {
      throw new NotFoundException('This season has no VGI competition.');
    }

    const submissions = await exportedSubmissions(this.submissionRepo, competitionSeason.guid);

    // Nothing to hand to the partners: said, rather than a zip holding a CSV of headings.
    if (submissions.length === 0) {
      throw new NotFoundException('This season has no VGI submissions.');
    }

    const zip = new JSZip();
    const rows: Array<Record<string, unknown>> = [];

    for (const submission of submissions) {
      const media = await exportedMedia(this.mediaRepo, submission.guid);
      const paths = media.map((m) => mediaPath(submission.guid, m));

      media.forEach((m, i) => zip.file(paths[i], m.blob as unknown as Buffer, { binary: true }));
      rows.push(exportRow(submission, paths));
    }

    zip.file('submissions.csv', exportCsv(rows));

    return streamedZip(zip, `gisday-${season.year}-vgi-submissions.zip`);
  }

  async initiateExport(dto: InitiateExportDto): Promise<ExportTaskResponseDto> {
    const season = await this.seasonRepo.findOne({ where: { guid: dto.seasonGuid } });

    if (!season) {
      throw new NotFoundException('Season not found.');
    }

    const job = await this.exportQueue.add('export-season', {
      seasonGuid: dto.seasonGuid
    }, {
      attempts: 1,
      removeOnComplete: { age: 86400 },
      removeOnFail: { age: 86400 }
    });

    return {
      jobId: String(job.id),
      statusUrl: `/competitions/export/${job.id}`
    };
  }

  async getExportStatus(jobId: string): Promise<ExportStatusResponseDto> {
    const job = await this.exportQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Export job not found.');
    }

    const state = await job.getState();
    const progress = job.progress();

    const response: ExportStatusResponseDto = {
      jobId: String(job.id),
      status: state,
      progress: typeof progress === 'number' ? progress : 0
    };

    if (state === 'completed' && job.returnvalue?.filePath) {
      response.downloadUrl = `/competitions/export/${job.id}/download`;
    }

    if (state === 'failed') {
      response.error = job.failedReason;
    }

    return response;
  }

  async getExportFilePath(jobId: string): Promise<string | undefined> {
    const job = await this.exportQueue.getJob(jobId);

    if (!job) {
      return undefined;
    }

    const state = await job.getState();

    if (state !== 'completed') {
      return undefined;
    }

    const filePath = job.returnvalue?.filePath;

    if (!filePath) {
      return undefined;
    }

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return undefined;
    }
  }
}
