import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `sponsors.active`, so a sponsor can be switched off for a season and kept (#1962). Every
 * existing sponsor stays active. It only adds, so the API before this change keeps working once it
 * has run.
 */
export class AddSponsorActive1792441136033 implements MigrationInterface {
  name = 'AddSponsorActive1792441136033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD "active" bit NOT NULL CONSTRAINT "DF_db44add7b0e1a98bf4fa5a41d7f" DEFAULT 1
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_db44add7b0e1a98bf4fa5a41d7f"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP COLUMN "active"
        `);
  }
}
