import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpeakerEditUniversity1794678473447 implements MigrationInterface {
  name = 'AddSpeakerEditUniversity1794678473447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speaker_edits"
            ADD "graduationYear" nvarchar(50)
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edits"
            ADD "universityGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edits"
            ADD CONSTRAINT "FK_1ce1d4e12b9b0888ca1970e74ca" FOREIGN KEY ("universityGuid") REFERENCES "universities"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speaker_edits" DROP CONSTRAINT "FK_1ce1d4e12b9b0888ca1970e74ca"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edits" DROP COLUMN "universityGuid"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edits" DROP COLUMN "graduationYear"
        `);
  }
}
