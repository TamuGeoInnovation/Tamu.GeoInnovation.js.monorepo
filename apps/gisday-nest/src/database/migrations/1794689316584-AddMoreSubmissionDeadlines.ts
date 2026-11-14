import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoreSubmissionDeadlines1794689316584 implements MigrationInterface {
  // When a season's paper and cartography competitions stop taking submissions and edits, and when their files close
  // (#2962), as poster and presentation do (#2934). All empty for every existing season, which then stays open as before.
  name = 'AddMoreSubmissionDeadlines1794689316584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "paperSubmissionsCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "paperFilesCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "cartographySubmissionsCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "cartographyFilesCloseAt" datetimeoffset
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "cartographyFilesCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "cartographySubmissionsCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "paperFilesCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "paperSubmissionsCloseAt"
        `);
  }
}
