// Frontend-safe exports - DTOs, enums, and interfaces only
// Do not import entity classes here to avoid pulling in TypeORM and Node.js modules

export * from './lib/dtos/dtos';

// Re-export only the interfaces from entities, not the classes
export type {
  ICompetitionSubmission,
  ICompetitionSubmissionValidationStatus,
  ISubmissionMedia,
  ICompetitionSubmissionLocation,
  ICompetitionSeason,
  ICompetitionSeasonForm,
  ICompetitionSeasonFormQuestion
} from './lib/entities/all.entities';
