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

-- Changes on every run, so an account id cannot be worked back from its replacement.
DECLARE @salt nvarchar(36) = CONVERT(nvarchar(36), NEWID());

-- `updated` and `created` are kept everywhere and are not listed.
DECLARE @kept TABLE (tbl sysname, cols nvarchar(max));
INSERT @kept VALUES
  (N'assets', N'guid,name,path,type,organizationGuid,speakerGuid,sponsorGuid,placesGuid'),
  (N'checkins', N'guid,eventGuid'),
  (N'classes', N'guid,title,code,seasonGuid,number,section'),
  (N'course_credits', N'guid,eventGuid,classGuid'),
  (N'event_broadcast', N'guid,name,seasonGuid'),
  (N'event_course_credits', N'eventsGuid,courseCreditsGuid'),
  (N'event_location', N'guid,room,building,capacity,link,placeGuid,streetAddressOverride,seasonGuid'),
  (N'event_rating_questions', N'guid,userEditable,type,text,options,seasonGuid'),
  (N'event_rating_responses', N'guid,eventGuid,questionGuid'),
  (N'event_speakers', N'eventsGuid,speakersGuid'),
  (N'event_sponsors', N'eventsGuid,sponsorsGuid'),
  (N'event_tags', N'eventsGuid,tagsGuid'),
  (N'events', N'guid,name,active,startTime,endTime,observedAttendeeStart,observedAttendeeEnd,capacity,resources,requiresRsvp,qrCode,mode,eventType,presentationType,isAcceptingRsvps,isBringYourOwnDevice,requirements,dayGuid,broadcastGuid,locationGuid,seasonGuid'),
  (N'initial_survey_questions', N'guid,questionText,questionOptions,questionTypeGuid'),
  (N'initial_survey_responses', N'guid,seasonGuid,questionGuid'),
  (N'organizations', N'guid,website,seasonGuid,acronym,text'),
  (N'place_links', N'guid,label,url,placeGuid'),
  (N'places', N'guid,name,address,city,state,zip,website,seasonGuid,visibilitySettings'),
  (N'question_types', N'guid,type'),
  (N'rsvp_types', N'guid,type'),
  (N'seasons', N'guid,year,active'),
  (N'seasons_days', N'guid,date,seasonGuid'),
  (N'speaker_roles', N'guid,name'),
  -- Names and profiles are kept for everyone in `speakers` (the maintainer's decision, 11 October 2026).
  (N'speakers', N'guid,firstName,lastName,isActive,graduationYear,degree,program,affiliation,socialMedia,seasonGuid,organizationGuid,universityGuid,isOrganizer'),
  (N'sponsors', N'guid,name,website,sponsorshipLevel,seasonGuid,description'),
  (N'submission_types', N'guid,type'),
  (N'submissions', N'guid,submissionType,seasonGuid,reviewed,acceptance,format,classificationType'),
  (N'tags', N'guid,name,seasonGuid'),
  (N'universities', N'guid,name,acronym,hexTriplet,seasonGuid'),
  (N'user_classes', N'guid,classGuid'),
  (N'user_info', N'guid,fieldOfStudy,classification,participantType,hasCompletedInitialSurvey'),
  (N'user_rsvps', N'guid,eventGuid,rsvpTypeGuid'),
  (N'vgi_forms', N'guid,source,model'),
  (N'vgi_seasons', N'guid,allowSubmissions,seasonGuid,formGuid'),
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

-- An Auth0 account id becomes a made-up id, the same one wherever that account appears.
DECLARE @account nvarchar(max) =
  N'CASE WHEN {c} IS NULL OR {c} = N''system-migration'' THEN {c}
         ELSE N''local|'' + LOWER(LEFT(CONVERT(nvarchar(64), HASHBYTES(''SHA2_256'', {c} + @salt), 2), 24)) END';
INSERT @scrubbed VALUES
  (N'checkins', N'accountGuid', @account),
  (N'initial_survey_responses', N'accountGuid', @account),
  (N'speakers', N'accountGuid', @account),
  (N'submissions', N'accountGuid', @account),
  (N'user_classes', N'accountGuid', @account),
  (N'user_info', N'accountGuid', @account),
  (N'user_rsvps', N'accountGuid', @account),
  (N'vgi_submissions', N'userGuid', @account),
  (N'vgi_submission_validation_status', N'verifiedBy', @account);

-- What an email address looks like inside a longer text. Published text is kept unless it holds one.
DECLARE @email nvarchar(50) = N'%[a-z0-9]@[a-z0-9]%.[a-z]%';
INSERT @scrubbed VALUES
  (N'events', N'abstract', N'CASE WHEN {c} LIKE N''' + @email + N''' THEN N''The abstract is removed from this copy: it held an email address.'' ELSE {c} END'),
  (N'organizations', N'name', N'CASE WHEN {c} LIKE N''' + @email + N''' THEN N''Organization '' + LOWER(LEFT(guid, 8)) ELSE {c} END'),
  (N'speakers', N'description', N'CASE WHEN {c} LIKE N''' + @email + N''' THEN N''The profile is removed from this copy: it held an email address.'' ELSE {c} END');

INSERT @scrubbed VALUES
  (N'speakers', N'email', N'N''speaker-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),

  (N'organizations', N'contactFirstName', N'N''Contact'''),
  (N'organizations', N'contactLastName', N'N''Person'''),
  (N'organizations', N'contactEmail', N'N''organization-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  (N'sponsors', N'contactFirstName', N'N''Contact'''),
  (N'sponsors', N'contactLastName', N'N''Person'''),
  (N'sponsors', N'contactEmail', N'N''sponsor-'' + LOWER(LEFT(guid, 8)) + N''@example.org'''),
  (N'sponsors', N'sponsorshipAmount', N'NULL'),
  (N'classes', N'professorName', N'N''Professor '' + UPPER(LEFT(guid, 4))'),

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
  EXEC sp_executesql @sql, N'@salt nvarchar(36)', @salt = @salt;
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

-- 3. Look in every text column of the copy for what must not be there: an Auth0 account id, or an
--    email address that is not a made-up one. Then the participant lists and the photographs.

DECLARE @leaks nvarchar(max) = N'', @found int, @col sysname;

DECLARE textColumns CURSOR LOCAL FAST_FORWARD FOR
  SELECT k.tbl, c.name
  FROM @kept k
  JOIN sys.columns c ON c.object_id = OBJECT_ID(N'dbo.' + QUOTENAME(k.tbl))
  JOIN sys.types ty ON ty.user_type_id = c.user_type_id
  WHERE ty.name IN (N'nvarchar', N'varchar', N'nchar', N'char', N'ntext', N'text');

OPEN textColumns;
FETCH NEXT FROM textColumns INTO @tbl, @col;
WHILE @@FETCH_STATUS = 0
BEGIN
  SET @sql = N'SELECT @found = COUNT(*) FROM ' + @dest + QUOTENAME(@tbl) + N' x
    CROSS APPLY (SELECT CAST(x.' + QUOTENAME(@col) + N' AS nvarchar(max)) AS v) t
    WHERE t.v LIKE N''auth0|%'' OR t.v LIKE N''%-oauth2|%''
       OR REPLACE(t.v, N''@example.org'', N'''') LIKE @email';
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

PRINT N'Copied into ' + @target + N'. No account id, real email address, participant list or photograph is in it.';
