import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ticks **Sessions Filter** on each past season's organizations that hosted at least one of that season's sessions
 * (#1836). Since #1826 a Sessions page's Organizations filter lists only the season's organizations with it ticked, and
 * the setting was new, so every past year's filter said "There are no organizations." Each season has its own copies of
 * its organizations, so ticking this year's in Admin never reached them. The current season is left alone: its
 * organizations are ticked by hand. An organization with no sessions that year stays unticked, so the filter offers only
 * choices that return sessions.
 *
 * `sessions_filter_backfill` records each organization it ticked, with its settings before and after, so `down()` puts
 * back only what this changed: an organization edited in Admin since keeps its edit. The API never reads that table; a
 * later migration can drop it once no rollback past this one is wanted.
 */
export class TickPastSessionsFilters1795477533912 implements MigrationInterface {
  name = 'TickPastSessionsFilters1795477533912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "sessions_filter_backfill" (
                "placeGuid" nvarchar(255) NOT NULL,
                "before" nvarchar(max),
                "after" nvarchar(max) NOT NULL,
                CONSTRAINT "PK_sessions_filter_backfill" PRIMARY KEY ("placeGuid")
            )
        `);
    // Settings are a JSON list as `simple-json` writes it (`["header","footer"]`), or empty. The tick goes on the end of
    // the list; anything that is not a list is left as it is. Plain string operations, which cannot fail on an odd value.
    await queryRunner.query(`
            INSERT INTO "sessions_filter_backfill" ("placeGuid", "before", "after")
            SELECT "p"."guid", "v"."before",
                   CASE WHEN "v"."list" = N'[]' THEN N'["sessions-filter"]'
                        ELSE LEFT("v"."list", LEN("v"."list") - 1) + N',"sessions-filter"]' END
            FROM "places" "p"
            INNER JOIN "seasons" "s" ON "s"."guid" = "p"."seasonGuid"
            CROSS APPLY (
                SELECT CAST("p"."visibilitySettings" AS nvarchar(max)) AS "before",
                       LTRIM(RTRIM(COALESCE(NULLIF(CAST("p"."visibilitySettings" AS nvarchar(max)), N''), N'[]'))) AS "list"
            ) "v"
            WHERE "s"."year" < (SELECT MAX("year") FROM "seasons" WHERE "active" = 1)
              AND "v"."list" LIKE N'[[]%]'
              AND "v"."list" NOT LIKE N'%"sessions-filter"%'
              AND EXISTS (
                SELECT 1
                FROM "events" "e"
                INNER JOIN "event_location" "l" ON "l"."guid" = "e"."locationGuid"
                WHERE "l"."placeGuid" = "p"."guid" AND "e"."seasonGuid" = "s"."guid"
              )
        `);
    await queryRunner.query(`
            UPDATE "p" SET "visibilitySettings" = "b"."after"
            FROM "places" "p"
            INNER JOIN "sessions_filter_backfill" "b" ON "b"."placeGuid" = "p"."guid"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "p" SET "visibilitySettings" = "b"."before"
            FROM "places" "p"
            INNER JOIN "sessions_filter_backfill" "b" ON "b"."placeGuid" = "p"."guid"
            WHERE CAST("p"."visibilitySettings" AS nvarchar(max)) = "b"."after"
        `);
    await queryRunner.query(`
            DROP TABLE "sessions_filter_backfill"
        `);
  }
}
