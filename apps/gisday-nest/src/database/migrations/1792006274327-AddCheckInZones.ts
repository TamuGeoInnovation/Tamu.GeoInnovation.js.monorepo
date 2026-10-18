import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckInZones1792006274327 implements MigrationInterface {
  name = 'AddCheckInZones1792006274327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD "checkInZone" ntext
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP COLUMN "checkInZone"
        `);
  }
}
