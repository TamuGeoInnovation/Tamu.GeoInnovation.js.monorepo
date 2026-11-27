import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import JSZip from 'jszip';

import { Season, streamedZip } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission, SubmissionMedia } from '../entities/all.entities';
import { exportCsv, exportedMedia, exportedSubmissions, exportRow, mediaPath } from './export-contents';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(CompetitionSeason) private readonly seasonRepo: Repository<CompetitionSeason>,
    @InjectRepository(Season) private readonly platformSeasonRepo: Repository<Season>,
    @InjectRepository(CompetitionSubmission) private readonly submissionRepo: Repository<CompetitionSubmission>,
    @InjectRepository(SubmissionMedia) private readonly mediaRepo: Repository<SubmissionMedia>
  ) {}

  /**
   * The season's VGI submissions as one zip, built in the request and streamed (#545), as a session's slides and the
   * competition files are (#3185): `submissions.csv` and each submission's photos. This is the only VGI export: the
   * queued one (#650) needed a Redis the cluster does not have, nothing called it, and #3788 removed it with `bull`.
   * `seasonGuid` is a GIS Day season, as the admin Submissions page asks for one, and the active season without it.
   */
  async zipForSeason(seasonGuid?: string): Promise<StreamableFile> {
    const season = await this.platformSeasonRepo.findOne({ where: seasonGuid ? { guid: seasonGuid } : { active: true } });
    const competitionSeason = season ? await this.seasonRepo.findOne({ where: { season: { guid: season.guid } } }) : null;

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
}
