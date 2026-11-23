-- Copies the GIS Day database into [gisday-scrubbed] with everything personal replaced (#1622).
-- Run by `scripts/gisday-local.sh scrub`, in the database to copy from; docs/gisday-local.md has the steps.
--
-- It copies into a new, empty database instead of changing rows in place, so nothing of the original
-- can be left behind in freed pages, the transaction log or the query store.
--
-- Every column of every table is named below, either in @kept or in @scrubbed. A column in neither
-- stops the script before it copies anything: a new column has to be looked at by a person first.

SET NOCOUNT ON;
SET XACT_ABORT ON;
-- Some tables have filtered indexes, which refuse an INSERT without this (sqlcmd needs -I as well).
SET QUOTED_IDENTIFIER ON;

DECLARE @target sysname = N'gisday-scrubbed';

-- `updated` and `created` are kept everywhere and are not listed.
DECLARE @kept TABLE (tbl sysname, cols nvarchar(max));
INSERT @kept VALUES
  -- A judge's scores for a submission (#3183): who, which, and the numbers. The comment goes below.
  (N'assessments', N'guid,judgeGuid,submissionGuid,eventGuid,rubricGuid,scores,total'),
  (N'assets', N'guid,type,organizationGuid,speakerGuid,sponsorGuid,placesGuid,submissionGuid,eventGuid,uploadedByGuid'),
  (N'checkins', N'guid,eventGuid,outsideSessionTime'),
  (N'classes', N'guid,title,code,seasonGuid,number,section'),
  (N'course_credits', N'guid,eventGuid,classGuid'),
  (N'event_broadcast', N'guid,name,seasonGuid,placeGuid'),
  (N'event_course_credits', N'eventsGuid,courseCreditsGuid'),
  -- `checkInZone` is the outline of a building, where check-in is allowed (#1766), not anyone's position.
  (N'event_location', N'guid,room,building,capacity,link,placeGuid,streetAddressOverride,seasonGuid,checkInZone'),
  (N'event_rating_questions', N'guid,userEditable,type,text,options,seasonGuid'),
  (N'event_rating_responses', N'guid,eventGuid,questionGuid'),
  -- Which of a session's speakers judge its competition (#3183).
  (N'event_judges', N'eventsGuid,speakersGuid'),
  (N'event_speakers', N'eventsGuid,speakersGuid'),
  (N'event_sponsors', N'eventsGuid,sponsorsGuid'),
  (N'event_tags', N'eventsGuid,tagsGuid'),
  (N'events', N'guid,active,startTime,endTime,observedAttendeeStart,observedAttendeeEnd,capacity,resources,requiresRsvp,qrCode,mode,eventType,presentationType,isAcceptingRsvps,isBringYourOwnDevice,requirements,dayGuid,broadcastGuid,locationGuid,seasonGuid,checkInMinutesBefore,checkInMinutesAfter,checkInAnyTime,noSlides,judgedCompetition,judgingClosed'),
  (N'initial_survey_questions', N'guid,questionText,questionOptions,questionTypeGuid'),
  (N'initial_survey_responses', N'guid,seasonGuid,questionGuid'),
  (N'organizations', N'guid,seasonGuid,acronym'),
  (N'place_links', N'guid,label,url,placeGuid'),
  (N'places', N'guid,name,address,city,state,zip,website,seasonGuid,visibilitySettings'),
  (N'question_types', N'guid,type'),
  (N'rsvp_types', N'guid,type'),
  -- The rubrics judges score against (#3183): the competition organizer's text, about the work, not about anyone.
  (N'rubrics', N'guid,seasonGuid,competitionType,name,description'),
  (N'rubric_criteria', N'guid,rubricGuid,position,name,maxPoints,levels'),
  (N'seasons', N'guid,year,active,posterSubmissionsCloseAt,posterFilesCloseAt,presentationSubmissionsCloseAt,presentationFilesCloseAt,paperSubmissionsCloseAt,paperFilesCloseAt,cartographySubmissionsCloseAt,cartographyFilesCloseAt'),
  (N'season_competitions', N'guid,competitionType,seasonGuid'),
  -- A season's winners (#3239): which submission won which place; the names shown are the submission's.
  (N'season_winners', N'guid,seasonGuid,competition,place,submissionGuid'),
  (N'seasons_days', N'guid,date,seasonGuid'),
  (N'speaker_roles', N'guid,name'),
  (N'speakers', N'guid,isActive,seasonGuid,organizationGuid,universityGuid,isOrganizer,badgePrintedAt'),
  -- A speaker's own link to edit their profile (#2936): which speaker, and until when. The token and the address go below.
  (N'speaker_edit_links', N'guid,speakerGuid,expires,purpose'),
  -- Which email each speaker was sent, about which session, and when (#3167). The addresses go below.
  (N'speaker_email_sends', N'guid,speakerGuid,kind,eventGuid'),
  -- What a speaker proposed (#2936): whose, and where it stands. What they wrote goes below, as the speaker's own does.
  (N'speaker_edits', N'guid,speakerGuid,universityGuid,status,reviewedAt'),
  (N'sponsors', N'guid,name,website,sponsorshipLevel,seasonGuid,description,active,logoSize'),
  (N'submission_types', N'guid,type'),
  (N'submissions', N'guid,submissionType,seasonGuid,reviewed,acceptance,format,classificationType'),
  (N'tags', N'guid,name,seasonGuid'),
  (N'universities', N'guid,name,acronym,hexTriplet,seasonGuid'),
  (N'user_classes', N'guid,classGuid'),
  (N'user_info', N'guid,fieldOfStudy,classification,participantType,hasCompletedInitialSurvey'),
  (N'user_rsvps', N'guid,eventGuid,rsvpTypeGuid'),
  (N'vgi_forms', N'guid,source,model'),
  (N'vgi_seasons', N'guid,allowSubmissions,seasonGuid,formGuid,scoringOpensAt,scoringClosesAt'),
  -- The competition answers in `value` are choices from a fixed list (checked 11 October 2026), not free text.
  (N'vgi_submissions', N'guid,value,locationGuid,seasonGuid,validationStatusGuid'),
  (N'vgi_submission_validation_status', N'guid,status'),
  (N'vgi_submissions_locations', N'guid,latitude,longitude,accuracy,altitude,altitudeAccuracy,heading,speed'),
  (N'vgi_submissions_media', N'guid,fieldName,submissionGuid');

-- Tables that are not copied: the migrations record is written when the new database is built, and
-- the other three exist only in production and are not used by the code.
DECLARE @skipped TABLE (tbl sysname);
INSERT @skipped VALUES (N'typeorm_migrations'), (N'organization_links'), (N'speaker_images'), (N'sysdiagrams');

-- What each personal column becomes. `{c}` is the column; a NULL stays NULL unless the rule says otherwise.
DECLARE @scrubbed TABLE (tbl sysname, col sysname, expr nvarchar(max));

-- An Auth0 account id becomes a new random id on every row. Nothing ties two rows to one person, so
-- the copy has each event's sign-up and check-in counts but nobody's history.
DECLARE @account nvarchar(max) =
  N'CASE WHEN {c} IS NULL OR {c} = N''system-migration'' THEN {c}
         ELSE N''local|'' + LOWER(REPLACE(CONVERT(nvarchar(36), NEWID()), N''-'', N'''')) END';
INSERT @scrubbed VALUES
  (N'checkins', N'accountGuid', @account),
  (N'initial_survey_responses', N'accountGuid', @account),
  -- A trail challenge winner, by account (#3239).
  (N'season_winners', N'accountGuid', @account),
  (N'speakers', N'accountGuid', @account),
  (N'submissions', N'accountGuid', @account),
  (N'user_classes', N'accountGuid', @account),
  (N'user_info', N'accountGuid', @account),
  (N'user_rsvps', N'accountGuid', @account),
  (N'vgi_submissions', N'userGuid', @account),
  (N'speaker_edits', N'reviewedBy', @account),
  (N'vgi_submission_validation_status', N'verifiedBy', @account);

-- Every real person's full name in the database: speakers, contacts, professors and competition entrants. Text that is
-- otherwise kept is replaced when it holds one of them, or an email address.
CREATE TABLE #names (v nvarchar(400) PRIMARY KEY);
INSERT #names
SELECT DISTINCT LOWER(LTRIM(RTRIM(f)) + N' ' + LTRIM(RTRIM(l)))
FROM (SELECT firstName AS f, lastName AS l FROM dbo.speakers
      UNION SELECT contactFirstName, contactLastName FROM dbo.organizations
      UNION SELECT contactFirstName, contactLastName FROM dbo.sponsors) people
WHERE LEN(LTRIM(RTRIM(f))) >= 2 AND LEN(LTRIM(RTRIM(l))) >= 2
UNION
SELECT LOWER(LTRIM(RTRIM(professorName))) FROM dbo.classes WHERE LEN(LTRIM(RTRIM(professorName))) >= 6
UNION
-- Students named on competition entries; a session can be named after one.
SELECT LOWER(LTRIM(RTRIM(j.name))) FROM dbo.submissions s
  CROSS APPLY OPENJSON(CAST(s.participants AS nvarchar(max))) WITH (name nvarchar(400)) j
WHERE LEN(LTRIM(RTRIM(j.name))) >= 6;

DECLARE @email nvarchar(50) = N'%[a-z0-9]@[a-z0-9]%.[a-z]%';
DECLARE @personal nvarchar(max) =
  N'({c} LIKE N''' + @email + N''' OR EXISTS (SELECT 1 FROM #names n WHERE CHARINDEX(n.v, LOWER({c})) > 0))';
INSERT @scrubbed VALUES
  (N'events', N'name', N'CASE WHEN ' + @personal + N' THEN N''Session '' + LOWER(LEFT(guid, 8)) ELSE {c} END'),
  (N'events', N'abstract', N'CASE WHEN ' + @personal + N' THEN N''The abstract is removed from this copy.'' ELSE {c} END'),
  (N'organizations', N'name', N'CASE WHEN ' + @personal + N' THEN N''Organization '' + LOWER(LEFT(guid, 8)) ELSE {c} END'),
  (N'organizations', N'text', N'CASE WHEN ' + @personal + N' THEN NULL ELSE {c} END'),
  (N'organizations', N'website', N'CASE WHEN ' + @personal + N' THEN NULL ELSE {c} END'),

  -- Nobody in `speakers` keeps anything real, whether or not the site published them.
  (N'speakers', N'firstName', N'CHOOSE(ABS(CHECKSUM(guid)) % 12 + 1, N''Alex'', N''Blake'', N''Casey'', N''Devon'', N''Emery'', N''Finley'', N''Harper'', N''Jordan'', N''Morgan'', N''Quinn'', N''Riley'', N''Taylor'')'),
  (N'speakers', N'lastName', N'N''Sample-'' + LOWER(LEFT(guid, 4))'),
  (N'speakers', N'description', N'N''A short biography would be here. This one is made up for the local copy.'''),
  (N'speakers', N'affiliation', N'N''Texas A&M University'''),
  (N'speakers', N'socialMedia', N'NULL'),
  (N'speakers', N'graduationYear', N'NULL'),
  (N'speakers', N'degree', N'NULL'),
  (N'speakers', N'program', N'NULL'),

  -- Uploaded logos and photographs are files on the production site, not rows here, and their
  -- names can be people's names. Every one points at the placeholder the front end ships
  -- (apps/gisday-angular/src/assets/uploads/images/placeholder.svg, #1625).
  (N'assets', N'name', N'N''placeholder.svg'''),
  (N'assets', N'path', N'N''images/placeholder.svg'''),

  (N'speakers', N'email', N'N''speaker-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  -- What was printed on a badge holds the speaker's name (#2908).
  (N'speakers', N'badgePrintedText', N'NULL'),

  -- What a speaker proposed for their profile (#2936), made up as their own profile is above. The proposed photograph is a
  -- file on the production site, held for review.
  (N'speaker_edits', N'description', N'N''A short biography would be here. This one is made up for the local copy.'''),
  (N'speaker_edits', N'affiliation', N'N''Texas A&M University'''),
  (N'speaker_edits', N'socialMedia', N'NULL'),
  (N'speaker_edits', N'graduationYear', N'NULL'),
  (N'speaker_edits', N'photoPath', N'NULL'),
  -- A link's token is a password in all but name: no copied link may open a profile, so each hash is of nothing anyone
  -- holds; and the address it went to is made up.
  (N'speaker_edit_links', N'tokenHash', N'LOWER(CONVERT(char(64), HASHBYTES(''SHA2_256'', CONVERT(nvarchar(36), NEWID())), 2))'),
  (N'speaker_edit_links', N'sentTo', N'N''speaker-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  -- The address each email went to, and who it was from: an admin's own name and address (#3167).
  (N'speaker_email_sends', N'sentTo', N'N''speaker-'' + LOWER(LEFT(speakerGuid, 8)) + N''@example.org'''),
  (N'speaker_email_sends', N'sentFrom', N'N''GIS Day <gisday@example.org>'''),
  -- What a judge wrote about a student's work (#3183): free text, which can name anyone. The scores are kept above.
  (N'assessments', N'comment', N'N''The comment is removed from this copy.'''),

  (N'organizations', N'contactFirstName', N'N''Contact'''),
  (N'organizations', N'contactLastName', N'N''Person'''),
  (N'organizations', N'contactEmail', N'N''organization-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  (N'sponsors', N'contactFirstName', N'N''Contact'''),
  (N'sponsors', N'contactLastName', N'N''Person'''),
  (N'sponsors', N'contactEmail', N'N''sponsor-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  (N'sponsors', N'sponsorshipAmount', N'NULL'),
  (N'classes', N'professorName', N'N''Professor '' + UPPER(LEFT(guid, 4))'),

  -- A hybrid or virtual session's check-in code checks people in (#2560): none is copied.
  (N'events', N'checkInCode', N'NULL'),

  -- Meeting links and their passwords.
  (N'event_broadcast', N'password', N'N''000000'''),
  (N'event_broadcast', N'phoneNumber', N'N''000-000-0000'''),
  (N'event_broadcast', N'meetingId', N'N''000 000 0000'''),
  (N'event_broadcast', N'details', N'N''Broadcast details are removed from this copy.'''),
  (N'event_broadcast', N'presenterUrl', N'N''https://example.org/broadcast'''),
  (N'event_broadcast', N'publicUrl', N'N''https://example.org/broadcast'''),

  -- Students' competition entries; `participants` holds names, email addresses and student ids.
  (N'submissions', N'title', N'N''Submission '' + LOWER(LEFT(guid, 8))'),
  (N'submissions', N'abstract', N'N''The abstract is removed from this copy.'''),
  (N'submissions', N'participants', N'N''[]'''),
  (N'submissions', N'message', N'N''The message is removed from this copy.'''),
  (N'submissions', N'link', N'N''https://example.org/submission'''),

  (N'user_info', N'uin', N'N''000000000'''),
  (N'initial_survey_responses', N'responseValue', N'N''Removed'''),
  (N'event_rating_responses', N'response', N'N''Removed'''),

  -- Participants' photographs become a one-pixel image. They are nearly all of the database's size.
  (N'vgi_submissions_media', N'blob', N'0x89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082'),
  (N'vgi_submissions_media', N'mimeType', N'N''image/png'''),
  (N'vgi_submissions_media', N'sha256', N'LOWER(CONVERT(char(64), HASHBYTES(''SHA2_256'', 0x89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082), 2))');

-- 1. Every column must be in one list, and every listed column must exist.

DECLARE @listed TABLE (tbl sysname, col sysname);
INSERT @listed SELECT k.tbl, LTRIM(s.value) FROM @kept k CROSS APPLY STRING_SPLIT(k.cols, N',') s;
INSERT @listed SELECT tbl, col FROM @scrubbed;

DECLARE @problems nvarchar(max) = (
  SELECT STRING_AGG(CAST(p.what AS nvarchar(max)), N'; ')
  FROM (
    SELECT N'not classified: ' + t.name + N'.' + c.name AS what
    FROM sys.tables t JOIN sys.columns c ON c.object_id = t.object_id
    WHERE t.name NOT IN (SELECT tbl FROM @skipped) AND c.name NOT IN (N'updated', N'created')
      AND NOT EXISTS (SELECT 1 FROM @listed l WHERE l.tbl = t.name AND l.col = c.name)
    UNION ALL
    SELECT N'listed but missing: ' + l.tbl + N'.' + l.col
    FROM @listed l
    WHERE COLUMNPROPERTY(OBJECT_ID(N'dbo.' + QUOTENAME(l.tbl)), l.col, 'ColumnId') IS NULL
    UNION ALL
    SELECT N'listed twice: ' + l.tbl + N'.' + l.col FROM @listed l GROUP BY l.tbl, l.col HAVING COUNT(*) > 1
  ) p);

IF @problems IS NOT NULL
BEGIN
  SET @problems = N'Nothing was copied. Classify these in scrub.sql first: ' + @problems;
  THROW 50001, @problems, 1;
END

-- 2. Copy each table, with the rules applied.

DECLARE @tbl sysname, @sql nvarchar(max), @cols nvarchar(max), @exprs nvarchar(max);
DECLARE @dest nvarchar(300) = QUOTENAME(@target) + N'.dbo.';

DECLARE tables CURSOR LOCAL FAST_FORWARD FOR SELECT tbl FROM @kept ORDER BY tbl;

OPEN tables;
FETCH NEXT FROM tables INTO @tbl;
WHILE @@FETCH_STATUS = 0
BEGIN
  SET @sql = N'ALTER TABLE ' + @dest + QUOTENAME(@tbl) + N' NOCHECK CONSTRAINT ALL';
  EXEC sp_executesql @sql;
  FETCH NEXT FROM tables INTO @tbl;
END
CLOSE tables;

OPEN tables;
FETCH NEXT FROM tables INTO @tbl;
WHILE @@FETCH_STATUS = 0
BEGIN
  SELECT
    @cols = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N', ') WITHIN GROUP (ORDER BY c.column_id),
    @exprs = STRING_AGG(
      CAST(CASE
        WHEN s.expr IS NULL THEN QUOTENAME(c.name)
        WHEN s.expr LIKE N'CASE %' OR s.expr = N'NULL' OR c.is_nullable = 0 THEN REPLACE(s.expr, N'{c}', QUOTENAME(c.name))
        ELSE N'CASE WHEN ' + QUOTENAME(c.name) + N' IS NULL THEN NULL ELSE ' + s.expr + N' END'
      END AS nvarchar(max)), N', ') WITHIN GROUP (ORDER BY c.column_id)
  FROM sys.columns c
  LEFT JOIN @scrubbed s ON s.tbl = @tbl AND s.col = c.name
  WHERE c.object_id = OBJECT_ID(N'dbo.' + QUOTENAME(@tbl));

  SET @sql = N'INSERT INTO ' + @dest + QUOTENAME(@tbl) + N' (' + @cols + N') SELECT ' + @exprs + N' FROM dbo.' + QUOTENAME(@tbl);
  EXEC sp_executesql @sql;
  PRINT @tbl + N': ' + CAST(@@ROWCOUNT AS nvarchar(20)) + N' rows';
  FETCH NEXT FROM tables INTO @tbl;
END
CLOSE tables;

-- WITH CHECK proves every foreign key still holds in the copy.
OPEN tables;
FETCH NEXT FROM tables INTO @tbl;
WHILE @@FETCH_STATUS = 0
BEGIN
  SET @sql = N'ALTER TABLE ' + @dest + QUOTENAME(@tbl) + N' WITH CHECK CHECK CONSTRAINT ALL';
  EXEC sp_executesql @sql;
  FETCH NEXT FROM tables INTO @tbl;
END
CLOSE tables;
DEALLOCATE tables;

-- 3. Look in every text column of the copy for what must not be there: an Auth0 account id, an email
--    address that is not a made-up one, or the full name of anyone in #names. Then the participant
--    lists and the photographs. This is the slow part: a few minutes.

DECLARE @leaks nvarchar(max) = N'', @found int, @col sysname;

DECLARE textColumns CURSOR LOCAL FAST_FORWARD FOR
  SELECT k.tbl, c.name
  FROM @kept k
  JOIN sys.columns c ON c.object_id = OBJECT_ID(N'dbo.' + QUOTENAME(k.tbl))
  JOIN sys.types ty ON ty.user_type_id = c.user_type_id
  WHERE ty.name IN (N'nvarchar', N'varchar', N'nchar', N'char', N'ntext', N'text')
    AND c.name <> N'guid' AND c.name NOT LIKE N'%sGuid' AND c.name NOT IN (N'seasonGuid', N'eventGuid', N'classGuid');

OPEN textColumns;
FETCH NEXT FROM textColumns INTO @tbl, @col;
WHILE @@FETCH_STATUS = 0
BEGIN
  SET @sql = N'SELECT @found = COUNT(*) FROM ' + @dest + QUOTENAME(@tbl) + N' x
    CROSS APPLY (SELECT CAST(x.' + QUOTENAME(@col) + N' AS nvarchar(max)) AS v) t
    WHERE t.v LIKE N''auth0|%'' OR t.v LIKE N''%-oauth2|%''
       OR REPLACE(t.v, N''@example.org'', N'''') LIKE @email
       OR EXISTS (SELECT 1 FROM #names n WHERE CHARINDEX(n.v, LOWER(t.v)) > 0)';
  EXEC sp_executesql @sql, N'@found int OUTPUT, @email nvarchar(50)', @found = @found OUTPUT, @email = @email;
  IF @found > 0 SET @leaks += @tbl + N'.' + @col + N' (' + CAST(@found AS nvarchar(20)) + N' rows); ';
  FETCH NEXT FROM textColumns INTO @tbl, @col;
END
CLOSE textColumns;
DEALLOCATE textColumns;

SET @sql = N'SELECT @found =
    (SELECT COUNT(*) FROM ' + @dest + N'submissions WHERE CAST(participants AS nvarchar(max)) <> N''[]'')
  + (SELECT COUNT(*) FROM ' + @dest + N'vgi_submissions_media WHERE DATALENGTH(blob) > 100)';
EXEC sp_executesql @sql, N'@found int OUTPUT', @found = @found OUTPUT;
IF @found > 0 SET @leaks += N'participant lists or photographs (' + CAST(@found AS nvarchar(20)) + N' rows); ';

IF @leaks <> N''
BEGIN
  SET @leaks = N'The copy still holds personal data; do not use it. Add a rule in scrub.sql for: ' + @leaks;
  THROW 50002, @leaks, 1;
END

PRINT N'Copied into ' + @target + N'. No account id, real email address, real full name, participant list or photograph is in it.';
