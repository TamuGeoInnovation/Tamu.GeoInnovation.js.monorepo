import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Changes the default of all 68 `created` and `updated` columns from getdate() to SYSDATETIMEOFFSET() (#2584).
 *
 * getdate() is the database server's local time with no offset, and a datetimeoffset column stores it as +00:00. Production's
 * server runs in Central time, so every time GIS Day stored read 5 or 6 hours early, and VGI scoring's window would have
 * opened 6 hours late. SYSDATETIMEOFFSET() carries the server's real offset. An update's `updated` is set by the API's
 * UpdatedTimeSubscriber, not by a default.
 *
 * Times already stored are left as they are (decided 30 October 2026). It changes only defaults, so the API before this
 * change keeps working once it has run. The `ALTER COLUMN` before each table's constraints is typeorm's and changes nothing:
 * the column stays `datetimeoffset NOT NULL`.
 */
export class TrueInstantTimestamps1794519532622 implements MigrationInterface {
  name = 'TrueInstantTimestamps1794519532622';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP CONSTRAINT "DF_78e901c49ef033c138e7c47bd89"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD CONSTRAINT "DF_78e901c49ef033c138e7c47bd89" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP CONSTRAINT "DF_08ead5c96b08409df2821504c55"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD CONSTRAINT "DF_08ead5c96b08409df2821504c55" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days" DROP CONSTRAINT "DF_aa4c8edd9d8077f66bf4b35b4cb"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ADD CONSTRAINT "DF_aa4c8edd9d8077f66bf4b35b4cb" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days" DROP CONSTRAINT "DF_05805269370ce5b805a4c332c42"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ADD CONSTRAINT "DF_05805269370ce5b805a4c332c42" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "DF_3e8ebd3485b38f8c4541027e0d6"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "DF_3e8ebd3485b38f8c4541027e0d6" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "DF_7de5f9cc6b790136e0bcf8dcd6e"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "DF_7de5f9cc6b790136e0bcf8dcd6e" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "DF_a94a41c5211c1879c48255cd2f7"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "DF_a94a41c5211c1879c48255cd2f7" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "DF_2ba45487657291d45bde74dc167"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "DF_2ba45487657291d45bde74dc167" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "DF_9cf769a883d06e54f62cf4f8ac1"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "DF_9cf769a883d06e54f62cf4f8ac1" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "DF_17b47b49c26d0d591c4a00de77d"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "DF_17b47b49c26d0d591c4a00de77d" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_3468bc182f7fbc66f4c6269654f"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "DF_3468bc182f7fbc66f4c6269654f" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_c3a20180b255ed53fe4564278a1"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "DF_c3a20180b255ed53fe4564278a1" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types" DROP CONSTRAINT "DF_226d529d540c78dba8f1991bb7c"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ADD CONSTRAINT "DF_226d529d540c78dba8f1991bb7c" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types" DROP CONSTRAINT "DF_145204633a10b1a29b3a0a2a421"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ADD CONSTRAINT "DF_145204633a10b1a29b3a0a2a421" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "DF_077446574ac8385f8b6c3b804e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "DF_077446574ac8385f8b6c3b804e2" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "DF_1b359112dafb4c5871d0db83105"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "DF_1b359112dafb4c5871d0db83105" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "DF_d712ce56fa0cd06f762baa63980"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "DF_d712ce56fa0cd06f762baa63980" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions" DROP CONSTRAINT "DF_187aefb6965ce15d635baed7ec8"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ADD CONSTRAINT "DF_187aefb6965ce15d635baed7ec8" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions" DROP CONSTRAINT "DF_589d997463c603d55e1836afc40"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ADD CONSTRAINT "DF_589d997463c603d55e1836afc40" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "DF_d60ed5425beaedfb52ab98d2712"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "DF_d60ed5425beaedfb52ab98d2712" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "DF_a78ad70c9509377722a3a24d94c"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "DF_a78ad70c9509377722a3a24d94c" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "universities" DROP CONSTRAINT "DF_b031d382703d65ac6a94fa97758"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ADD CONSTRAINT "DF_b031d382703d65ac6a94fa97758" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities" DROP CONSTRAINT "DF_a32146af3e304f7219b37434618"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ADD CONSTRAINT "DF_a32146af3e304f7219b37434618" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles" DROP CONSTRAINT "DF_f471493724b07120fa651e126ac"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ADD CONSTRAINT "DF_f471493724b07120fa651e126ac" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles" DROP CONSTRAINT "DF_ba270d835bb80f5762e5cd7836a"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ADD CONSTRAINT "DF_ba270d835bb80f5762e5cd7836a" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "DF_73fe5cd2b678343e23520ff86d9"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "DF_73fe5cd2b678343e23520ff86d9" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "DF_cadcc7ff4308285eb7a2decb399"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "DF_cadcc7ff4308285eb7a2decb399" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links" DROP CONSTRAINT "DF_c57387c911ec44e98708e0412f0"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ADD CONSTRAINT "DF_c57387c911ec44e98708e0412f0" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links" DROP CONSTRAINT "DF_795a2a10a158c4d4269ff8dfc6a"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ADD CONSTRAINT "DF_795a2a10a158c4d4269ff8dfc6a" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "DF_7aa56e8fb0eebed843dfb515184"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "DF_7aa56e8fb0eebed843dfb515184" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "DF_9c410a212981210c463acbea5ad"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "DF_9c410a212981210c463acbea5ad" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "DF_04e1f946bc46b1006ea61d3cf7b"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "DF_04e1f946bc46b1006ea61d3cf7b" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "DF_07fc732975f0882cfd24adfd2e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "DF_07fc732975f0882cfd24adfd2e6" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_eeb72a760a16aa3cfba34909b41"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD CONSTRAINT "DF_eeb72a760a16aa3cfba34909b41" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_b42c10529e54c6fc7db7606a5e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD CONSTRAINT "DF_b42c10529e54c6fc7db7606a5e5" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "DF_c39763a0dcd6299c93ce7501bdc"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "DF_c39763a0dcd6299c93ce7501bdc" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "DF_b12d5945595f596567a49a51dcd"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "DF_b12d5945595f596567a49a51dcd" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_26abf73313abfbc5c05ef601a37"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD CONSTRAINT "DF_26abf73313abfbc5c05ef601a37" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_530df9f24afe0a0307f1f728d15"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD CONSTRAINT "DF_530df9f24afe0a0307f1f728d15" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "DF_a3bc316f3db882afc3cb42ffe69"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "DF_a3bc316f3db882afc3cb42ffe69" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "DF_5e0a4f3cc617964ed9f5b2d7b07"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "DF_5e0a4f3cc617964ed9f5b2d7b07" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "DF_d09a34f9024cf8108cf46d76cfc"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "DF_d09a34f9024cf8108cf46d76cfc" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "DF_1b672b4195d49938cf8bc824dd2"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "DF_1b672b4195d49938cf8bc824dd2" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types" DROP CONSTRAINT "DF_4fe3627437c35c73144af4b02b1"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ADD CONSTRAINT "DF_4fe3627437c35c73144af4b02b1" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types" DROP CONSTRAINT "DF_636d89f381cd66bfaa617a0d70d"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ADD CONSTRAINT "DF_636d89f381cd66bfaa617a0d70d" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types" DROP CONSTRAINT "DF_2f889d86048bba1f16464f5dd66"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ADD CONSTRAINT "DF_2f889d86048bba1f16464f5dd66" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types" DROP CONSTRAINT "DF_1ca4c50112c3fcafb36331761f1"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ADD CONSTRAINT "DF_1ca4c50112c3fcafb36331761f1" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info" DROP CONSTRAINT "DF_6bfa468eef3da7281637161c0cc"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ADD CONSTRAINT "DF_6bfa468eef3da7281637161c0cc" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info" DROP CONSTRAINT "DF_8ef9b8bafde1921967f03d1a580"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ADD CONSTRAINT "DF_8ef9b8bafde1921967f03d1a580" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes" DROP CONSTRAINT "DF_7be56590503c24f808932726350"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ADD CONSTRAINT "DF_7be56590503c24f808932726350" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes" DROP CONSTRAINT "DF_983ffc608a42fee9b0e1c1abee7"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ADD CONSTRAINT "DF_983ffc608a42fee9b0e1c1abee7" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "DF_8d6a8b4d48dc9d465a555b73673"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "DF_8d6a8b4d48dc9d465a555b73673" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "DF_8ed8fcb0008f591e301edf701e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "DF_8ed8fcb0008f591e301edf701e1" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions" DROP CONSTRAINT "DF_37914215c7cd6cd4f9aebc275f7"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ADD CONSTRAINT "DF_37914215c7cd6cd4f9aebc275f7" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions" DROP CONSTRAINT "DF_13749aca935fbece1687799e040"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ADD CONSTRAINT "DF_13749aca935fbece1687799e040" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations" DROP CONSTRAINT "DF_6f81210dfc70ae6e61c0e24f78c"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ADD CONSTRAINT "DF_6f81210dfc70ae6e61c0e24f78c" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations" DROP CONSTRAINT "DF_9c8e2cc959a1db921f0fd3fdceb"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ADD CONSTRAINT "DF_9c8e2cc959a1db921f0fd3fdceb" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms" DROP CONSTRAINT "DF_d1b717f3ee8b127600c769b2cb0"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ADD CONSTRAINT "DF_d1b717f3ee8b127600c769b2cb0" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms" DROP CONSTRAINT "DF_12fe7f9c5303f0efaa17123a5be"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ADD CONSTRAINT "DF_12fe7f9c5303f0efaa17123a5be" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "DF_97a136bbed16ce337837de6354c"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "DF_97a136bbed16ce337837de6354c" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "DF_f067677042ca7ca2b6ab1fc4ac7"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "DF_f067677042ca7ca2b6ab1fc4ac7" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status" DROP CONSTRAINT "DF_1df3b1aedb115e28f435fb8e140"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ADD CONSTRAINT "DF_1df3b1aedb115e28f435fb8e140" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status" DROP CONSTRAINT "DF_05c757d522e80e6024b3ff5b59b"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ADD CONSTRAINT "DF_05c757d522e80e6024b3ff5b59b" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "DF_8597a7d5df5c29453bec8887f3e"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "DF_8597a7d5df5c29453bec8887f3e" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "DF_3266628ac3b01dabb5f26c72bb5"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "DF_3266628ac3b01dabb5f26c72bb5" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media" DROP CONSTRAINT "DF_5e4a237b79ada1bdec821ca3f3f"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ADD CONSTRAINT "DF_5e4a237b79ada1bdec821ca3f3f" DEFAULT SYSDATETIMEOFFSET() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media" DROP CONSTRAINT "DF_bef61cca331826edfafc8605f4d"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ADD CONSTRAINT "DF_bef61cca331826edfafc8605f4d" DEFAULT SYSDATETIMEOFFSET() FOR "created"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media" DROP CONSTRAINT "DF_bef61cca331826edfafc8605f4d"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ADD CONSTRAINT "DF_bef61cca331826edfafc8605f4d" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media" DROP CONSTRAINT "DF_5e4a237b79ada1bdec821ca3f3f"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ADD CONSTRAINT "DF_5e4a237b79ada1bdec821ca3f3f" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "DF_3266628ac3b01dabb5f26c72bb5"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "DF_3266628ac3b01dabb5f26c72bb5" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "DF_8597a7d5df5c29453bec8887f3e"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "DF_8597a7d5df5c29453bec8887f3e" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status" DROP CONSTRAINT "DF_05c757d522e80e6024b3ff5b59b"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ADD CONSTRAINT "DF_05c757d522e80e6024b3ff5b59b" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status" DROP CONSTRAINT "DF_1df3b1aedb115e28f435fb8e140"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ADD CONSTRAINT "DF_1df3b1aedb115e28f435fb8e140" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submission_validation_status"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "DF_f067677042ca7ca2b6ab1fc4ac7"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "DF_f067677042ca7ca2b6ab1fc4ac7" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "DF_97a136bbed16ce337837de6354c"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "DF_97a136bbed16ce337837de6354c" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms" DROP CONSTRAINT "DF_12fe7f9c5303f0efaa17123a5be"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ADD CONSTRAINT "DF_12fe7f9c5303f0efaa17123a5be" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms" DROP CONSTRAINT "DF_d1b717f3ee8b127600c769b2cb0"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ADD CONSTRAINT "DF_d1b717f3ee8b127600c769b2cb0" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_forms"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations" DROP CONSTRAINT "DF_9c8e2cc959a1db921f0fd3fdceb"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ADD CONSTRAINT "DF_9c8e2cc959a1db921f0fd3fdceb" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations" DROP CONSTRAINT "DF_6f81210dfc70ae6e61c0e24f78c"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ADD CONSTRAINT "DF_6f81210dfc70ae6e61c0e24f78c" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_locations"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions" DROP CONSTRAINT "DF_13749aca935fbece1687799e040"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ADD CONSTRAINT "DF_13749aca935fbece1687799e040" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions" DROP CONSTRAINT "DF_37914215c7cd6cd4f9aebc275f7"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ADD CONSTRAINT "DF_37914215c7cd6cd4f9aebc275f7" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "DF_8ed8fcb0008f591e301edf701e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "DF_8ed8fcb0008f591e301edf701e1" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "DF_8d6a8b4d48dc9d465a555b73673"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "DF_8d6a8b4d48dc9d465a555b73673" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes" DROP CONSTRAINT "DF_983ffc608a42fee9b0e1c1abee7"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ADD CONSTRAINT "DF_983ffc608a42fee9b0e1c1abee7" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes" DROP CONSTRAINT "DF_7be56590503c24f808932726350"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ADD CONSTRAINT "DF_7be56590503c24f808932726350" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info" DROP CONSTRAINT "DF_8ef9b8bafde1921967f03d1a580"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ADD CONSTRAINT "DF_8ef9b8bafde1921967f03d1a580" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info" DROP CONSTRAINT "DF_6bfa468eef3da7281637161c0cc"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ADD CONSTRAINT "DF_6bfa468eef3da7281637161c0cc" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_info"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types" DROP CONSTRAINT "DF_1ca4c50112c3fcafb36331761f1"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ADD CONSTRAINT "DF_1ca4c50112c3fcafb36331761f1" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types" DROP CONSTRAINT "DF_2f889d86048bba1f16464f5dd66"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ADD CONSTRAINT "DF_2f889d86048bba1f16464f5dd66" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "rsvp_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types" DROP CONSTRAINT "DF_636d89f381cd66bfaa617a0d70d"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ADD CONSTRAINT "DF_636d89f381cd66bfaa617a0d70d" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types" DROP CONSTRAINT "DF_4fe3627437c35c73144af4b02b1"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ADD CONSTRAINT "DF_4fe3627437c35c73144af4b02b1" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "submission_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "DF_1b672b4195d49938cf8bc824dd2"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "DF_1b672b4195d49938cf8bc824dd2" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "DF_d09a34f9024cf8108cf46d76cfc"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "DF_d09a34f9024cf8108cf46d76cfc" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "DF_5e0a4f3cc617964ed9f5b2d7b07"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "DF_5e0a4f3cc617964ed9f5b2d7b07" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "DF_a3bc316f3db882afc3cb42ffe69"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "DF_a3bc316f3db882afc3cb42ffe69" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_530df9f24afe0a0307f1f728d15"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD CONSTRAINT "DF_530df9f24afe0a0307f1f728d15" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "DF_26abf73313abfbc5c05ef601a37"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD CONSTRAINT "DF_26abf73313abfbc5c05ef601a37" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "DF_b12d5945595f596567a49a51dcd"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "DF_b12d5945595f596567a49a51dcd" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "DF_c39763a0dcd6299c93ce7501bdc"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "DF_c39763a0dcd6299c93ce7501bdc" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_b42c10529e54c6fc7db7606a5e5"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD CONSTRAINT "DF_b42c10529e54c6fc7db7606a5e5" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "DF_eeb72a760a16aa3cfba34909b41"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD CONSTRAINT "DF_eeb72a760a16aa3cfba34909b41" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "DF_07fc732975f0882cfd24adfd2e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "DF_07fc732975f0882cfd24adfd2e6" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "DF_04e1f946bc46b1006ea61d3cf7b"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "DF_04e1f946bc46b1006ea61d3cf7b" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "DF_9c410a212981210c463acbea5ad"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "DF_9c410a212981210c463acbea5ad" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "DF_7aa56e8fb0eebed843dfb515184"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "DF_7aa56e8fb0eebed843dfb515184" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links" DROP CONSTRAINT "DF_795a2a10a158c4d4269ff8dfc6a"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ADD CONSTRAINT "DF_795a2a10a158c4d4269ff8dfc6a" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links" DROP CONSTRAINT "DF_c57387c911ec44e98708e0412f0"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ADD CONSTRAINT "DF_c57387c911ec44e98708e0412f0" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "DF_cadcc7ff4308285eb7a2decb399"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "DF_cadcc7ff4308285eb7a2decb399" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "DF_73fe5cd2b678343e23520ff86d9"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "DF_73fe5cd2b678343e23520ff86d9" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles" DROP CONSTRAINT "DF_ba270d835bb80f5762e5cd7836a"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ADD CONSTRAINT "DF_ba270d835bb80f5762e5cd7836a" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles" DROP CONSTRAINT "DF_f471493724b07120fa651e126ac"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ADD CONSTRAINT "DF_f471493724b07120fa651e126ac" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "speaker_roles"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "universities" DROP CONSTRAINT "DF_a32146af3e304f7219b37434618"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ADD CONSTRAINT "DF_a32146af3e304f7219b37434618" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities" DROP CONSTRAINT "DF_b031d382703d65ac6a94fa97758"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ADD CONSTRAINT "DF_b031d382703d65ac6a94fa97758" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "DF_a78ad70c9509377722a3a24d94c"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "DF_a78ad70c9509377722a3a24d94c" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "DF_d60ed5425beaedfb52ab98d2712"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "DF_d60ed5425beaedfb52ab98d2712" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions" DROP CONSTRAINT "DF_589d997463c603d55e1836afc40"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ADD CONSTRAINT "DF_589d997463c603d55e1836afc40" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions" DROP CONSTRAINT "DF_187aefb6965ce15d635baed7ec8"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ADD CONSTRAINT "DF_187aefb6965ce15d635baed7ec8" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "DF_d712ce56fa0cd06f762baa63980"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "DF_d712ce56fa0cd06f762baa63980" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "DF_1b359112dafb4c5871d0db83105"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "DF_1b359112dafb4c5871d0db83105" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "DF_077446574ac8385f8b6c3b804e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "DF_077446574ac8385f8b6c3b804e2" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types" DROP CONSTRAINT "DF_145204633a10b1a29b3a0a2a421"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ADD CONSTRAINT "DF_145204633a10b1a29b3a0a2a421" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types" DROP CONSTRAINT "DF_226d529d540c78dba8f1991bb7c"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ADD CONSTRAINT "DF_226d529d540c78dba8f1991bb7c" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "question_types"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_c3a20180b255ed53fe4564278a1"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "DF_c3a20180b255ed53fe4564278a1" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "DF_3468bc182f7fbc66f4c6269654f"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "DF_3468bc182f7fbc66f4c6269654f" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "DF_17b47b49c26d0d591c4a00de77d"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "DF_17b47b49c26d0d591c4a00de77d" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "DF_9cf769a883d06e54f62cf4f8ac1"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "DF_9cf769a883d06e54f62cf4f8ac1" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "DF_2ba45487657291d45bde74dc167"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "DF_2ba45487657291d45bde74dc167" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "DF_a94a41c5211c1879c48255cd2f7"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "DF_a94a41c5211c1879c48255cd2f7" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "DF_7de5f9cc6b790136e0bcf8dcd6e"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "DF_7de5f9cc6b790136e0bcf8dcd6e" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "DF_3e8ebd3485b38f8c4541027e0d6"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "DF_3e8ebd3485b38f8c4541027e0d6" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days" DROP CONSTRAINT "DF_05805269370ce5b805a4c332c42"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ADD CONSTRAINT "DF_05805269370ce5b805a4c332c42" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days" DROP CONSTRAINT "DF_aa4c8edd9d8077f66bf4b35b4cb"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ADD CONSTRAINT "DF_aa4c8edd9d8077f66bf4b35b4cb" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP CONSTRAINT "DF_08ead5c96b08409df2821504c55"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD CONSTRAINT "DF_08ead5c96b08409df2821504c55" DEFAULT getdate() FOR "created"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons" DROP CONSTRAINT "DF_78e901c49ef033c138e7c47bd89"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ADD CONSTRAINT "DF_78e901c49ef033c138e7c47bd89" DEFAULT getdate() FOR "updated"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons"
            ALTER COLUMN "updated" datetimeoffset NOT NULL
        `);
  }
}
