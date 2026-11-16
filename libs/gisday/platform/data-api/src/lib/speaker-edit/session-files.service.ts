import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { SessionSlidesDto, SpeakerSessionDto, SubmissionFileDto, submissionFileProblem } from '@tamu-gisc/gisday/common';

import { Asset, Event, Speaker, SpeakerEditLink } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { discardUpload, fileDownload, fileDto, storeUpload } from '../user-submission/submission-files.service';

/** The asset `type` of a session's slides. */
export const SESSION_FILE_TYPE = 'session-file';

/**
 * The slides of the sessions speakers present (#3093), uploaded from the speaker's edit link with no account, and seen
 * by the admins only.
 *
 * A speaker reaches only the sessions of their own speaker record, found from their link, never from an id the browser
 * sends: a session that is not theirs reads as not found. A session has one set of slides; an upload is kept at once,
 * with no approval, and replaces the one before. The files are received, checked and kept as a submission's are
 * (`SUBMISSION_FILE_UPLOAD`, `submissionFileProblem`, `storeUpload`), under `sessions/<session>` in APP_DATA.
 */
@Injectable()
export class SessionFilesService {
  constructor(
    @InjectRepository(Speaker) private readonly speakers: Repository<Speaker>,
    @InjectRepository(Asset) private readonly assets: Repository<Asset>,
    private readonly assetsService: AssetsService
  ) {}

  /** The sessions the link's speaker presents in their season, in the order of the day, each with its slides. */
  public async forLink(link: SpeakerEditLink): Promise<Array<SpeakerSessionDto>> {
    const sessions = await this.sessionsOf(link);
    const files = await this.filesOf(sessions.map((s) => s.guid));

    return Promise.all(
      sessions.map(async (session) => {
        const file = files.find((f) => f.event?.guid === session.guid);

        return { ...sessionOf(session), file: file ? await fileDto(file) : null };
      })
    );
  }

  /**
   * Keeps an upload, already written to disk by Multer, as the session's slides, replacing any before it. The file is
   * moved into the session's folder, or removed if the session is not the speaker's or the file breaks the rules.
   */
  public async upload(link: SpeakerEditLink, eventGuid: string, upload: Express.Multer.File): Promise<SubmissionFileDto> {
    try {
      if (!upload) {
        throw new BadRequestException('No file was sent.');
      }

      const session = await this.sessionFor(link, eventGuid);
      // One set of slides, replaced by the next: nothing already kept counts against it.
      const problem = submissionFileProblem(upload.originalname, upload.size, 0);

      if (problem) {
        throw new BadRequestException(problem);
      }

      const previous = await this.filesOf([session.guid]);
      const { guid, path } = await storeUpload(upload, `sessions/${session.guid}`);
      const saved = await this.assets.save(
        this.assets.create({
          guid,
          name: upload.originalname,
          path,
          type: SESSION_FILE_TYPE,
          event: { guid: session.guid } as Event
        })
      );

      await this.discard(previous);

      return fileDto(saved);
    } finally {
      await discardUpload(upload);
    }
  }

  /** Removes the session's slides. */
  public async remove(link: SpeakerEditLink, eventGuid: string): Promise<void> {
    const session = await this.sessionFor(link, eventGuid);
    const files = await this.filesOf([session.guid]);

    if (files.length === 0) {
      throw new NotFoundException('No slides are uploaded for this session.');
    }

    await this.discard(files);
  }

  /** A session's slides, for its admin page. */
  public async forEvent(eventGuid: string): Promise<Array<SubmissionFileDto>> {
    return Promise.all((await this.filesOf([eventGuid])).map((file) => fileDto(file)));
  }

  /** One of a session's files, under the name it was uploaded with. */
  public async download(eventGuid: string, fileGuid: string): Promise<StreamableFile> {
    const file = (await this.filesOf([eventGuid])).find((f) => f.guid === fileGuid);

    if (!file) {
      throw new NotFoundException('File not found.');
    }

    return fileDownload(file, 'SessionFilesService');
  }

  /** The slides of every session of a season that has some, for the admins' list of sessions with and without. */
  public async forSeason(seasonGuid: string): Promise<Array<SessionSlidesDto>> {
    const files = await this.assets.find({
      where: { type: SESSION_FILE_TYPE, event: { season: { guid: seasonGuid } } },
      relations: { event: true }
    });

    return Promise.all(files.map(async (file) => ({ event: file.event.guid, file: await fileDto(file) })));
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

  private async filesOf(eventGuids: Array<string>): Promise<Array<Asset>> {
    if (eventGuids.length === 0) {
      return [];
    }

    return this.assets.find({
      where: { type: SESSION_FILE_TYPE, event: { guid: In(eventGuids) } },
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

/** A session as the edit page lists it. */
function sessionOf(event: Event): Omit<SpeakerSessionDto, 'file'> {
  const place = [event.location?.building, event.location?.room].filter(Boolean).join(' ');

  return {
    guid: event.guid,
    name: event.name,
    date: event.day?.date ? new Date(event.day.date).toISOString() : null,
    startTime: event.startTime ?? null,
    endTime: event.endTime ?? null,
    place: place || null
  };
}

/** What sorts a speaker's sessions: the day, then the start time. A session with no day comes last. */
function order(event: Event): string {
  return `${event.day?.date ? new Date(event.day.date).toISOString() : '9999'} ${event.startTime ?? ''}`;
}
