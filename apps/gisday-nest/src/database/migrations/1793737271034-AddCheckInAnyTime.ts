import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `events.checkInAnyTime`, which opens a session's check-in at any time, and
 * `checkins.outsideSessionTime`, which marks a check-in made outside its session's time (#2635). Both
 * default to 0: every session keeps its window and no existing check-in is marked. It only adds, so the API
 * before this change keeps working once it has run.
 */
export class AddCheckInAnyTime1793737271034 implements MigrationInterface {
  name = 'AddCheckInAnyTime1793737271034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "checkInAnyTime" bit NOT NULL CONSTRAINT "DF_3a9d38b801413342b7c07ae74ea" DEFAULT 0
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD "outsideSessionTime" bit NOT NULL CONSTRAINT "DF_3f4928c3e91ab2ffb036f15e038" DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_3f4928c3e91ab2ffb036f15e038"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP COLUMN "outsideSessionTime"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_3a9d38b801413342b7c07ae74ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "checkInAnyTime"
        `);
  }
}
