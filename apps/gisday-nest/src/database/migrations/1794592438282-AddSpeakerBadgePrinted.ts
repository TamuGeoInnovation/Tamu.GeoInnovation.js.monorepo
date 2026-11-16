import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpeakerBadgePrinted1794592438282 implements MigrationInterface {
  name = 'AddSpeakerBadgePrinted1794592438282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD "badgePrintedAt" datetimeoffset
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD "badgePrintedText" nvarchar(1000)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP COLUMN "badgePrintedText"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP COLUMN "badgePrintedAt"
        `);
  }
}
