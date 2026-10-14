import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventLocationCheckInZone1792002932031 implements MigrationInterface {
  name = 'AddEventLocationCheckInZone1792002932031';

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
