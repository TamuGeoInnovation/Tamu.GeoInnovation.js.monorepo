import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompetitionScoringWindow1793130952432 implements MigrationInterface {
  // When a competition season's submissions start and stop counting for scoring (#2474). Both empty
  // for every existing season, which then scores as before.
  name = 'AddCompetitionScoringWindow1793130952432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD "scoringOpensAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD "scoringClosesAt" datetimeoffset
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP COLUMN "scoringClosesAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP COLUMN "scoringOpensAt"
        `);
  }
}
