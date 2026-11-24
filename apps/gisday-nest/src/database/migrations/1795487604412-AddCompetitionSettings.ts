import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Each competition's settings for a season (#3019, decided 6A and 7A), as columns of `season_competitions` (#2948): its
 * sessions, chosen in Admin, and when its finalists hear.
 *
 * `runs` keeps what a row has meant since #2948, that the season runs the competition: every row there is gets 1 (`WITH
 * VALUES`), so a season that runs only some competitions still does. A row that holds only settings has it empty. The
 * API before this change reads every row as one the season runs, and there are no settings-only rows until the new API
 * writes them, so it keeps working once this has run.
 *
 * The session columns are events' ids with no foreign key: SQL Server allows one cascading key between two tables, and
 * a session that no longer exists falls back to the `COMPETITION:` names. `down()` removes the settings-only rows before
 * the columns, since the API before this would read each as a competition the season runs.
 */
export class AddCompetitionSettings1795487604412 implements MigrationInterface {
  name = 'AddCompetitionSettings1795487604412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD "runs" bit CONSTRAINT "DF_c9ab889b5d58c9a45ba71986ed2" DEFAULT 1 WITH VALUES
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD "sessionGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD "graduateSessionGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD "awardsSessionGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD "finalistsNotifiedAt" datetimeoffset
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "season_competitions" WHERE "runs" IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP COLUMN "finalistsNotifiedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP COLUMN "awardsSessionGuid"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP COLUMN "graduateSessionGuid"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP COLUMN "sessionGuid"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP CONSTRAINT "DF_c9ab889b5d58c9a45ba71986ed2"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP COLUMN "runs"
        `);
  }
}
