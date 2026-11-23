import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `season_winners`, each season's 1st, 2nd and 3rd of its research competitions, for gisday.tamu.edu's homepage
 * (#3239): a place, unique per season and competition, won by a submission or, for the trail challenge, an account. It
 * goes with its season or its submission. It only adds, so the API before this change keeps working once it has run.
 */
export class AddSeasonWinners1795444106838 implements MigrationInterface {
  name = 'AddSeasonWinners1795444106838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "season_winners" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_c35b58e8e2f9c4e091dbb4fd8d3" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_1196d02c29f25e7ad6f1cc3fffe" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "competition" nvarchar(40) NOT NULL,
                "place" int NOT NULL,
                "accountGuid" nvarchar(255),
                "seasonGuid" nvarchar(255) NOT NULL,
                "submissionGuid" nvarchar(255),
                CONSTRAINT "UQ_d65afb04d3e346ea81e525cebaf" UNIQUE ("seasonGuid", "competition", "place"),
                CONSTRAINT "PK_4ff347530689cfc974139048a44" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "season_winners"
            ADD CONSTRAINT "FK_044446ba16d82ce0ed34aae964d" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "season_winners"
            ADD CONSTRAINT "FK_fb9b12dd8b6300c604c5c49a850" FOREIGN KEY ("submissionGuid") REFERENCES "submissions"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "season_winners" DROP CONSTRAINT "FK_fb9b12dd8b6300c604c5c49a850"
        `);
    await queryRunner.query(`
            ALTER TABLE "season_winners" DROP CONSTRAINT "FK_044446ba16d82ce0ed34aae964d"
        `);
    await queryRunner.query(`
            DROP TABLE "season_winners"
        `);
  }
}
