import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

export class GetSubmissionDto {
  @IsNotEmpty()
  public guid: string;
}

export class GetUserSubmissionsDto {
  @IsNotEmpty()
  public userGuid: string;

  @IsOptional()
  public seasonGuid?: string;
}

export class GetAdminSubmissionsDto {
  @IsOptional()
  public seasonGuid?: string;
}

export class GetSeasonStatisticsDto {
  @IsNotEmpty()
  public guid: string;
}

export class SeasonStatisticsDto {
  /**
   * Total number of responses for a given season.
   */
  public total: number;

  /**
   * A dictionary where the keys represent the question id in a season form. The inner object inside each
   * represents the count of individual response values for that question.
   */
  public breakdown: {
    [question_id: string]: {
      [count: string]: number;
    };
  };
}

export class ValidateSubmissionDto {
  @IsNotEmpty()
  public guid: string;

  @IsEnum(COMPETITION_VALIDATION_STATUS)
  public status: COMPETITION_VALIDATION_STATUS;

  // userGuid is set server-side from JWT
  public userGuid?: string;
}

export interface SubmissionReviewDto {
  guid: string;
  created: Date;
  questionValue: string;
  pointValue: number;
  validationStatus: string;
  userGuid?: string;
  resolvedIdentity?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageGuids: string[];
  sha256Hashes: string[];
}

export interface SubmissionMediaDto {
  guid: string;
  blob: Blob;
  mimeType?: string;
  fieldName?: string;
  sha256?: string;
}
