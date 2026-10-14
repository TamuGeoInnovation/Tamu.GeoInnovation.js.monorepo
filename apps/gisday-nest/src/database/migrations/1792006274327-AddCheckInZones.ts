import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckInZones1792006274327 implements MigrationInterface {
  name = 'AddCheckInZones1792006274327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD "checkInZone" ntext
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD "zoneStatus" nvarchar(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP COLUMN "zoneStatus"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP COLUMN "checkInZone"
        `);
  }
}
