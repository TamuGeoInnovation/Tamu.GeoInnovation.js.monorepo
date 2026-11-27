import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes the initial survey (#3667): `initial_survey_responses`, `initial_survey_questions` and
 * `user_info.hasCompletedInitialSurvey`. Nothing links to the survey's page, and this change deletes its page, its API
 * module and its entities.
 *
 * `migration:generate` writes only the column drop: TypeORM does not drop a table no entity names, so the two table
 * drops are written here by hand, as DropSessionDetailsSends1795489415122 (#3269) did.
 *
 * **Deploy the API from this change before running this.** The API before it selects `hasCompletedInitialSurvey` with
 * every `user_info` read, so dropping the column under it breaks those reads. Code first, then the migration.
 *
 * `down()` puts the tables and column back as they stand before this migration, empty: their rows are not kept.
 */
export class RemoveInitialSurvey1795626160254 implements MigrationInterface {
  name = 'RemoveInitialSurvey1795626160254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "FK_59ca4cfb5e8ee3b3a52bbd50e2b"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "FK_461bb54e4f9f5e55b946e4b24c0"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "FK_bbffec509ddf4b7fe93c5b0b5f2"
        `);
    await queryRunner.query(`
            DROP TABLE "initial_survey_responses"
        `);
    await queryRunner.query(`
            DROP TABLE "initial_survey_questions"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info" DROP COLUMN "hasCompletedInitialSurvey"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ADD "hasCompletedInitialSurvey" nvarchar(255)
        `);
    await queryRunner.query(`
            CREATE TABLE "initial_survey_questions" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_077446574ac8385f8b6c3b804e2" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_1b359112dafb4c5871d0db83105" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "questionText" nvarchar(255),
                "questionOptions" nvarchar(255),
                "questionTypeGuid" nvarchar(255),
                CONSTRAINT "PK_2a0c75ffbf00e22caff50a71f7a" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "initial_survey_responses" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_d712ce56fa0cd06f762baa63980" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255) NOT NULL,
                "responseValue" nvarchar(255) NOT NULL,
                "seasonGuid" nvarchar(255),
                "questionGuid" nvarchar(255),
                CONSTRAINT "PK_294952681cab1a104c07c0a6315" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "FK_bbffec509ddf4b7fe93c5b0b5f2" FOREIGN KEY ("questionTypeGuid") REFERENCES "question_types"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "FK_461bb54e4f9f5e55b946e4b24c0" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "FK_59ca4cfb5e8ee3b3a52bbd50e2b" FOREIGN KEY ("questionGuid") REFERENCES "initial_survey_questions"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
