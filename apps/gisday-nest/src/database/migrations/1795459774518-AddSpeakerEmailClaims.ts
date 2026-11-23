import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `speaker_email_claims`, one repeat guard for every session's speaker email (#3260): a row for each speaker sent
 * the session details, Ask for slides or Ask to judge email about a session, claimed before the email goes, so every
 * copy of the API catches a repeated send. The session details email's own table, `session_details_sends` (#3098), is
 * copied into it as kind `session-details` and dropped; `down()` puts it back with those rows. The API before this change
 * reads `session_details_sends`, so run this with the API that reads the new table. Dated after
 * AddSessionDetailsSends1795448491167, which production has.
 */
export class AddSpeakerEmailClaims1795459774518 implements MigrationInterface {
  name = 'AddSpeakerEmailClaims1795459774518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "speaker_email_claims" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_421815f8f8d57f9434d64f9d65b" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_16f9a8be02458e55d97c6be6d1d" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "kind" nvarchar(50) NOT NULL,
                "sessionGuid" nvarchar(255) NOT NULL,
                "speakerGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_89589bdf2f48cc6bfeaf1402815" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_email_claims"
            ADD CONSTRAINT "FK_f7f5c23db43b58e770fe018b891" FOREIGN KEY ("sessionGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_email_claims"
            ADD CONSTRAINT "FK_63809ba5ab900a731f06de53d27" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            INSERT INTO "speaker_email_claims" ("updated", "created", "guid", "kind", "sessionGuid", "speakerGuid")
            SELECT "updated", "created", "guid", 'session-details', "sessionGuid", "speakerGuid" FROM "session_details_sends"
        `);
    await queryRunner.query(`
            DROP TABLE "session_details_sends"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // `session_details_sends` as AddSessionDetailsSends1795448491167 made it, with the session details email's rows.
    await queryRunner.query(`
            CREATE TABLE "session_details_sends" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_df0bb95f29152b8dd357d125b27" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_943b3a37c009cda7bcb0bbf810f" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "sessionGuid" nvarchar(255) NOT NULL,
                "speakerGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_ffb81a6d7a7527885d8c4e0eb0d" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "session_details_sends"
            ADD CONSTRAINT "FK_310c6c860562c18fa0014ef14b1" FOREIGN KEY ("sessionGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "session_details_sends"
            ADD CONSTRAINT "FK_74b6fb9f0335fd47220f6c1fdfa" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            INSERT INTO "session_details_sends" ("updated", "created", "guid", "sessionGuid", "speakerGuid")
            SELECT "updated", "created", "guid", "sessionGuid", "speakerGuid" FROM "speaker_email_claims" WHERE "kind" = 'session-details'
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_email_claims" DROP CONSTRAINT "FK_63809ba5ab900a731f06de53d27"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_email_claims" DROP CONSTRAINT "FK_f7f5c23db43b58e770fe018b891"
        `);
    await queryRunner.query(`
            DROP TABLE "speaker_email_claims"
        `);
  }
}
