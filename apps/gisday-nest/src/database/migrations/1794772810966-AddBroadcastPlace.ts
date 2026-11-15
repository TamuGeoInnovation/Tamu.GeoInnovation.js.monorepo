import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBroadcastPlace1794772810966 implements MigrationInterface {
  // The organization (place) a broadcast belongs to (#3048), so each site lists only its own. Empty for every broadcast
  // until kubernetes-config's set-broadcast-places.ps1 sets it from the sessions that use it. It only adds, so the API
  // before it keeps working; down drops the key and then the column, the reverse of up.
  name = 'AddBroadcastPlace1794772810966';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD "placeGuid" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "FK_6d07475cc5b10d1b5d7dc1aa889" FOREIGN KEY ("placeGuid") REFERENCES "places"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "FK_6d07475cc5b10d1b5d7dc1aa889"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP COLUMN "placeGuid"
        `);
  }
}
