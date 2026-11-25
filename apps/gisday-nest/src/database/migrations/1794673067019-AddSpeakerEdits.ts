import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpeakerEdits1794673067019 implements MigrationInterface {
  name = 'AddSpeakerEdits1794673067019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "speaker_edit_links" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_f138961483a1f0f2332a26fe20b" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_e4555b307c44cc812438b28ca1f" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "tokenHash" nvarchar(64) NOT NULL,
                "expires" datetimeoffset NOT NULL,
                "sentTo" nvarchar(255),
                "speakerGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_22912a0a5c6180fadd8e1cdbca9" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "speaker_edits" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_608b299e5cce5c4d1627bfee80a" DEFAULT SYSDATETIMEOFFSET(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_63655a635057c7746d99eb4cb79" DEFAULT SYSDATETIMEOFFSET(),
                "guid" nvarchar(255) NOT NULL,
                "description" nvarchar(MAX),
                "affiliation" nvarchar(255),
                "socialMedia" nvarchar(255),
                "photoPath" nvarchar(255),
                "status" nvarchar(255) NOT NULL CONSTRAINT "DF_2bceff90feb4e5c8a4a3020bfdd" DEFAULT 'pending',
                "reviewedAt" datetimeoffset,
                "reviewedBy" nvarchar(255),
                "speakerGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_4ce6b0224cf2068bc9bde995df8" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edit_links"
            ADD CONSTRAINT "FK_4c951e4b146919c0fc245f5d1cd" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edits"
            ADD CONSTRAINT "FK_8a00b0455b193b1fd9ca5aa99c1" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "speaker_edits" DROP CONSTRAINT "FK_8a00b0455b193b1fd9ca5aa99c1"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_edit_links" DROP CONSTRAINT "FK_4c951e4b146919c0fc245f5d1cd"
        `);
    await queryRunner.query(`
            DROP TABLE "speaker_edits"
        `);
    await queryRunner.query(`
            DROP TABLE "speaker_edit_links"
        `);
  }
}
