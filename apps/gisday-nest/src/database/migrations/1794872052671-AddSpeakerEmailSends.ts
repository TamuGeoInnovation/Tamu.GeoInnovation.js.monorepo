import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The record of every email the site sends a speaker (#3167): one row per copy, kept with the speaker. Only adds a table,
 * so the image before it keeps working against it.
 */
export class AddSpeakerEmailSends1794872052671 implements MigrationInterface {
  name = 'AddSpeakerEmailSends1794872052671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "speaker_email_sends" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_708388d7441afbb2efea72bb07e" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_64098639b04a554f07d5b9e724b" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "kind" nvarchar(50) NOT NULL,
                "eventGuid" nvarchar(36),
                "sentTo" nvarchar(255),
                "sentFrom" nvarchar(255),
                "speakerGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_798c48a280d889547674a45744d" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_email_sends"
            ADD CONSTRAINT "FK_4838970f8f5b041624d64496633" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speaker_email_sends" DROP CONSTRAINT "FK_4838970f8f5b041624d64496633"
        `);
    await queryRunner.query(`
            DROP TABLE "speaker_email_sends"
        `);
  }
}
