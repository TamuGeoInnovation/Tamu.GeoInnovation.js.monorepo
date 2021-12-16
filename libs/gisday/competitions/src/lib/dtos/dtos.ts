import { IsEnum, IsNotEmpty } from 'class-validator';

import { VALIDATION_STATUS } from '../enums/competitions.enums';

export class GetSubmissionDto {
  @IsNotEmpty()
  public guid: string;
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

  @IsNotEmpty()
  public userGuid: string;

  @IsEnum(VALIDATION_STATUS)
  public status: VALIDATION_STATUS;
}
