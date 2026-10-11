import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791325939619 implements MigrationInterface {
  name = 'InitialSchema1791325939619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "seasons" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_78e901c49ef033c138e7c47bd89" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_08ead5c96b08409df2821504c55" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "year" int NOT NULL,
                "active" bit NOT NULL CONSTRAINT "DF_b0bf7c135e8d4e1e346ec48dbd7" DEFAULT 0,
                CONSTRAINT "PK_a9c31e51550cf4e1b970773df4c" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "seasons_days" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_aa4c8edd9d8077f66bf4b35b4cb" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_05805269370ce5b805a4c332c42" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "date" datetime NOT NULL,
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_e8ba4c5fc179e5a0327aea5c7f8" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "places" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_3e8ebd3485b38f8c4541027e0d6" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_7de5f9cc6b790136e0bcf8dcd6e" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "address" nvarchar(255),
                "city" nvarchar(255),
                "state" nvarchar(255),
                "zip" nvarchar(255),
                "website" nvarchar(255),
                "visibilitySettings" ntext,
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_8dd23061810352e52aa73ac4d44" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_broadcast" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_a94a41c5211c1879c48255cd2f7" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_2ba45487657291d45bde74dc167" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "presenterUrl" nvarchar(MAX),
                "password" nvarchar(255),
                "phoneNumber" nvarchar(255),
                "meetingId" nvarchar(255),
                "publicUrl" nvarchar(MAX),
                "details" nvarchar(MAX),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_d65deea58a466e5c7b1cc01e753" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_location" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_9cf769a883d06e54f62cf4f8ac1" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_17b47b49c26d0d591c4a00de77d" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "room" nvarchar(255),
                "building" nvarchar(255),
                "capacity" int,
                "link" nvarchar(255),
                "streetAddressOverride" nvarchar(255),
                "placeGuid" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_1fee4b01af25f9418f80e70afa3" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "events" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_3468bc182f7fbc66f4c6269654f" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_c3a20180b255ed53fe4564278a1" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "active" bit NOT NULL CONSTRAINT "DF_25fe0c0a5ab94eb54b4f0fb9101" DEFAULT 1,
                "abstract" nvarchar(MAX),
                "startTime" nvarchar(255),
                "endTime" nvarchar(255),
                "observedAttendeeStart" int CONSTRAINT "DF_109da83d29fa7967935a07571fd" DEFAULT 0,
                "observedAttendeeEnd" int CONSTRAINT "DF_6822ac63bdd9f619d4bb91300be" DEFAULT 0,
                "capacity" int,
                "resources" nvarchar(MAX),
                "requiresRsvp" bit,
                "qrCode" nvarchar(255),
                "mode" nvarchar(255),
                "eventType" nvarchar(255),
                "presentationType" nvarchar(255),
                "isAcceptingRsvps" bit CONSTRAINT "DF_9aef197e8577e5a2d7bf80f0ab6" DEFAULT 1,
                "isBringYourOwnDevice" bit CONSTRAINT "DF_b508fa9d0da26a7b749b91a7fad" DEFAULT 0,
                "requirements" nvarchar(MAX),
                "dayGuid" nvarchar(255),
                "seasonGuid" nvarchar(255),
                "broadcastGuid" nvarchar(255),
                "locationGuid" nvarchar(255),
                CONSTRAINT "PK_7e09558c929e3118e97ada33d09" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "question_types" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_226d529d540c78dba8f1991bb7c" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_145204633a10b1a29b3a0a2a421" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "type" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_68204bc7dba22f94bed034982f6" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "initial_survey_questions" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_077446574ac8385f8b6c3b804e2" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_1b359112dafb4c5871d0db83105" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "questionText" nvarchar(255),
                "questionOptions" nvarchar(255),
                "questionTypeGuid" nvarchar(255),
                CONSTRAINT "PK_2a0c75ffbf00e22caff50a71f7a" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "initial_survey_responses" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_d712ce56fa0cd06f762baa63980" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_dfc6c151ab1a4a562cebf77ea46" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255) NOT NULL,
                "responseValue" nvarchar(255) NOT NULL,
                "seasonGuid" nvarchar(255),
                "questionGuid" nvarchar(255),
                CONSTRAINT "PK_294952681cab1a104c07c0a6315" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_rating_questions" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_187aefb6965ce15d635baed7ec8" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_589d997463c603d55e1836afc40" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "userEditable" bit,
                "type" nvarchar(255),
                "text" nvarchar(255),
                "options" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_a286e8d0dc82e31121faab89cbc" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_rating_responses" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_d60ed5425beaedfb52ab98d2712" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_a78ad70c9509377722a3a24d94c" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "response" nvarchar(MAX),
                "eventGuid" nvarchar(255),
                "questionGuid" nvarchar(255),
                CONSTRAINT "PK_7df9060df2aee2b817434e0af69" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "universities" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_b031d382703d65ac6a94fa97758" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_a32146af3e304f7219b37434618" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "acronym" nvarchar(255),
                "hexTriplet" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_bc205420cc24f9f6282cb62c31e" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "speaker_roles" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_f471493724b07120fa651e126ac" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_ba270d835bb80f5762e5cd7836a" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_7312bf529b925231ec937236bac" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "organizations" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_73fe5cd2b678343e23520ff86d9" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_cadcc7ff4308285eb7a2decb399" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "acronym" nvarchar(255),
                "website" nvarchar(255),
                "text" nvarchar(MAX),
                "contactFirstName" nvarchar(255),
                "contactLastName" nvarchar(255),
                "contactEmail" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_45ffcbbcdd575a3aec9210815d0" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "place_links" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_c57387c911ec44e98708e0412f0" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_795a2a10a158c4d4269ff8dfc6a" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "label" nvarchar(255) NOT NULL,
                "url" nvarchar(255) NOT NULL,
                "placeGuid" nvarchar(255),
                CONSTRAINT "PK_493f9e48ff13d9de52219636e71" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "speakers" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_7aa56e8fb0eebed843dfb515184" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_9c410a212981210c463acbea5ad" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "firstName" nvarchar(255),
                "lastName" nvarchar(255),
                "email" nvarchar(255),
                "isActive" bit,
                "isOrganizer" bit CONSTRAINT "DF_c8fcb9104991075a7fb33fe066d" DEFAULT 0,
                "graduationYear" nvarchar(255),
                "degree" nvarchar(255),
                "program" nvarchar(255),
                "affiliation" nvarchar(255),
                "description" nvarchar(MAX),
                "socialMedia" nvarchar(255),
                "accountGuid" nvarchar(255),
                "seasonGuid" nvarchar(255),
                "organizationGuid" nvarchar(255),
                "universityGuid" nvarchar(255),
                CONSTRAINT "PK_d939a0d5f66f0a15d87f6f93a16" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "tags" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_04e1f946bc46b1006ea61d3cf7b" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_07fc732975f0882cfd24adfd2e6" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255) NOT NULL,
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_e1b32038b952d75fff17642861b" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "sponsors" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_eeb72a760a16aa3cfba34909b41" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_b42c10529e54c6fc7db7606a5e5" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "website" nvarchar(255),
                "contactFirstName" nvarchar(255),
                "contactLastName" nvarchar(255),
                "contactEmail" nvarchar(255),
                "description" nvarchar(MAX),
                "sponsorshipLevel" nvarchar(255),
                "sponsorshipAmount" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_97743baff15346289270f0ea7f9" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "assets" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_c39763a0dcd6299c93ce7501bdc" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_b12d5945595f596567a49a51dcd" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "name" nvarchar(255),
                "path" nvarchar(255),
                "type" nvarchar(255),
                "placesGuid" nvarchar(255),
                "organizationGuid" nvarchar(255),
                "speakerGuid" nvarchar(255),
                "sponsorGuid" nvarchar(255),
                CONSTRAINT "PK_84c13af62be90e9c5c28f5cdb01" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "checkins" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_26abf73313abfbc5c05ef601a37" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_530df9f24afe0a0307f1f728d15" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255) NOT NULL,
                "eventGuid" nvarchar(255),
                CONSTRAINT "PK_f29481bf76532769df10d70dcf5" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "classes" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_a3bc316f3db882afc3cb42ffe69" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_5e0a4f3cc617964ed9f5b2d7b07" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "professorName" nvarchar(255),
                "title" nvarchar(255),
                "code" nvarchar(255),
                "number" nvarchar(255),
                "section" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_9312991adc95daef8ec442352b4" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "course_credits" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_d09a34f9024cf8108cf46d76cfc" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_1b672b4195d49938cf8bc824dd2" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "eventGuid" nvarchar(255),
                "classGuid" nvarchar(255),
                CONSTRAINT "PK_14895fde1485100eae1545b3972" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "submission_types" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_4fe3627437c35c73144af4b02b1" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_636d89f381cd66bfaa617a0d70d" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "type" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_7de478a40312943968460bab7ba" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "rsvp_types" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_2f889d86048bba1f16464f5dd66" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_1ca4c50112c3fcafb36331761f1" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "type" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_fe1c44dde128181eb97faf32b03" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user_info" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_6bfa468eef3da7281637161c0cc" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_8ef9b8bafde1921967f03d1a580" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255),
                "uin" nvarchar(255),
                "fieldOfStudy" nvarchar(255),
                "classification" nvarchar(255),
                "participantType" nvarchar(255),
                "hasCompletedInitialSurvey" nvarchar(255),
                CONSTRAINT "PK_5df76d2068d6297226cfc0b9d85" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user_classes" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_7be56590503c24f808932726350" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_983ffc608a42fee9b0e1c1abee7" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255) NOT NULL,
                "classGuid" nvarchar(255),
                CONSTRAINT "PK_e90c30eb2cb543afe53b827b93e" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user_rsvps" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_8d6a8b4d48dc9d465a555b73673" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_8ed8fcb0008f591e301edf701e1" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255) NOT NULL,
                "eventGuid" nvarchar(255),
                "rsvpTypeGuid" nvarchar(255),
                CONSTRAINT "PK_1cd57ced5dca396de040e1268a7" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "submissions" (
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_37914215c7cd6cd4f9aebc275f7" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_13749aca935fbece1687799e040" DEFAULT getdate(),
                "guid" nvarchar(255) NOT NULL,
                "accountGuid" nvarchar(255),
                "title" nvarchar(255),
                "participants" ntext,
                "abstract" nvarchar(MAX),
                "link" nvarchar(MAX),
                "reviewed" bit NOT NULL CONSTRAINT "DF_eb688c1fc1ab0731a474bcdd392" DEFAULT 0,
                "acceptance" bit NOT NULL CONSTRAINT "DF_308350ba28b71e1fd761699ac12" DEFAULT 0,
                "message" nvarchar(MAX),
                "format" nvarchar(255),
                "submissionType" nvarchar(255),
                "classificationType" nvarchar(255),
                "seasonGuid" nvarchar(255),
                CONSTRAINT "PK_cd0f25f475358c2727464cc9119" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_submissions_locations" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_6f81210dfc70ae6e61c0e24f78c" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_9c8e2cc959a1db921f0fd3fdceb" DEFAULT getdate(),
                "latitude" decimal(7, 5) NOT NULL,
                "longitude" decimal(8, 5) NOT NULL,
                "accuracy" decimal(5, 2) NOT NULL,
                "altitude" decimal(4, 2),
                "altitudeAccuracy" decimal(5, 2),
                "heading" decimal(5, 2),
                "speed" decimal(6, 3),
                CONSTRAINT "PK_1edde179b3706cab101087f08d9" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_forms" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_d1b717f3ee8b127600c769b2cb0" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_12fe7f9c5303f0efaa17123a5be" DEFAULT getdate(),
                "source" nvarchar(255) NOT NULL,
                "model" ntext NOT NULL,
                CONSTRAINT "PK_3c9ec196fc88362c3193d67335a" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_seasons" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_97a136bbed16ce337837de6354c" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_f067677042ca7ca2b6ab1fc4ac7" DEFAULT getdate(),
                "allowSubmissions" bit NOT NULL CONSTRAINT "DF_e7e5e13bcaefeea33d5b5364ef6" DEFAULT 0,
                "seasonGuid" nvarchar(255),
                "formGuid" nvarchar(255),
                CONSTRAINT "PK_467f03f4339ea920e3b6667298f" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "REL_494cb471d19f934c10497dfe34" ON "vgi_seasons" ("seasonGuid")
            WHERE "seasonGuid" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "REL_a05854386ac11c656bd195f0fb" ON "vgi_seasons" ("formGuid")
            WHERE "formGuid" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_submission_validation_status" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_1df3b1aedb115e28f435fb8e140" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_05c757d522e80e6024b3ff5b59b" DEFAULT getdate(),
                "status" nvarchar(255) NOT NULL CONSTRAINT "DF_e3022cccd527cc96581c7de6506" DEFAULT 'unverified',
                "verifiedBy" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_d983efe3f5c7b3a46c7235003f7" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_submissions" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_8597a7d5df5c29453bec8887f3e" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_3266628ac3b01dabb5f26c72bb5" DEFAULT getdate(),
                "userGuid" nvarchar(255) NOT NULL,
                "value" ntext NOT NULL,
                "locationGuid" nvarchar(255),
                "seasonGuid" nvarchar(255),
                "validationStatusGuid" nvarchar(255),
                CONSTRAINT "PK_5c690c0d79e67920bf4caff0207" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "REL_cdbdc0e5971e31489fb6cebe42" ON "vgi_submissions" ("locationGuid")
            WHERE "locationGuid" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "REL_3808be9ccac84ab841f73ced10" ON "vgi_submissions" ("validationStatusGuid")
            WHERE "validationStatusGuid" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "vgi_submissions_media" (
                "guid" nvarchar(255) NOT NULL,
                "updated" datetimeoffset NOT NULL CONSTRAINT "DF_5e4a237b79ada1bdec821ca3f3f" DEFAULT getdate(),
                "created" datetimeoffset NOT NULL CONSTRAINT "DF_bef61cca331826edfafc8605f4d" DEFAULT getdate(),
                "blob" image NOT NULL,
                "mimeType" nvarchar(32),
                "fieldName" nvarchar(255),
                "sha256" char(64),
                "submissionGuid" nvarchar(255),
                CONSTRAINT "PK_cbcd352223b56ff9230306cc2b9" PRIMARY KEY ("guid")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "event_speakers" (
                "eventsGuid" nvarchar(255) NOT NULL,
                "speakersGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_daf07514f5794d2dec5253af989" PRIMARY KEY ("eventsGuid", "speakersGuid")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a8cf1f8d863f3142f20629e253" ON "event_speakers" ("eventsGuid")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_da6264b5aae11469a43c994649" ON "event_speakers" ("speakersGuid")
        `);
    await queryRunner.query(`
            CREATE TABLE "event_tags" (
                "eventsGuid" nvarchar(255) NOT NULL,
                "tagsGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_43aabe28601c2ac290e7a9932ef" PRIMARY KEY ("eventsGuid", "tagsGuid")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_768d829ed77a67d070c20bdb20" ON "event_tags" ("eventsGuid")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_a84940a42e02485bd8e1f4b0e8" ON "event_tags" ("tagsGuid")
        `);
    await queryRunner.query(`
            CREATE TABLE "event_course_credits" (
                "eventsGuid" nvarchar(255) NOT NULL,
                "courseCreditsGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_f8a509cf670cab6c949aa0184f7" PRIMARY KEY ("eventsGuid", "courseCreditsGuid")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_596d2d806698b0ff11da26b575" ON "event_course_credits" ("eventsGuid")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_918ceb78768665f0de7f72e2ee" ON "event_course_credits" ("courseCreditsGuid")
        `);
    await queryRunner.query(`
            CREATE TABLE "event_sponsors" (
                "eventsGuid" nvarchar(255) NOT NULL,
                "sponsorsGuid" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_f5b79eba3f899b97fa8f1862a53" PRIMARY KEY ("eventsGuid", "sponsorsGuid")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_c40503cede9874e5ff92d5b3a1" ON "event_sponsors" ("eventsGuid")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_56100d0260aeda18e8d597b135" ON "event_sponsors" ("sponsorsGuid")
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days"
            ADD CONSTRAINT "FK_89530c0beae838ae03769e69664" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "FK_53822ce689ade14d1ff0b82d61d" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast"
            ADD CONSTRAINT "FK_1207ad09aea79f8a4d27687df46" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "FK_a66af099b6df9ae654403ed809b" FOREIGN KEY ("placeGuid") REFERENCES "places"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location"
            ADD CONSTRAINT "FK_d26912114e65ece5df50e1fb5e0" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_b767887bd8964046a2f3973e0e2" FOREIGN KEY ("dayGuid") REFERENCES "seasons_days"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_ad4838bf262a7794667597edb15" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_b89cdd8d7bb93277f515ef137ee" FOREIGN KEY ("broadcastGuid") REFERENCES "event_broadcast"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_47c7ff234efa88a11a9b1529d88" FOREIGN KEY ("locationGuid") REFERENCES "event_location"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions"
            ADD CONSTRAINT "FK_bbffec509ddf4b7fe93c5b0b5f2" FOREIGN KEY ("questionTypeGuid") REFERENCES "question_types"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "FK_461bb54e4f9f5e55b946e4b24c0" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses"
            ADD CONSTRAINT "FK_59ca4cfb5e8ee3b3a52bbd50e2b" FOREIGN KEY ("questionGuid") REFERENCES "initial_survey_questions"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions"
            ADD CONSTRAINT "FK_a5906ca3950e4c935b58677f7f8" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "FK_3f3d72a63353eda3a0a8c3c46d9" FOREIGN KEY ("eventGuid") REFERENCES "events"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses"
            ADD CONSTRAINT "FK_cf3b6defbb207b185c561329e54" FOREIGN KEY ("questionGuid") REFERENCES "event_rating_questions"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "universities"
            ADD CONSTRAINT "FK_f803d981c150d1767c17eb9f594" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations"
            ADD CONSTRAINT "FK_edf7b908b3162c9ca5a2b6a86e3" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links"
            ADD CONSTRAINT "FK_af29cce0b0d35e413e0ef5d3793" FOREIGN KEY ("placeGuid") REFERENCES "places"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "FK_fa45a2b5cb0b3010810649449ab" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "FK_291b1f8ad55a136607b68ea5ae8" FOREIGN KEY ("organizationGuid") REFERENCES "organizations"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers"
            ADD CONSTRAINT "FK_dbad7097c6721967143d689af2c" FOREIGN KEY ("universityGuid") REFERENCES "universities"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tags"
            ADD CONSTRAINT "FK_40309af226829221fae1c9628b6" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors"
            ADD CONSTRAINT "FK_7c9ea7488bdc8a37cef5579f580" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_62af2af5bd6ee5d50d0535e4d13" FOREIGN KEY ("placesGuid") REFERENCES "places"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_a8b7828e92cb83497748e05811e" FOREIGN KEY ("organizationGuid") REFERENCES "organizations"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_ef5ca4668688e705e59aa94888b" FOREIGN KEY ("speakerGuid") REFERENCES "speakers"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "FK_98821d8bf60cd7694ecaa84dc99" FOREIGN KEY ("sponsorGuid") REFERENCES "sponsors"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins"
            ADD CONSTRAINT "FK_0c0f7578a9af049f4bb4ea8b452" FOREIGN KEY ("eventGuid") REFERENCES "events"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "FK_7666fc35401442909d126c8fe75" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "FK_e78579285a0e67bbed5cede3cf9" FOREIGN KEY ("eventGuid") REFERENCES "events"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits"
            ADD CONSTRAINT "FK_3895e40ed736f7df5e02208d26e" FOREIGN KEY ("classGuid") REFERENCES "classes"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes"
            ADD CONSTRAINT "FK_f68669dca54687346d2cf45cb2d" FOREIGN KEY ("classGuid") REFERENCES "classes"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "FK_d49e5133e6b4d10ff7e37720086" FOREIGN KEY ("eventGuid") REFERENCES "events"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps"
            ADD CONSTRAINT "FK_7d217bda0c87b2f090890da84d0" FOREIGN KEY ("rsvpTypeGuid") REFERENCES "rsvp_types"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions"
            ADD CONSTRAINT "FK_be5180d034d1cc89f6b71f2d68e" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "FK_494cb471d19f934c10497dfe345" FOREIGN KEY ("seasonGuid") REFERENCES "seasons"("guid") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons"
            ADD CONSTRAINT "FK_a05854386ac11c656bd195f0fb8" FOREIGN KEY ("formGuid") REFERENCES "vgi_forms"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "FK_cdbdc0e5971e31489fb6cebe42f" FOREIGN KEY ("locationGuid") REFERENCES "vgi_submissions_locations"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "FK_9202a299237f9e50abb5857f0e8" FOREIGN KEY ("seasonGuid") REFERENCES "vgi_seasons"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions"
            ADD CONSTRAINT "FK_3808be9ccac84ab841f73ced101" FOREIGN KEY ("validationStatusGuid") REFERENCES "vgi_submission_validation_status"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media"
            ADD CONSTRAINT "FK_e5aa725502dd2a65dc6e5fc16c7" FOREIGN KEY ("submissionGuid") REFERENCES "vgi_submissions"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "event_speakers"
            ADD CONSTRAINT "FK_a8cf1f8d863f3142f20629e253a" FOREIGN KEY ("eventsGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_speakers"
            ADD CONSTRAINT "FK_da6264b5aae11469a43c994649d" FOREIGN KEY ("speakersGuid") REFERENCES "speakers"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_tags"
            ADD CONSTRAINT "FK_768d829ed77a67d070c20bdb208" FOREIGN KEY ("eventsGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_tags"
            ADD CONSTRAINT "FK_a84940a42e02485bd8e1f4b0e82" FOREIGN KEY ("tagsGuid") REFERENCES "tags"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_course_credits"
            ADD CONSTRAINT "FK_596d2d806698b0ff11da26b5751" FOREIGN KEY ("eventsGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_course_credits"
            ADD CONSTRAINT "FK_918ceb78768665f0de7f72e2ee2" FOREIGN KEY ("courseCreditsGuid") REFERENCES "course_credits"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_sponsors"
            ADD CONSTRAINT "FK_c40503cede9874e5ff92d5b3a1f" FOREIGN KEY ("eventsGuid") REFERENCES "events"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "event_sponsors"
            ADD CONSTRAINT "FK_56100d0260aeda18e8d597b1357" FOREIGN KEY ("sponsorsGuid") REFERENCES "sponsors"("guid") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "event_sponsors" DROP CONSTRAINT "FK_56100d0260aeda18e8d597b1357"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_sponsors" DROP CONSTRAINT "FK_c40503cede9874e5ff92d5b3a1f"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_course_credits" DROP CONSTRAINT "FK_918ceb78768665f0de7f72e2ee2"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_course_credits" DROP CONSTRAINT "FK_596d2d806698b0ff11da26b5751"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_tags" DROP CONSTRAINT "FK_a84940a42e02485bd8e1f4b0e82"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_tags" DROP CONSTRAINT "FK_768d829ed77a67d070c20bdb208"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_speakers" DROP CONSTRAINT "FK_da6264b5aae11469a43c994649d"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_speakers" DROP CONSTRAINT "FK_a8cf1f8d863f3142f20629e253a"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions_media" DROP CONSTRAINT "FK_e5aa725502dd2a65dc6e5fc16c7"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "FK_3808be9ccac84ab841f73ced101"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "FK_9202a299237f9e50abb5857f0e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_submissions" DROP CONSTRAINT "FK_cdbdc0e5971e31489fb6cebe42f"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "FK_a05854386ac11c656bd195f0fb8"
        `);
    await queryRunner.query(`
            ALTER TABLE "vgi_seasons" DROP CONSTRAINT "FK_494cb471d19f934c10497dfe345"
        `);
    await queryRunner.query(`
            ALTER TABLE "submissions" DROP CONSTRAINT "FK_be5180d034d1cc89f6b71f2d68e"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "FK_7d217bda0c87b2f090890da84d0"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_rsvps" DROP CONSTRAINT "FK_d49e5133e6b4d10ff7e37720086"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_classes" DROP CONSTRAINT "FK_f68669dca54687346d2cf45cb2d"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "FK_3895e40ed736f7df5e02208d26e"
        `);
    await queryRunner.query(`
            ALTER TABLE "course_credits" DROP CONSTRAINT "FK_e78579285a0e67bbed5cede3cf9"
        `);
    await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "FK_7666fc35401442909d126c8fe75"
        `);
    await queryRunner.query(`
            ALTER TABLE "checkins" DROP CONSTRAINT "FK_0c0f7578a9af049f4bb4ea8b452"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_98821d8bf60cd7694ecaa84dc99"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_ef5ca4668688e705e59aa94888b"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_a8b7828e92cb83497748e05811e"
        `);
    await queryRunner.query(`
            ALTER TABLE "assets" DROP CONSTRAINT "FK_62af2af5bd6ee5d50d0535e4d13"
        `);
    await queryRunner.query(`
            ALTER TABLE "sponsors" DROP CONSTRAINT "FK_7c9ea7488bdc8a37cef5579f580"
        `);
    await queryRunner.query(`
            ALTER TABLE "tags" DROP CONSTRAINT "FK_40309af226829221fae1c9628b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "FK_dbad7097c6721967143d689af2c"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "FK_291b1f8ad55a136607b68ea5ae8"
        `);
    await queryRunner.query(`
            ALTER TABLE "speakers" DROP CONSTRAINT "FK_fa45a2b5cb0b3010810649449ab"
        `);
    await queryRunner.query(`
            ALTER TABLE "place_links" DROP CONSTRAINT "FK_af29cce0b0d35e413e0ef5d3793"
        `);
    await queryRunner.query(`
            ALTER TABLE "organizations" DROP CONSTRAINT "FK_edf7b908b3162c9ca5a2b6a86e3"
        `);
    await queryRunner.query(`
            ALTER TABLE "universities" DROP CONSTRAINT "FK_f803d981c150d1767c17eb9f594"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "FK_cf3b6defbb207b185c561329e54"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_responses" DROP CONSTRAINT "FK_3f3d72a63353eda3a0a8c3c46d9"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_rating_questions" DROP CONSTRAINT "FK_a5906ca3950e4c935b58677f7f8"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "FK_59ca4cfb5e8ee3b3a52bbd50e2b"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_responses" DROP CONSTRAINT "FK_461bb54e4f9f5e55b946e4b24c0"
        `);
    await queryRunner.query(`
            ALTER TABLE "initial_survey_questions" DROP CONSTRAINT "FK_bbffec509ddf4b7fe93c5b0b5f2"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_47c7ff234efa88a11a9b1529d88"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_b89cdd8d7bb93277f515ef137ee"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_ad4838bf262a7794667597edb15"
        `);
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_b767887bd8964046a2f3973e0e2"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "FK_d26912114e65ece5df50e1fb5e0"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_location" DROP CONSTRAINT "FK_a66af099b6df9ae654403ed809b"
        `);
    await queryRunner.query(`
            ALTER TABLE "event_broadcast" DROP CONSTRAINT "FK_1207ad09aea79f8a4d27687df46"
        `);
    await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "FK_53822ce689ade14d1ff0b82d61d"
        `);
    await queryRunner.query(`
            ALTER TABLE "seasons_days" DROP CONSTRAINT "FK_89530c0beae838ae03769e69664"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_56100d0260aeda18e8d597b135" ON "event_sponsors"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_c40503cede9874e5ff92d5b3a1" ON "event_sponsors"
        `);
    await queryRunner.query(`
            DROP TABLE "event_sponsors"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_918ceb78768665f0de7f72e2ee" ON "event_course_credits"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_596d2d806698b0ff11da26b575" ON "event_course_credits"
        `);
    await queryRunner.query(`
            DROP TABLE "event_course_credits"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_a84940a42e02485bd8e1f4b0e8" ON "event_tags"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_768d829ed77a67d070c20bdb20" ON "event_tags"
        `);
    await queryRunner.query(`
            DROP TABLE "event_tags"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_da6264b5aae11469a43c994649" ON "event_speakers"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_a8cf1f8d863f3142f20629e253" ON "event_speakers"
        `);
    await queryRunner.query(`
            DROP TABLE "event_speakers"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_submissions_media"
        `);
    await queryRunner.query(`
            DROP INDEX "REL_3808be9ccac84ab841f73ced10" ON "vgi_submissions"
        `);
    await queryRunner.query(`
            DROP INDEX "REL_cdbdc0e5971e31489fb6cebe42" ON "vgi_submissions"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_submissions"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_submission_validation_status"
        `);
    await queryRunner.query(`
            DROP INDEX "REL_a05854386ac11c656bd195f0fb" ON "vgi_seasons"
        `);
    await queryRunner.query(`
            DROP INDEX "REL_494cb471d19f934c10497dfe34" ON "vgi_seasons"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_seasons"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_forms"
        `);
    await queryRunner.query(`
            DROP TABLE "vgi_submissions_locations"
        `);
    await queryRunner.query(`
            DROP TABLE "submissions"
        `);
    await queryRunner.query(`
            DROP TABLE "user_rsvps"
        `);
    await queryRunner.query(`
            DROP TABLE "user_classes"
        `);
    await queryRunner.query(`
            DROP TABLE "user_info"
        `);
    await queryRunner.query(`
            DROP TABLE "rsvp_types"
        `);
    await queryRunner.query(`
            DROP TABLE "submission_types"
        `);
    await queryRunner.query(`
            DROP TABLE "course_credits"
        `);
    await queryRunner.query(`
            DROP TABLE "classes"
        `);
    await queryRunner.query(`
            DROP TABLE "checkins"
        `);
    await queryRunner.query(`
            DROP TABLE "assets"
        `);
    await queryRunner.query(`
            DROP TABLE "sponsors"
        `);
    await queryRunner.query(`
            DROP TABLE "tags"
        `);
    await queryRunner.query(`
            DROP TABLE "speakers"
        `);
    await queryRunner.query(`
            DROP TABLE "place_links"
        `);
    await queryRunner.query(`
            DROP TABLE "organizations"
        `);
    await queryRunner.query(`
            DROP TABLE "speaker_roles"
        `);
    await queryRunner.query(`
            DROP TABLE "universities"
        `);
    await queryRunner.query(`
            DROP TABLE "event_rating_responses"
        `);
    await queryRunner.query(`
            DROP TABLE "event_rating_questions"
        `);
    await queryRunner.query(`
            DROP TABLE "initial_survey_responses"
        `);
    await queryRunner.query(`
            DROP TABLE "initial_survey_questions"
        `);
    await queryRunner.query(`
            DROP TABLE "question_types"
        `);
    await queryRunner.query(`
            DROP TABLE "events"
        `);
    await queryRunner.query(`
            DROP TABLE "event_location"
        `);
    await queryRunner.query(`
            DROP TABLE "event_broadcast"
        `);
    await queryRunner.query(`
            DROP TABLE "places"
        `);
    await queryRunner.query(`
            DROP TABLE "seasons_days"
        `);
    await queryRunner.query(`
            DROP TABLE "seasons"
        `);
  }
}
