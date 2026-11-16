import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionFiles1794786922753 implements MigrationInterface {
  name = 'AddSessionFiles1794786922753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD "eventGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_46acb34f30700cb649db2d44abb" FOREIGN KEY ("eventGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_46acb34f30700cb649db2d44abb"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP COLUMN "eventGuid"
        `);
  }
}
