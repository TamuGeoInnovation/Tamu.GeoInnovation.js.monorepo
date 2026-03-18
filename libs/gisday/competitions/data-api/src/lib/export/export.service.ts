import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

import * as fs from 'fs/promises';

import { CompetitionSeason } from '../entities/all.entities';
import { InitiateExportDto, ExportTaskResponseDto, ExportStatusResponseDto } from './export.dto';

@Injectable()
export class ExportService {
  constructor(
    @InjectQueue('vgi-export') private readonly exportQueue: Queue,
    @InjectRepository(CompetitionSeason) private readonly seasonRepo: Repository<CompetitionSeason>
  ) {}

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
