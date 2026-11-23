import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * A session can be marked as having no slides (#3147): its speakers are then not asked for any and cannot upload them.
 * Only adds a column, unticked for every session, so the image before it keeps working against it.
 */
export class AddEventNoSlides1794872844152 implements MigrationInterface {
  name = 'AddEventNoSlides1794872844152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "noSlides" bit NOT NULL CONSTRAINT "DF_0d779b8d0361e4fbf20b995cea8" DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_0d779b8d0361e4fbf20b995cea8"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "noSlides"
        `);
  }
}
