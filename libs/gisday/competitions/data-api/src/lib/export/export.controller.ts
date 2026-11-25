import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards
} from '@nestjs/common';
import { type Response } from 'express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { ExportService } from './export.service';
import { InitiateExportDto, ExportTaskResponseDto, ExportStatusResponseDto } from './export.dto';

@Controller('competitions/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * The season's VGI submissions as one zip, streamed now (#545): the admin Submissions page's download. The active
   * season unless `seasonGuid` names another. Before `:jobId`, which would otherwise take "zip" for a job's id. The
   * queued routes below stay, unused, until their packages may be removed.
   */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('zip')
  async zipForSeason(@Query('seasonGuid') seasonGuid?: string): Promise<StreamableFile> {
    return this.exportService.zipForSeason(seasonGuid);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  async initiateExport(@Body() dto: InitiateExportDto): Promise<ExportTaskResponseDto> {
    return this.exportService.initiateExport(dto);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':jobId')
  async getExportStatus(@Param('jobId') jobId: string): Promise<ExportStatusResponseDto> {
    return this.exportService.getExportStatus(jobId);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':jobId/download')
  async downloadExport(@Param('jobId') jobId: string, @Res() res: Response) {
    const filePath = await this.exportService.getExportFilePath(jobId);

    if (filePath) {
      res.download(filePath);
    } else {
      throw new NotFoundException('Export not found or not yet complete.');
    }
  }
}
