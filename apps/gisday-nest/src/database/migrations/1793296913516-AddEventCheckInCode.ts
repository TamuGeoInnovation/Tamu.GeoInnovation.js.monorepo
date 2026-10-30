import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `events.checkInCode`, the secret in a hybrid or virtual session's check-in QR code (#2560). Empty
 * until an organizer first shows the code. It only adds, so the API before this change keeps working once
 * it has run.
 */
export class AddEventCheckInCode1793296913516 implements MigrationInterface {
  name = 'AddEventCheckInCode1793296913516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "checkInCode" nvarchar(64)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "checkInCode"
        `);
  }
}
