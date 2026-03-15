import { Body, Controller, Get, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { ExportService } from './export.service';
import { InitiateExportDto, ExportTaskResponseDto, ExportStatusResponseDto } from './export.dto';

@Controller('competitions/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

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
