import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `events.checkInMinutesBefore` and `events.checkInMinutesAfter`, each session's check-in window around its time
 * (#3209). Every existing session takes the defaults, 5 minutes before its start and 10 after its end, which replace the
 * fixed window of its start until 15 minutes after its end. It only adds, so the API before this change keeps working
 * once it has run, with its old window.
 */
export class AddCheckInMinutes1794967200000 implements MigrationInterface {
  name = 'AddCheckInMinutes1794967200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "checkInMinutesBefore" int NOT NULL CONSTRAINT "DF_440f03ea9af45ef4a12e6eb7a2f" DEFAULT 5
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "checkInMinutesAfter" int NOT NULL CONSTRAINT "DF_32081e485b5817df29d0ca2e1f8" DEFAULT 10
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_32081e485b5817df29d0ca2e1f8"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "checkInMinutesAfter"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_440f03ea9af45ef4a12e6eb7a2f"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "checkInMinutesBefore"
        `);
  }
}
