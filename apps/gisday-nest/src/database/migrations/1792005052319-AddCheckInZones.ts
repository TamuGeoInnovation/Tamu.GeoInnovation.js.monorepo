import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckInZones1792005052319 implements MigrationInterface {
  name = 'AddCheckInZones1792005052319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD "checkInZone" ntext
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD "outsideZone" bit NOT NULL CONSTRAINT "DF_15a415333aac89fe238b0135226" DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_15a415333aac89fe238b0135226"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP COLUMN "outsideZone"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP COLUMN "checkInZone"
        `);
  }
}
