import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes `question_types` (#3807), with the question-type API that was its only reader: the initial survey it typed
 * the questions of was removed in #3667, and nothing has read it since. The code is on `parked/initial-survey`.
 *
 * Written by hand: `migration:generate` finds no change, because TypeORM does not drop a table no entity names, as
 * RemoveInitialSurvey1795626160254 (#3667) found.
 *
 * The table is empty on every database it was checked on, and nothing refers to it. Run after the API from this change
 * is deployed: the API before it still serves `/api/question-types`, which nothing calls, but which would then fail.
 *
 * `down()` puts the table back as it stands before this migration, empty, with the defaults FixTimestampDefaults
 * (#2926) gave it.
 */
export class RemoveQuestionTypes1795830826245 implements MigrationInterface {
  name = 'RemoveQuestionTypes1795830826245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "question_types"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "question_types" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_226d529d540c78dba8f1991bb7c" DEFAULT sysdatetimeoffset(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_145204633a10b1a29b3a0a2a421" DEFAULT sysdatetimeoffset(),
                "guid" nvarchar(255) NOT NULL,
                "type" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_68204bc7dba22f94bed034982f6" PRIMARY KEY ("guid")
            )
        `);
  }
}
