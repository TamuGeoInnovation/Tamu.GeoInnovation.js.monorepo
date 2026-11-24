import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmissionFiles1794665166064 implements MigrationInterface {
  name = 'AddSubmissionFiles1794665166064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD "submissionGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_f4035a6b9676f3befc5bbd57388" FOREIGN KEY ("submissionGuid") REFERENCES "submissions"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_f4035a6b9676f3befc5bbd57388"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP COLUMN "submissionGuid"
        `);
  }
}
