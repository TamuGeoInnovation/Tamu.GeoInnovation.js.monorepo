import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `session_details_sends`, the session details email's repeat guard (#3098): a row for each speaker sent a
 * session's details, recorded before the email goes, so every copy of the API catches a repeated send. Empty when
 * created; a session's or a speaker's rows go with it. It only adds, so the API before this change keeps working once
 * it has run. Dated after AddSeasonWinners1795444106838 (#3239), which production has.
 */
export class AddSessionDetailsSends1795448491167 implements MigrationInterface {
  name = 'AddSessionDetailsSends1795448491167';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session_details_sends" DROP CONSTRAINT "FK_74b6fb9f0335fd47220f6c1fdfa"
        `);
    await queryRunner.query(`
            ALTER TABLE "session_details_sends" DROP CONSTRAINT "FK_310c6c860562c18fa0014ef14b1"
        `);
    await queryRunner.query(`
            DROP TABLE "session_details_sends"
        `);
  }
}
