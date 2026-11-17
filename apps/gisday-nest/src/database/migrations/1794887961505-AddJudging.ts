import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Judging the research competitions (#3183): the rubrics and their criteria, which competition a session judges and
 * whether its judging is closed, which of its speakers judge it, what a speaker's link opens (`profile`, as every link so
 * far, or `judging`), and each judge's scores. Only adds tables and columns, every existing link a `profile` link and
 * every session judging nothing, so the image before it keeps working against it.
 */
export class AddJudging1794887961505 implements MigrationInterface {
  name = 'AddJudging1794887961505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "rubrics" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_67a392968a59bc25a0826344edb" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_3ca362d13b1c04f1489c86cafb8" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "competitionType" nvarchar(20) NOT NULL,
                "name" nvarchar(255) NOT NULL,
                "description" nvarchar(MAX),
                "seasonGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "UQ_a5071b4b3fad53211940014ec62" UNIQUE ("seasonGuid", "competitionType"),
                CONSTRAINT "PK_820b62817798015910c60c4aaa3" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "rubric_criteria" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_e307b39128da2488b88b731a5c0" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_f64648f03d2cd8b218f06f15f64" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "position" int NOT NULL,
                "name" nvarchar(255) NOT NULL,
                "maxPoints" int NOT NULL,
                "levels" ntext NOT NULL,
                "rubricGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_9c143d7148d0338f506a41710f3" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "assessments" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_893bb2aa9c0ed570cc01ba760cb" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_81bc9c0da2de45e26d6cae6983f" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "eventGuid" nvarchar(36) NOT NULL,
                "scores" ntext NOT NULL,
                "total" int NOT NULL,
                "comment" nvarchar(MAX),
                "judgeGuid" nvarchar(255) NOT NULL,
                "submissionGuid" nvarchar(255) NOT NULL,
                "rubricGuid" nvarchar(255),
                CONSTRAINT "UQ_dd0a4f8be851b9404dd9a784710" UNIQUE ("judgeGuid", "submissionGuid"),
                CONSTRAINT "PK_c639c4eb290111553fa31227f6e" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_judges" (
                "eventsGuid" nvarchar(255) NOT NULL,
                "speakersGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_a00c7dfcb96093ca12929ec1054" PRIMARY KEY ("eventsGuid", "speakersGuid")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3d44b18e47a629a44fc729b2ee" ON "event_judges" ("eventsGuid")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f2f8cc56bf9b647e68a4b2c0a5" ON "event_judges" ("speakersGuid")
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "judgedCompetition" nvarchar(50)
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD "judgingClosed" bit NOT NULL CONSTRAINT "DF_060b80b70872b9236757c1b7cd2" DEFAULT 0
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edit_links"
            ADD "purpose" nvarchar(20) NOT NULL CONSTRAINT "DF_f3da300af30d503555d6f6a9c39" DEFAULT 'profile'
        `);
    await queryRunner.query(`
            ALTER TABLE "rubrics"
            ADD CONSTRAINT "FK_39ffcb1e7326e19911d6d2dc69f" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "rubric_criteria"
            ADD CONSTRAINT "FK_1c6135f718651397beb35716455" FOREIGN KEY ("rubricGuid") REFERENCES "rubrics"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments"
            ADD CONSTRAINT "FK_6ac2efda97f8421932f1c3c7b05" FOREIGN KEY ("judgeGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments"
            ADD CONSTRAINT "FK_5d7ccdedd0103aee58e850c6a12" FOREIGN KEY ("submissionGuid") REFERENCES "submissions"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments"
            ADD CONSTRAINT "FK_648fa966b632e148f013201ade4" FOREIGN KEY ("rubricGuid") REFERENCES "rubrics"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_judges"
            ADD CONSTRAINT "FK_3d44b18e47a629a44fc729b2ee8" FOREIGN KEY ("eventsGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_judges"
            ADD CONSTRAINT "FK_f2f8cc56bf9b647e68a4b2c0a5d" FOREIGN KEY ("speakersGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_judges" DROP CONSTRAINT "FK_f2f8cc56bf9b647e68a4b2c0a5d"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_judges" DROP CONSTRAINT "FK_3d44b18e47a629a44fc729b2ee8"
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments" DROP CONSTRAINT "FK_648fa966b632e148f013201ade4"
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments" DROP CONSTRAINT "FK_5d7ccdedd0103aee58e850c6a12"
        `);
    await queryRunner.query(`
            ALTER TABLE "assessments" DROP CONSTRAINT "FK_6ac2efda97f8421932f1c3c7b05"
        `);
    await queryRunner.query(`
            ALTER TABLE "rubric_criteria" DROP CONSTRAINT "FK_1c6135f718651397beb35716455"
        `);
    await queryRunner.query(`
            ALTER TABLE "rubrics" DROP CONSTRAINT "FK_39ffcb1e7326e19911d6d2dc69f"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edit_links" DROP CONSTRAINT "DF_f3da300af30d503555d6f6a9c39"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edit_links" DROP COLUMN "purpose"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_060b80b70872b9236757c1b7cd2"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "judgingClosed"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP COLUMN "judgedCompetition"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_f2f8cc56bf9b647e68a4b2c0a5" ON "event_judges"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_3d44b18e47a629a44fc729b2ee" ON "event_judges"
        `);
    await queryRunner.query(`
            DROP TABLE "event_judges"
        `);
    await queryRunner.query(`
            DROP TABLE "assessments"
        `);
    await queryRunner.query(`
            DROP TABLE "rubric_criteria"
        `);
    await queryRunner.query(`
            DROP TABLE "rubrics"
        `);
  }
}
