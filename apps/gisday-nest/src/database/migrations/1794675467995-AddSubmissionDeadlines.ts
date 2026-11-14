import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionDeadlines1794675467995 implements MigrationInterface {
  // When a season's poster and presentation competitions stop taking submissions and edits, and when their files
  // close (#2934). All empty for every existing season, which then stays open as before.
  name = 'AddSubmissionDeadlines1794675467995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "posterSubmissionsCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "posterFilesCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "presentationSubmissionsCloseAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD "presentationFilesCloseAt" datetimeoffset
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "presentationFilesCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "presentationSubmissionsCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "posterFilesCloseAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP COLUMN "posterSubmissionsCloseAt"
        `);
  }
}
