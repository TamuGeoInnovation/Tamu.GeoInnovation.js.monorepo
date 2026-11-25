import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  NO_SLIDES_FOR_SESSION,
  SESSION_FILES_LIMIT,
  SessionSlidesDto,
  SpeakerSessionDto,
  SubmissionFileDto,
  slidesZipName,
  submissionFileProblem,
  zipSafe
} from '@tamu-gisc/gisday/common';

import { Asset, Event, Speaker, SpeakerEditLink } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { discardUpload, fileDownload, fileDto, storeUpload, zipOfFiles } from '../user-submission/submission-files.service';

/** The asset `type` of a session's slides. */
export const SESSION_FILE_TYPE = 'session-file';

/**
 * The slides of the sessions speakers present (#3093), uploaded from the speaker's edit link with no account.
 *
 * Each speaker of a session uploads their own, up to three files, and sees and removes only their own: a file is kept
 * with its session and the speaker who uploaded it (`uploadedBy`). A speaker reaches only the sessions of their own
 * speaker record, found from their link, never from an id the browser sends: a session that is not theirs, or a file
 * that is not theirs, reads as not found. An upload is kept at once, with no approval. The admins see every speaker's
 * files, each labelled with who uploaded it. The files are received, checked and kept as a submission's are
 * (`SUBMISSION_FILE_UPLOAD`, `submissionFileProblem`, `storeUpload`), under `sessions/<session>` in APP_DATA.
 */
@Injectable()
export class SessionFilesService {
  constructor(
    @InjectRepository(Speaker) private readonly speakers: Repository<Speaker>,
    @InjectRepository(Asset) private readonly assets: Repository<Asset>,
    private readonly assetsService: AssetsService
  ) {}

  /** The sessions the link's speaker presents in their season, in the order of the day, each with that speaker's files. */
  public async forLink(link: SpeakerEditLink): Promise<Array<SpeakerSessionDto>> {
    const sessions = await this.sessionsOf(link);
    const files = await this.filesOf(
      sessions.map((s) => s.guid),
      link
    );

    return Promise.all(
      sessions.map(async (session) => ({
        ...sessionOf(session),
        files: await Promise.all(files.filter((f) => f.event?.guid === session.guid).map((f) => fileDto(f)))
      }))
    );
  }

  /**
   * Keeps an upload, already written to disk by Multer, as one of the speaker's files for the session, beside any they
   * have there: up to three, counted per speaker. The file is moved into the session's folder, or removed if the session
   * is not the speaker's, the file breaks the rules, or the speaker already has three.
   */
  public async upload(
    link: SpeakerEditLink,
    eventGuid: string,
    // Multer leaves it out when no file was sent.
    upload: Express.Multer.File | undefined
  ): Promise<SubmissionFileDto> {
    try {
      if (!upload) {
        throw new BadRequestException('No file was sent.');
      }

      const session = await this.sessionFor(link, eventGuid);

      // A session with no slides (#3147) takes none.
      if (session.noSlides) {
        throw new BadRequestException(NO_SLIDES_FOR_SESSION);
      }

      const own = await this.filesOf([session.guid], link);
      const problem = submissionFileProblem(upload.originalname, upload.size, own.length, SESSION_FILES_LIMIT);

      if (problem) {
        throw new BadRequestException(problem);
      }

      const { guid, path } = await storeUpload(upload, `sessions/${session.guid}`);
      const saved = await this.assets.save(
        this.assets.create({
          guid,
          name: upload.originalname,
          path,
          type: SESSION_FILE_TYPE,
          event: { guid: session.guid } as Event,
          uploadedBy: { guid: link.speaker.guid } as Speaker
        })
      );

      return fileDto(saved);
    } finally {
      await discardUpload(upload);
    }
  }

  /**
   * Removes a file from the session. With a speaker's link, only one of that speaker's own: another speaker's file, or
   * none, reads as not found. Without one, for the admins, any speaker's file on the session, one whose speaker is no
   * longer listed included (#3105); a file of another session reads as not found.
   */
  public async remove(link: SpeakerEditLink | null, eventGuid: string, fileGuid: string): Promise<void> {
    const session = link ? (await this.sessionFor(link, eventGuid)).guid : eventGuid;
    const file = (await this.filesOf([session], link ?? undefined)).find((f) => f.guid === fileGuid);

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    await this.discard([file]);
  }

  /** Every speaker's files for a session, oldest first, each labelled with who uploaded it, for its admin page. */
  public async forEvent(eventGuid: string): Promise<Array<SubmissionFileDto>> {
    const files = await this.assets.find({
      where: { type: SESSION_FILE_TYPE, event: { guid: eventGuid } },
      relations: { event: true, uploadedBy: true },
      order: { created: 'ASC' }
    });

    return Promise.all(files.map(async (file) => ({ ...(await fileDto(file)), uploadedBy: uploaderOf(file) })));
  }

  /** One of a session's files, under the name it was uploaded with. */
  public async download(eventGuid: string, fileGuid: string): Promise<StreamableFile> {
    const file = (await this.filesOf([eventGuid])).find((f) => f.guid === fileGuid);

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    return fileDownload(file, 'SessionFilesService');
  }

  /**
   * Every speaker's slides for a session as one zip (#3174), a folder per speaker, named as the list labels them, for its
   * admin page. Not found when no speaker has uploaded any.
   */
  public async zipForEvent(eventGuid: string): Promise<StreamableFile> {
    const files = await this.assets.find({
      where: { type: SESSION_FILE_TYPE, event: { guid: eventGuid } },
      relations: { event: true, uploadedBy: true },
      order: { created: 'ASC' }
    });

    if (files.length === 0) {
      throw new NotFoundException('No slides have been uploaded for this session yet.');
    }

    const bySpeaker = new Map<string, Array<Asset>>();

    for (const file of files) {
      const folder = zipSafe(uploaderOf(file), 'A speaker');

      bySpeaker.set(folder, [...(bySpeaker.get(folder) ?? []), file]);
    }

    return zipOfFiles(
      [...bySpeaker].map(([folder, own]) => ({ folder, files: own })),
      slidesZipName(files[0].event?.name),
      'SessionFilesService',
      "This session's slides are missing from the server."
    );
  }

  /**
   * Every file of a season's sessions, oldest first, for the admins' list of sessions with and without slides: a
   * session has slides when any of its speakers has uploaded one.
   */
  public async forSeason(seasonGuid: string): Promise<Array<SessionSlidesDto>> {
    const files = await this.assets.find({
      where: { type: SESSION_FILE_TYPE, event: { season: { guid: seasonGuid } } },
      relations: { event: true },
      order: { created: 'ASC' }
    });

    // `event` is loaded by this find's `relations`, and every one of these files has one: the find is by its season.
    return Promise.all(files.map(async (file) => ({ event: file.event!.guid, file: await fileDto(file) })));
  }

  /** The sessions of the link's speaker, in their speaker record's season, by day and start time. */
  private async sessionsOf(link: SpeakerEditLink): Promise<Array<Event>> {
    const speaker = await this.speakers.findOne({
      where: { guid: link.speaker.guid },
      relations: { season: true, events: { day: true, location: true, season: true } }
    });
    const season = speaker?.season?.guid;

    return (speaker?.events ?? [])
      .filter((event) => !season || !event.season || event.season.guid === season)
      .sort((a, b) => order(a).localeCompare(order(b)));
  }

  /** The session, if it is one of the link's speaker's; otherwise not found, so an id cannot be tried for another's. */
  private async sessionFor(link: SpeakerEditLink, eventGuid: string): Promise<Event> {
    const session = (await this.sessionsOf(link)).find((s) => s.guid === eventGuid);

    if (!session) {
      throw new NotFoundException('That session is not one of yours.');
    }

    return session;
  }

  /** The sessions' files, oldest first: only those the link's speaker uploaded, when a link is given. */
  private async filesOf(eventGuids: Array<string>, link?: SpeakerEditLink): Promise<Array<Asset>> {
    if (eventGuids.length === 0) {
      return [];
    }

    return this.assets.find({
      where: {
        type: SESSION_FILE_TYPE,
        event: { guid: In(eventGuids) },
        ...(link ? { uploadedBy: { guid: link.speaker.guid } } : {})
      },
      relations: { event: true },
      order: { created: 'ASC' }
    });
  }

  /** Deletes the files' rows, then the files themselves, as a submission's removed file is. */
  private async discard(files: Array<Asset>): Promise<void> {
    if (files.length === 0) {
      return;
    }

    await this.assets.delete(files.map((f) => f.guid));
    await this.assetsService.deleteAssetFiles(files);
  }
}

/** Who uploaded a session's file, for the admins: the speaker's name, or that their record has since been deleted. */
function uploaderOf(file: Asset): string {
  const name = [file.uploadedBy?.firstName, file.uploadedBy?.lastName].filter(Boolean).join(' ');

  return name || 'A speaker no longer listed';
}

/** A session as the edit page lists it. */
function sessionOf(event: Event): Omit<SpeakerSessionDto, 'files'> {
  const place = [event.location?.building, event.location?.room].filter(Boolean).join(' ');

  return {
    guid: event.guid,
    // `SpeakerSessionDto` has no unnamed session; one with no name has an empty one, as the judging page gives it.
    name: event.name ?? '',
    date: event.day ? new Date(event.day.date).toISOString() : null,
    startTime: event.startTime,
    endTime: event.endTime,
    place: place || null,
    noSlides: !!event.noSlides
  };
}

/** What sorts a speaker's sessions: the day, then the start time. A session with no day comes last. */
function order(event: Event): string {
  return `${event.day ? new Date(event.day.date).toISOString() : '9999'} ${event.startTime ?? ''}`;
}
