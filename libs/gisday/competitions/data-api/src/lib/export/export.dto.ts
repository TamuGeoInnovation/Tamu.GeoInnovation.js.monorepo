import { IsNotEmpty } from 'class-validator';

export class InitiateExportDto {
  @IsNotEmpty()
  public seasonGuid: string;
}

export interface ExportTaskResponseDto {
  jobId: string;
  statusUrl: string;
}

export interface ExportStatusResponseDto {
  jobId: string;
  status: string;
  progress?: number;
  downloadUrl?: string;
  error?: string;
}
