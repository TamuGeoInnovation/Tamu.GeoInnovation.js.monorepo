import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Drops `session_details_sends` (#3269), the session details email's first repeat guard (#3098). #3260 moved every
 * session speaker email's guard into `speaker_email_claims`, copied this table's rows there, and left it in place for
 * the API before it (`sha-0ed1449`), the last that reads it. Production's rollback targets are now past that
 * (`sha-083a162` and later, which never read it), so this is the contract half of #3260's expand and contract.
 *
 * `down()` puts the table back as AddSessionDetailsSends1795448491167 made it, empty: nothing reads it, so there is
 * nothing to restore into it. Dated after TickPastSessionsFilters1795477533912 (#1836), which production has.
 */
export class DropSessionDetailsSends1795489415122 implements MigrationInterface {
  name = 'DropSessionDetailsSends1795489415122';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
}
