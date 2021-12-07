import { IsNotEmpty } from 'class-validator';

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
