import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeasonCompetitions1794746266725 implements MigrationInterface {
  // The research competitions each season runs, one row each (#2948). Empty for every season, which then runs every
  // competition as before. A season's rows go with it.
  name = 'AddSeasonCompetitions1794746266725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "season_competitions" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_a8d25788388c6fc0da87b39bdc6" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_e27480f22080b6c1577cc5429c9" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "competitionType" nvarchar(50) NOT NULL,
                "seasonGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "UQ_30dd0cf73a84dc778f667c05ba5" UNIQUE ("seasonGuid", "competitionType"),
                CONSTRAINT "PK_ba92f88cad078bbb7465a4f77f1" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "season_competitions"
            ADD CONSTRAINT "FK_b1952d309851f5cea88bae77244" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "season_competitions" DROP CONSTRAINT "FK_b1952d309851f5cea88bae77244"
        `);
    await queryRunner.query(`
            DROP TABLE "season_competitions"
        `);
  }
}
