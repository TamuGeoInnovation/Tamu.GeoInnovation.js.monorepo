import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `sponsors.logoSize`, so a sponsor's logo can be drawn small, regular, large or extra large on the
 * Sponsors page (#2638). Every existing sponsor is `regular`, the size before. It only adds, so the API
 * before this change keeps working once it has run.
 */
export class AddSponsorLogoSize1793810744009 implements MigrationInterface {
  name = 'AddSponsorLogoSize1793810744009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD "logoSize" nvarchar(255) NOT NULL CONSTRAINT "DF_8e390b951aaf12b893b4aea2580" DEFAULT 'regular'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_8e390b951aaf12b893b4aea2580"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP COLUMN "logoSize"
        `);
  }
}
