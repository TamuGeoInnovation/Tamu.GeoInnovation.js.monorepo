import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeasonCompetitionTypes1794710094385 implements MigrationInterface {
  // Which research competitions a season runs, comma-separated (#2948). Empty for every existing season, which then runs
  // every competition as before.
  name = 'AddSeasonCompetitionTypes1794710094385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "competitionTypes" nvarchar(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "competitionTypes"
        `);
  }
}
