import { randomBytes } from 'crypto';

import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, In, Repository } from 'typeorm';

import { fitImage } from '@tamu-gisc/common/node/images';

import { Speaker, EntityRelationsLUT, University, Organization, Event, Asset, Season } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { refuseUnsafeImage } from '../assets/image-upload';
import { SeasonService } from '../season/season.service';
import { SPEAKER_PHOTO_FIT } from './speaker-photo';
import { onSchedule } from '../_base/hidden-sessions';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider, withoutIdentity } from '../_base/season-scoped-provider';

@Injectable()
export class SpeakerProvider extends SeasonScopedProvider<Speaker> {
  protected get seasons() {
    return this.seasonService;
  }

  protected readonly recordsName = 'speakers';

  protected forSeason(seasonGuid: string) {
    return this.getSpeakersForSeason(seasonGuid);
  }

  protected override readonly copyRelations = { images: true };

  protected override copyOf(record: Speaker, season: Season) {
    // Images are held by one speaker, so the copy has its own; a badge printed for one season is not printed for the
    // next (#2908).
    const copy = super.copyOf(record, season) as DeepPartial<Speaker>;

    copy.badgePrintedAt = null;
    copy.badgePrintedText = null;

    if (record.images) {
      copy.images = record.images.map(withoutIdentity);
    }

    return copy;
  }

  private _resourcePath = `images/speakers`;

  constructor(
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(University) private universityRepo: Repository<University>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(speakerRepo);
  }

  /**
   * A season's speakers, by name.
   *
   * @param withSessions Also each speaker's sessions, for the admin Speakers list's Sessions column (#441): a speaker
   * copied into a season is listed in it with or without a session there, and could not be told apart (#439). Only the
   * route behind `update:speakers` asks for them, because they include sessions hidden from the public schedule. A
   * speaker belongs to one season, so these are that season's. Added here, not to the lookup table, which other queries share.
   */
  public async getSpeakersForSeason(seasonGuid: string, withSessions = false) {
    try {
      return this.find({
        where: {
          season: {
            guid: seasonGuid
          }
        },
        relations: withSessions ? { ...EntityRelationsLUT.speaker, events: true } : EntityRelationsLUT.speaker,
        order: {
          lastName: 'ASC',
          firstName: 'ASC'
        }
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not find speakers for season.'), () =>
        Logger.error(err.message, 'SpeakerProvider')
      );
    }
  }

  /**
   * A presenter as their public page shows them, with their sessions in day and time order. Only the sessions the site
   * shows: a hidden one (`active` false) is left out, name and all (#3345). Removed after loading rather than filtered in
   * the query, so a presenter whose every session is hidden is still found.
   */
  public async getPresenter(guid: string) {
    const presenter = await this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: { organization: true, university: true, images: true, events: { day: true } },
      order: {
        events: {
          day: {
            date: 'ASC'
          },
          startTime: 'ASC'
        }
      }
    });

    if (presenter?.events) {
      // Not even to an admin: this is the public page's own route.
      presenter.events = presenter.events.filter(onSchedule);
    }

    return presenter;
  }

  /**
   * The active season's speakers; with their sessions only when asked, as `getSpeakersForSeason` (#441). Not through
   * `forActiveSeason`, whose `forSeason` cannot ask for sessions. No 422 for a missing season: `findOneActive` throws its
   * own 404 (#3324).
   */
  public async getSpeakersForActiveSeason(withSessions = false) {
    const season = await this.seasonService.findOneActive();

    return this.getSpeakersForSeason(season.guid, withSessions);
  }

  /**
   * Returns speakers that are participating in events for the active season.
   *
   * @param limitToPopulated If true, further filters speakers that have a photo an bio.
   */
  public async getSpeakersForActiveSeasonInEvents(limitToPopulated?: boolean) {
    const season = await this.seasonService.findOneActive();

    return this._speakersInEvents(season, limitToPopulated);
  }

  /**
   * Returns the speakers participating in a season's events: the same list as the active season's,
   * for any season, so a past year's Presenters page shows who spoke that year (#1758).
   *
   * @param limitToPopulated If true, further filters speakers that have a photo an bio.
   */
  public async getSpeakersForSeasonInEvents(seasonGuid: string, limitToPopulated?: boolean) {
    const season = await this.seasonService.findOneWithDaysAndEvents(seasonGuid);

    return this._speakersInEvents(season, limitToPopulated);
  }

  private async _speakersInEvents(season: Partial<Season>, limitToPopulated?: boolean) {
    if (!season) {
      return [];
    }

    // The initial value matters. Without it, `reduce` on an empty array throws
    // "Reduce of empty array with no initial value" -- so an active season with no days yet, which
    // is the state a season sits in while it is being set up, answered 500 instead of an empty
    // list. The reduce further down already passes `[]`.
    const eventGuids = season.days
      .map((day) => day.events.map((event) => event.guid))
      .reduce((acc, curr) => {
        return acc.concat(curr);
      }, []);

    const events = await this.eventRepo.find({
      where: {
        guid: In(eventGuids)
      },
      relations: { speakers: { images: true, organization: true, university: true } },
      order: {
        speakers: {
          firstName: 1,
          lastName: 1
        }
      }
    });

    // Extract ALL speakers from ALL events
    const eventSpeakers = events
      .map((event) => event.speakers)
      .reduce((acc, curr) => {
        return acc.concat(curr);
      }, []);

    // Remove duplicates
    const unique = eventSpeakers.reduce((acc, curr) => {
      const existing = acc.find((speaker) => speaker.guid === curr.guid);

      if (!existing) {
        if (limitToPopulated) {
          if (curr?.description?.length > 0 && curr?.images?.length > 0) {
            return acc.concat(curr);
          }
        } else {
          return acc.concat(curr);
        }
      }

      return acc;
    }, []);

    return unique;
  }

  public async getPresenters() {
    return this.speakerRepo.find({
      relations: { organization: true, university: true, images: true },
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async getOrganizersForSeason(seasonGuid: string) {
    return this.speakerRepo.find({
      where: {
        isOrganizer: true,
        season: { guid: seasonGuid }
      },
      relations: { organization: true, university: true, images: true },
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async getOrganizersForActiveSeason() {
    const season = await this.seasonService.findOneActive();

    if (!season) {
      throw new UnprocessableEntityException('No active season found.');
    }

    return this.speakerRepo.find({
      where: {
        isOrganizer: true,
        season: { guid: season.guid }
      },
      relations: { organization: true, university: true, images: true },
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async getAllTimeOrganizers() {
    return this.speakerRepo.find({
      where: {
        isOrganizer: true
      },
      relations: { organization: true, university: true, images: true },
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async updateWithInfo(guid: string, incoming: DeepPartial<Speaker>, file?) {
    delete incoming.guid;

    const existing = await this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('speaker')
    });

    if (existing) {
      let speakerImage;
      if (file != null || file != undefined) {
        try {
          speakerImage = await this._saveImage(file, guid);
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save speaker image'), () =>
            Logger.error(err.message, 'SpeakerProvider')
          );
        }
      }

      const toSave = {
        ...existing,
        ...incoming,
        isOrganizer: (incoming.isOrganizer as unknown as string) === 'true', // form data coerces boolean to string
        isActive: (incoming.isActive as unknown as string) === 'true', // form data coerces boolean to string
        images: [speakerImage]
      };

      if (speakerImage === undefined) {
        delete toSave.images;
      }

      return this.speakerRepo.save(toSave);
    } else {
      throw new NotFoundException();
    }
  }

  public async insertWithInfo(speaker: DeepPartial<Speaker>, file?) {
    const speakerEnt = this.speakerRepo.create({
      ...speaker,
      isOrganizer: (speaker.isOrganizer as unknown as string) === 'true', // form data coerces boolean to string
      isActive: (speaker.isActive as unknown as string) === 'true' // form data coerces boolean to string
    });

    // Checked before the speaker is saved, so a refused photo leaves no speaker behind.
    if (file) {
      refuseUnsafeImage(file, 'The photo');
    }

    if (speakerEnt) {
      const savedEntity = await speakerEnt.save();

      if (file != null || file != undefined) {
        try {
          const speakerImage = await this._saveImage(file, savedEntity.guid);

          savedEntity.images = [speakerImage];

          return savedEntity.save();
        } catch (err) {
          rethrowHttp(err, new InternalServerErrorException('Could not save speaker image'), () =>
            Logger.error(err.message, 'SpeakerProvider')
          );
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create speaker');
    }
  }

  /**
   * Marks these speakers' badges printed, now, each with what its badge said, so the badges page can tell when one
   * has changed since (#2908). Answers how many were marked; a guid that is no speaker is left out.
   */
  public async markBadgesPrinted(badges: Array<{ guid: string; text: string }>): Promise<{ marked: number }> {
    const wanted = (badges ?? []).filter((b) => typeof b?.guid === 'string' && b.guid && typeof b.text === 'string');

    if (wanted.length === 0) {
      throw new BadRequestException('No badges to mark printed.');
    }

    const now = new Date();
    let marked = 0;

    for (const badge of wanted) {
      const result = await this.speakerRepo.update(
        { guid: badge.guid },
        { badgePrintedAt: now, badgePrintedText: badge.text.slice(0, 1000) }
      );
      marked += result.affected ?? 0;
    }

    return { marked };
  }

  /** Clears these speakers' printed mark, so their badges show as not printed again (#2908). */
  public async clearBadgesPrinted(guids: Array<string>): Promise<{ cleared: number }> {
    const wanted = (guids ?? []).filter((g) => typeof g === 'string' && g);

    if (wanted.length === 0) {
      throw new BadRequestException('No badges to mark not printed.');
    }

    const result = await this.speakerRepo.update({ guid: In(wanted) }, { badgePrintedAt: null, badgePrintedText: null });

    return { cleared: result.affected ?? 0 };
  }

  public async copySpeakersIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public async insertBulk(speakers: OldFormatSpeaker[]) {
    // Convert old format to new format
    const activeSeason = await this.seasonService.findOneActive();

    try {
      const organizations = speakers
        .map((s) => s.SpeakerOrganization)
        .filter((org) => org !== '' && org !== null && org !== undefined);
      const uniqueOrganizations = [...new Set(organizations)];

      const existingOrganizations = await this.orgRepo.find({
        where: {
          name: In(uniqueOrganizations)
        }
      });

      const newOrganizations = uniqueOrganizations.filter((org) => {
        return !existingOrganizations.find((existingOrg) => existingOrg.name === org);
      });

      const newOrgEntities = newOrganizations.map((org) => {
        return this.orgRepo.create({
          name: org,
          season: activeSeason
        });
      });

      const savedNewOrgEntities = await this.orgRepo.save(newOrgEntities);

      // Do the same thing with universities

      const universities = speakers
        .map((s) => {
          return {
            name: s.university,
            hexTriplet: s.hexColor
          };
        })
        .filter((uni) => uni.name !== '' && uni.name !== null && uni.name !== undefined);

      const uniqueUniversities = universities.reduce((acc, current) => {
        const x = acc.find((item) => item.name === current.name);

        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      const existingUniversities = await this.universityRepo.find({
        where: {
          name: In(uniqueUniversities.map((u) => u.name))
        }
      });

      const newUniversities = uniqueUniversities.filter((uni) => {
        return !existingUniversities.find((existingUni) => existingUni.name === uni.name);
      });

      const newUniEntities = newUniversities.map((uni) => {
        return this.universityRepo.create({
          name: uni.name,
          hexTriplet: uni.hexTriplet
        });
      });

      const savedNewUniEntities = await this.universityRepo.save(newUniEntities);

      const allOrgs = await this.orgRepo.find();
      const allUnis = await this.universityRepo.find();

      const existingSpeakers = await this.speakerRepo.find({
        where: {
          email: In(speakers.map((s) => s.SpeakerEmail))
        }
      });

      const speakerEntities = speakers.map((s) => {
        const org = allOrgs.find((org) => org.name === s.SpeakerOrganization);
        const uni = allUnis.find((uni) => uni.name === s.university);

        return this.speakerRepo.create({
          firstName: s.SpeakerFirstName,
          lastName: s.SpeakerLastName,
          description: s.description,
          email: s.SpeakerEmail,
          organization: org,
          university: uni,
          isActive: s.isActive === 1,
          graduationYear: s.tamuYear,
          degree: s.tamuDegree,
          program: s.tamuProgram,
          affiliation: s.affiliation,
          season: activeSeason
        });
      });

      const filteredSpeakerEntities = speakerEntities.filter((speaker) => {
        return !existingSpeakers.find((existingSpeaker) => existingSpeaker.email === speaker.email);
      });

      const savedSpeakerEntities = await this.speakerRepo.save(filteredSpeakerEntities, {
        chunk: 50
      });

      return {
        newOrganizations: savedNewOrgEntities,
        newUniversities: savedNewUniEntities,
        newSpeakers: savedSpeakerEntities
      };
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err.message));
    }
  }

  public override async deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    let images: Array<Asset> = [];

    try {
      // Awaited, so a failed delete lands in the catch below; the images go by guid and their files after commit (#2205).
      const result = await this.speakerRepo.manager.transaction(async (manager) => {
        const speakers = await manager.find(Speaker, {
          where: {
            guid: In(guids)
          },
          relations: { images: true }
        });

        images = speakers.map((speaker) => speaker.images).flat();

        await this.assetService.deleteAssets(manager, images);

        return manager.delete(Speaker, guids);
      });

      await this.assetService.deleteAssetFiles(images);

      return result;
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities'), () =>
        Logger.error(err.message, 'SpeakerProvider.deleteEntities')
      );
    }
  }

  private async _saveImage(file, guid: string) {
    // Stored at the size the site shows it, not as uploaded: photos of 1 MB and more made Presenters download 9 MB for
    // 255 px cards (#2352). Only a JPEG or PNG gets this far, named for its content (#2937); after that the file keeps its
    // name, though a PNG with no transparency may be stored as the smaller JPEG (#2426).
    file = refuseUnsafeImage(file, 'The photo');

    const fitted = await fitImage(file.buffer, SPEAKER_PHOTO_FIT);

    file = { ...file, buffer: fitted.buffer, size: fitted.buffer.length };

    // A token of its own in every name (#3091): uploads are served as immutable for a year, so a photo saved under the last
    // one's name (two uploads of headshot.jpg) would go on showing the old photo in every browser that had seen it.
    return this.assetService.saveAsset(this._resourcePath, file, 'speaker-image', {
      prefix: `${guid}-${randomBytes(4).toString('hex')}-`
    });
  }

  /**
   * Applies changes a speaker proposed through their edit link, once an admin approves them (#2936): only the bio,
   * affiliation and social links, and the photo if one came. Unlike `updateWithInfo`, nothing else is read from the
   * input, so the speaker's other fields (active, organizer) stay as they are.
   */
  public async applySelfEdit(
    guid: string,
    fields: {
      description?: string | null;
      affiliation?: string | null;
      socialMedia?: string | null;
      graduationYear?: string | null;
      university?: { guid: string } | null;
    },
    photo?: { buffer: Buffer; originalname: string; mimetype?: string; size?: number }
  ) {
    const existing = await this.speakerRepo.findOne({
      where: { guid },
      relations: EntityRelationsLUT.getRelation('speaker')
    });

    if (!existing) {
      throw new NotFoundException('Speaker not found.');
    }

    const image = photo ? await this._saveImage(photo, guid) : undefined;
    const changes: Partial<Speaker> = {};

    for (const key of ['description', 'affiliation', 'socialMedia', 'graduationYear'] as const) {
      if (fields[key] !== undefined && fields[key] !== null) {
        changes[key] = fields[key];
      }
    }

    // A university is a choice from the season's list, by guid (#2953).
    if (fields.university?.guid) {
      changes.university = { guid: fields.university.guid } as Speaker['university'];
    }

    return this.speakerRepo.save({ ...existing, ...changes, ...(image ? { images: [image] } : {}) });
  }
}

export interface OldFormatSpeaker {
  SpeakerFirstName: string;
  SpeakerLastName: string;
  SpeakerEmail: string;
  SpeakerOrganization: string;
  isActive: number;
  tamuYear: string;
  tamuDegree: string;
  tamuProgram: string;
  affiliation: string;
  description: string;
  university: '';
  hexColor: '';
}
