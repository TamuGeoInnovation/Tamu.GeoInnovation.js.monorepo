import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  FindOptionsRelations,
  Relation,
  Unique
} from 'typeorm';

import { TIMESTAMP_COLUMN } from './timestamps';

// TODO:

/**
 * A flat object of primitive values, as a GeoJSON feature's `properties`. Lives here, beside its only users (this file and
 * the GeoJSON interceptor), since it moved out of `libs/oidc/common` (#2155).
 */
export interface ValidObject {
  [key: string]: boolean | string | number;
}

@Entity()
export class OldCompetitionEntity extends BaseEntity {
  @PrimaryColumn()
  public id: number;

  @Column({
    name: 'Guid'
  })
  public guid: string;

  @Column({
    name: 'accountGuid'
  })
  public accountGuid?: string;

  @Column({
    name: 'Added'
  })
  public added: Date;

  @Column({
    name: 'Season'
  })
  public season: string;

  @Column({
    name: 'Lat'
  })
  public latitude: number;

  @Column({
    name: 'Lon'
  })
  public longitude: number;

  @Column({
    name: 'Accuracy'
  })
  public accuracy: number;

  @Column({
    name: 'FixTime'
  })
  public fixTime: string;

  @Column({
    name: 'Heading'
  })
  public heading: number;

  @Column({
    name: 'Altitude'
  })
  public altitude: number;

  @Column({
    name: 'AltitudeAccuracy'
  })
  public altitudeAccuracy: number;

  @Column({
    name: 'Speed'
  })
  public speed: number;

  public geoJsonRepresentation(): IGeoJsonFeature {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [this.longitude, this.latitude]
      },
      properties: {
        latitude: this.latitude,
        longitude: this.longitude,
        accuracy: this.accuracy,
        fixTime: this.fixTime,
        heading: this.heading,
        altitude: this.altitude,
        altitudeAccuracy: this.altitudeAccuracy,
        speed: this.speed
      }
    };
  }
}

@Entity()
export class TimeStampEntity extends BaseEntity {
  // The server's clock with its offset, not getdate() (#2926): see TIMESTAMP_COLUMN.
  @UpdateDateColumn(TIMESTAMP_COLUMN)
  public updated: Date;

  @CreateDateColumn(TIMESTAMP_COLUMN)
  public created: Date;
}

@Entity()
export class GuidIdentity extends TimeStampEntity {
  @PrimaryColumn()
  public guid: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined || this.guid === '' || this.guid === null) {
      this.guid = crypto.randomUUID();
    }
  }
}

@Entity({ name: 'seasons' })
export class Season extends GuidIdentity {
  @Column({ nullable: false })
  public year: number;

  @Column({ default: false })
  public active: boolean;

  /**
   * When each competition stops taking new submissions and edits, and when, later, the files attached to them close:
   * poster and presentation (#2934), paper and cartography (#2962). Empty leaves that side open.
   * `@tamu-gisc/gisday/common`'s `SUBMISSION_DEADLINE_FIELDS` names them all, and `closedAt` reads them; a test checks
   * every field it names is a column here.
   */
  @Column({ type: 'datetimeoffset', nullable: true })
  public posterSubmissionsCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public posterFilesCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public presentationSubmissionsCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public presentationFilesCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public paperSubmissionsCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public paperFilesCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public cartographySubmissionsCloseAt?: Date | null;

  @Column({ type: 'datetimeoffset', nullable: true })
  public cartographyFilesCloseAt?: Date | null;

  /**
   * The research competitions the season runs, one row each, as `@tamu-gisc/gisday/common`'s `seasonCompetitions` reads
   * them; none runs every one (#2948). Set from the competitions' admin page. Loaded with every season, so a page or a
   * check that has a season has them too. Written only by `SeasonService.setCompetitionTypes`, so no cascade.
   */
  @OneToMany(() => SeasonCompetition, (competition) => competition.season, { eager: true })
  public competitions?: SeasonCompetition[];

  // Season has multiple days
  @OneToMany(() => SeasonDay, (seasonDay) => seasonDay.season, { cascade: true, onDelete: 'CASCADE' })
  public days: SeasonDay[];

  @OneToMany(() => InitialSurveyResponse, (response) => response.season, { cascade: true })
  public initialSurveyResponses: InitialSurveyResponse[];

  @OneToMany(() => EventRatingQuestion, (question) => question.season, { cascade: true })
  public eventRatingQuestions: EventRatingQuestion[];

  @OneToMany(() => Speaker, (speaker) => speaker.season, { cascade: true })
  public speakers: Speaker[];

  @OneToMany(() => Organization, (organization) => organization.season, { cascade: true })
  public organizations: Organization[];

  @OneToMany(() => Sponsor, (sponsor) => sponsor.season, { cascade: true })
  public sponsors: Sponsor[];

  @OneToMany(() => Class, (cl) => cl.season, { cascade: true })
  public classes: Class[];

  @OneToMany(() => Submission, (submission) => submission.season, { cascade: true })
  public submissions: Submission[];

  @OneToMany(() => EventBroadcast, (broadcast) => broadcast.season, { cascade: true })
  public broadcasts: EventBroadcast[];

  @OneToMany(() => EventLocation, (location) => location.season, { cascade: true })
  public event_locations: EventLocation[];

  @OneToMany(() => Place, (place) => place.season, { cascade: true })
  public places: Place[];

  @OneToMany(() => Tag, (tag) => tag.season, { cascade: true })
  public tags: Tag[];

  @OneToMany(() => University, (university) => university.season, { cascade: true })
  public universities: University[];

  @OneToMany(() => Event, (event) => event.season, { nullable: true })
  public events: Event[];

  public static incrementYear(season: Season): Season {
    return this.getRepository().create({
      year: season.year + 1
    });
  }

  public static createForCurrentYear() {
    return this.getRepository().create({
      year: new Date().getFullYear()
    });
  }
}

/**
 * A research competition in a season (#2948): one row per season and competition. A row of its own, rather than a list
 * on the season, so that a setting for one season's competition can be added here as a column. A season with no row
 * that `runs` runs every competition. The competition's settings for the season (#3019) are columns here too, so a row
 * may hold only settings (`runs` empty) in a season that runs every competition. `CompetitionSettingsRow` in
 * `@tamu-gisc/gisday/common` reads them.
 */
@Entity({ name: 'season_competitions' })
@Unique(['season', 'competitionType'])
export class SeasonCompetition extends GuidIdentity {
  @ManyToOne(() => Season, (season) => season.competitions, { nullable: false, onDelete: 'CASCADE' })
  public season: Season;

  /** `poster`, `presentation`, `paper` or `cartography`: `DEADLINE_COMPETITIONS` in `@tamu-gisc/gisday/common`. */
  @Column({ type: 'nvarchar', length: 50, nullable: false })
  public competitionType: string;

  /**
   * True when the season runs the competition, as every row meant before #3019; empty on a row that holds only settings.
   * Written by `SeasonService.setCompetitionTypes`.
   */
  @Column({ type: 'bit', nullable: true, default: true })
  public runs?: boolean | null;

  /**
   * The competition's session, chosen in Admin (#3019): the poster session, or the undergraduate presentation session.
   * An event's id, without a foreign key: SQL Server allows one cascading key between two tables, and a session that no
   * longer exists falls back to the `COMPETITION:` names, as an unchosen one does.
   */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  public sessionGuid?: string | null;

  /** The graduate presentation session (#3019). An event's id, as `sessionGuid`. */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  public graduateSessionGuid?: string | null;

  /** The session the competition's winners are announced at (#3019). An event's id, as `sessionGuid`. */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  public awardsSessionGuid?: string | null;

  /** When the competition's finalists hear (#3019, 7A): on its page when set, and the line left out when not. */
  @Column({ type: 'datetimeoffset', nullable: true })
  public finalistsNotifiedAt?: Date | null;
}

@Entity({ name: 'seasons_days' })
export class SeasonDay extends GuidIdentity {
  @Column({ nullable: false })
  public date: Date;

  @OneToMany(() => Event, (event) => event.day, { cascade: true })
  public events: Event[];

  // Season day belongs to a season
  @ManyToOne(() => Season, (season) => season.days, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  public season: Season;
}

@Entity({
  name: 'places'
})
export class Place extends GuidIdentity {
  @Column({ nullable: true })
  public name?: string;

  @Column({ nullable: true })
  public address?: string;

  @Column({ nullable: true })
  public city?: string;

  @Column({ nullable: true })
  public state?: string;

  @Column({ nullable: true })
  public zip?: string;

  @Column({ nullable: true })
  public website?: string;

  @Column({ nullable: true, type: 'simple-json' })
  public visibilitySettings?: Array<string>;

  @OneToMany(() => EventLocation, (location) => location.place, { cascade: true })
  public locations?: EventLocation[];

  @OneToMany(() => PlaceLink, (link) => link.place, { cascade: true })
  public links: PlaceLink[];

  @OneToMany(() => Asset, (asset) => asset.places, { cascade: true, nullable: true })
  public logos?: Asset[];

  @ManyToOne(() => Season, (season) => season.places, { nullable: true, onDelete: 'CASCADE' })
  public season?: Season;
}

@Entity({
  name: 'event_broadcast'
})
export class EventBroadcast extends GuidIdentity {
  @Column({ nullable: true })
  public name?: string;

  @Column({ nullable: true, length: 'MAX' })
  public presenterUrl?: string;

  @Column({ nullable: true })
  public password?: string;

  @Column({ nullable: true })
  public phoneNumber?: string;

  @Column({ nullable: true })
  public meetingId?: string;

  @Column({ nullable: true, length: 'MAX' })
  public publicUrl?: string;

  @Column({ nullable: true, length: 'MAX' })
  public details?: string;

  @OneToMany(() => Event, (event) => event.broadcast, { cascade: true })
  public events?: Event[];

  /**
   * The organization the broadcast belongs to (#3048), as a venue's place is: each site's admin lists only its own
   * places' broadcasts, in Admin > Broadcasts and an event's Broadcast drop-down. Empty for one made before this, until
   * kubernetes-config's set-broadcast-places.ps1 gives it the place of the sessions that use it, or an admin sets it.
   */
  @ManyToOne(() => Place, { nullable: true })
  public place?: Place;

  @ManyToOne(() => Season, (season) => season.broadcasts, { onDelete: 'CASCADE' })
  public season?: Season;
}

@Entity({
  name: 'event_location'
})
export class EventLocation extends GuidIdentity {
  @Column({ nullable: true })
  public room?: string;

  @Column({ nullable: true })
  public building?: string;

  @Column({ nullable: true })
  public capacity?: number;

  @Column({ nullable: true })
  public link?: string;

  /**
   * Location is typically inherited from the place, but can be overridden.
   *
   * This is useful for when a location is not within a place, but instead in a surrounding
   * area, such as a restaurant or conference center.
   */
  @Column({ nullable: true })
  public streetAddressOverride?: string;

  /**
   * Where an attendee must be to check in to an in-person event here: the zone's corners, in order
   * around it (#1766). Without one, check-in needs no location.
   */
  @Column({ nullable: true, type: 'simple-json' })
  public checkInZone?: Array<{ latitude: number; longitude: number }>;

  @OneToMany(() => Event, (event) => event.location, { nullable: true, cascade: true })
  public events?: Event[];

  // Null when it has none, or its place was deleted.
  @ManyToOne(() => Place, (place) => place.locations, { nullable: true })
  public place: Place | null;

  @ManyToOne(() => Season, (season) => season.event_locations, { nullable: true, onDelete: 'CASCADE' })
  public season?: Season;
}

@Entity({
  name: 'events'
})
export class Event extends GuidIdentity {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: false, default: true })
  public active: boolean;

  @Column({ nullable: true, length: 'MAX' })
  public abstract: string;

  @Column({ nullable: true })
  public startTime: string;

  @Column({ nullable: true })
  public endTime: string;

  @Column({ nullable: true, default: 0, select: false })
  public observedAttendeeStart: number;

  @Column({ nullable: true, default: 0, select: false })
  public observedAttendeeEnd: number;

  @Column({ nullable: true })
  public capacity: number;

  @Column({ nullable: true, length: 'MAX' })
  public resources: string | null;

  @Column({ nullable: true })
  public requiresRsvp: boolean;

  /**
   * Unused since 2020: free text nothing read. Its form field went with #2560; the column is dropped in
   * the release after, as a removal waits a release (docs/gisday-migrations.md).
   */
  @Column({ nullable: true })
  public qrCode: string;

  /**
   * The secret in a hybrid or virtual session's check-in QR code (#2560), made the first time an
   * organizer asks for the code. Never selected unless asked for, so no event the API returns carries it.
   */
  @Column({ nullable: true, length: 64, select: false })
  public checkInCode?: string | null;

  /**
   * Minutes before the session's start that attendees may check in (#3209). 5 unless an organizer changes it.
   */
  @Column({ nullable: false, default: 5 })
  public checkInMinutesBefore: number;

  /**
   * Minutes after the session's end that attendees may still check in (#3209). 10 unless an organizer changes it.
   */
  @Column({ nullable: false, default: 10 })
  public checkInMinutesAfter: number;

  /**
   * Whether attendees may check in at any time, not only in its check-in window (`checkInMinutesBefore` and
   * `checkInMinutesAfter`) (#2635). Every other rule still applies: the zone, the QR code. A check-in outside the
   * session's time is marked `outsideSessionTime`.
   */
  @Column({ nullable: false, default: false })
  public checkInAnyTime: boolean;

  /**
   * The session has no slides (#3147): a panel, a social, lunch. Its speakers are not asked for slides, and cannot upload
   * any for it.
   */
  @Column({ nullable: false, default: false })
  public noSlides: boolean;

  @Column({ nullable: true })
  public mode: string;

  @Column({ nullable: true })
  public eventType: string;

  @Column({ nullable: true })
  public presentationType: string;

  @Column({ nullable: true, default: true })
  public isAcceptingRsvps: boolean;

  @Column({ nullable: true, default: false })
  public isBringYourOwnDevice: boolean;

  @Column({ nullable: true, length: 'MAX' })
  public requirements: string | null;

  @ManyToOne(() => SeasonDay, (day) => day.events, { onDelete: 'SET NULL', orphanedRowAction: 'nullify' })
  public day: SeasonDay;

  @ManyToOne(() => Season, (season) => season.events)
  public season: Season;

  @ManyToMany(() => Speaker, (speaker) => speaker.events, { nullable: true })
  @JoinTable({
    name: 'event_speakers'
  })
  public speakers?: Speaker[];

  @ManyToMany(() => Tag, { nullable: true })
  @JoinTable({
    name: 'event_tags'
  })
  public tags?: Tag[];

  // Null clears it: when its broadcast or location is deleted, and the broadcast for a visitor who is not signed in.
  @ManyToOne(() => EventBroadcast, (broadcast) => broadcast.events)
  public broadcast?: EventBroadcast | null;

  @ManyToOne(() => EventLocation, (location) => location.events, { nullable: true })
  public location?: EventLocation | null;

  @ManyToMany(() => CourseCredit)
  @JoinTable({ name: 'event_course_credits' })
  public courseCredit?: CourseCredit[];

  @ManyToMany(() => Sponsor, { orphanedRowAction: 'delete' })
  @JoinTable({
    name: 'event_sponsors'
  })
  public sponsors?: Sponsor[];

  /**
   * The research competition the session's judges score (#3183): `graduate-poster`, `undergraduate-poster`,
   * `graduate-presentation` or `undergraduate-presentation` (`JUDGED_COMPETITIONS` in `@tamu-gisc/gisday/common`), or
   * null for a session that judges none.
   */
  @Column({ type: 'nvarchar', length: 50, nullable: true })
  public judgedCompetition?: string | null;

  /** Whether the admins have closed judging for the session (#3183): its judges can no longer change their scores. */
  @Column({ nullable: false, default: false })
  public judgingClosed: boolean;

  /**
   * The session's speakers who judge its competition (#3183), each sent their own judging link. Never more than its
   * speakers: the API refuses a judge who is not one. Not loaded unless asked for, so the public pages do not list them.
   */
  @ManyToMany(() => Speaker)
  @JoinTable({ name: 'event_judges' })
  public judges?: Speaker[];
}

@Entity({
  name: 'question_types'
})
export class QuestionType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;

  public question: InitialSurveyQuestion;
}

@Entity({
  name: 'initial_survey_questions'
})
export class InitialSurveyQuestion extends GuidIdentity {
  @ManyToOne(() => QuestionType, (token) => token.question, { eager: true })
  public questionType: QuestionType;

  @Column({ nullable: true })
  public questionText: string;

  @Column({ nullable: true })
  public questionOptions: string;
}

@Entity({
  name: 'initial_survey_responses'
})
export class InitialSurveyResponse extends GuidIdentity {
  @ManyToOne(() => Season, (season) => season.initialSurveyResponses, { cascade: false, nullable: true })
  public season: Season;

  @Column({ nullable: false })
  public accountGuid: string; // User

  @ManyToOne(() => InitialSurveyQuestion, { cascade: true, eager: true })
  public question: InitialSurveyQuestion;

  @Column({ nullable: false })
  public responseValue: string;
}

@Entity({
  name: 'event_rating_questions'
})
export class EventRatingQuestion extends GuidIdentity {
  @ManyToOne(() => Season, (season) => season.eventRatingQuestions, { cascade: false, nullable: true })
  public season: Season;

  @Column({ nullable: true })
  public userEditable: boolean;

  @Column({ nullable: true })
  public type: 'scale-normal' | 'boolean' | 'text' | 'multiple-option' | string;

  @Column({ nullable: true })
  public text: string;

  @Column({ nullable: true })
  public options: string; // Should be | (pipe) delimited

  @OneToMany(() => EventRatingResponse, (response) => response.question, { cascade: true })
  public responses: EventRatingResponse[];
}

@Entity({
  name: 'event_rating_responses'
})
export class EventRatingResponse extends GuidIdentity {
  @ManyToOne(() => Event, { cascade: false, nullable: true })
  public event: Event;

  @ManyToOne(() => EventRatingQuestion, { cascade: false, nullable: true }) // Maybe many-to-many?
  public question: EventRatingQuestion;

  //TODO: Add the user / account guid

  @Column({ nullable: true, length: 'MAX' })
  public response: string;
}

@Entity({
  name: 'universities'
})
export class University extends GuidIdentity {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public acronym?: string;

  @Column({ nullable: true })
  public hexTriplet?: string;

  @ManyToOne(() => Season, (season) => season.universities, { nullable: true, onDelete: 'CASCADE' })
  public season: Season;
}

@Entity({
  name: 'speaker_roles'
})
export class SpeakerRole extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;
}

@Entity({
  name: 'organizations'
})
export class Organization extends GuidIdentity {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public acronym: string;

  @Column({ nullable: true })
  public website: string;
  y;
  @Column({ nullable: true, length: 'MAX' })
  public text: string;

  @Column({ nullable: true })
  public contactFirstName: string;

  @Column({ nullable: true })
  public contactLastName: string;

  @Column({ nullable: true })
  public contactEmail: string;

  @OneToMany(() => Asset, (asset) => asset.organization, { cascade: true, nullable: true })
  public logos?: Asset[];

  @OneToMany(() => Speaker, (speaker) => speaker.organization, { cascade: true, nullable: true })
  public speakers: Speaker[];

  @ManyToOne(() => Season, (season) => season.organizations, { onDelete: 'CASCADE' })
  public season: Season;
}

@Entity({
  name: 'place_links'
})
export class PlaceLink extends GuidIdentity {
  @Column({ nullable: false })
  public label: string;

  @Column({ nullable: false })
  public url: string;

  @ManyToOne(() => Place, (place) => place.links, { onDelete: 'CASCADE' })
  public place: Place[];
}

@Entity({
  name: 'speakers'
})
export class Speaker extends GuidIdentity {
  @Column({ nullable: true })
  public firstName: string;

  @Column({ nullable: true })
  public lastName: string;

  @Column({ nullable: true })
  public email: string;

  @Column({ nullable: true })
  public isActive: boolean;

  @Column({ nullable: true, default: false })
  public isOrganizer: boolean;

  @Column({ nullable: true })
  public graduationYear: string;

  @Column({ nullable: true })
  public degree: string;

  @Column({ nullable: true })
  public program: string;

  @Column({ nullable: true })
  public affiliation: string;

  @Column({ nullable: true, length: 'MAX' })
  public description: string;

  @Column({ nullable: true })
  public socialMedia: string;

  @Column({ nullable: true })
  public accountGuid: string;

  /** When an admin marked this speaker's name badge printed, or null if it is not (#2908). */
  @Column({ type: 'datetimeoffset', nullable: true })
  public badgePrintedAt: Date | null;

  /**
   * What the printed badge said, as exported (name, organization, class year), so the badges page can say when the
   * speaker has changed since: comparing times would not do, because marking the badge also updates the record.
   */
  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  public badgePrintedText: string | null;

  @ManyToMany(() => Event, (event) => event.speakers, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  public events: Event[];

  @ManyToOne(() => Season, (season) => season.speakers, { nullable: true })
  public season: Season;

  // Null when the speaker has none, or theirs was deleted.
  @ManyToOne(() => Organization, (o) => o.speakers, { nullable: true })
  public organization: Organization | null;

  // Null when the speaker has none, or theirs was deleted.
  @ManyToOne(() => University, { nullable: true })
  public university?: University | null;

  @OneToMany(() => Asset, (asset) => asset.speaker, { cascade: true, nullable: true })
  public images?: Asset[];
}

@Entity({
  name: 'tags'
})
export class Tag extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  @ManyToOne(() => Season, (season) => season.tags, { nullable: true })
  public season: Season;
}

/**
 * The sizes a sponsor's logo can be drawn at on the Sponsors page, smallest first (#2638).
 */
export type SponsorLogoSize = 'small' | 'regular' | 'large' | 'extra-large';

@Entity({
  name: 'sponsors'
})
export class Sponsor extends GuidIdentity {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public website: string;

  @Column({ nullable: true })
  public contactFirstName: string;

  @Column({ nullable: true })
  public contactLastName: string;

  @Column({ nullable: true })
  public contactEmail: string;

  @Column({ nullable: true, length: 'MAX' })
  public description: string;

  @Column({ nullable: true })
  public sponsorshipLevel: 'point' | 'line' | 'polygon' | 'raster' | 'lidar' | string;

  @Column({ nullable: true })
  public sponsorshipAmount: string;

  /**
   * Whether the sponsor is shown on the public site for its season. A sponsor carried over from a
   * past season stays here, switched off, until it confirms, so its details and logo are kept (#1962).
   */
  @Column({ nullable: false, default: true })
  public active: boolean;

  /**
   * How large the sponsor's logo is drawn on the public Sponsors page, so a logo with small detail
   * can be shown bigger than its neighbours. Existing sponsors are `regular`, the size before (#2638).
   */
  @Column({ nullable: false, default: 'regular' })
  public logoSize: SponsorLogoSize;

  @ManyToOne(() => Season, (season) => season.sponsors)
  public season: Season;

  @OneToMany(() => Asset, (asset) => asset.sponsor, { cascade: true, nullable: true })
  public logos?: Asset[];
}

@Entity({
  name: 'assets'
})
export class Asset extends GuidIdentity {
  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public path: string;

  @Column({ nullable: true })
  public type: string;

  @ManyToOne(() => Place, (o) => o.logos, { nullable: true })
  public places?: Place;

  @ManyToOne(() => Organization, (o) => o.logos, { nullable: true })
  public organization?: Organization;

  @ManyToOne(() => Speaker, (s) => s.images, { nullable: true })
  public speaker?: Speaker;

  @ManyToOne(() => Sponsor, (s) => s.logos, { nullable: true })
  public sponsor?: Sponsor;

  /**
   * A file a student attached to their submission (#2933): `name` is the name it was uploaded with, `path` where it is
   * kept under APP_DATA. Deleted with its submission.
   */
  // Relation<>: Submission is declared further down this file, and a plain type would be read before it exists.
  @ManyToOne(() => Submission, (s) => s.files, { nullable: true, onDelete: 'CASCADE' })
  public submission?: Relation<Submission>;

  /**
   * A session's slides, uploaded by one of its speakers from their edit link (#3093), kept as a submission's files are.
   * Seen by the admins, and by the speaker who uploaded them. Deleted with its session.
   */
  @ManyToOne(() => Event, { nullable: true, onDelete: 'CASCADE' })
  public event?: Relation<Event>;

  /**
   * The speaker who uploaded a session's slides (#3093): each speaker sees and removes only their own, up to three a
   * session, and the admins see who uploaded each. Not `speaker`, which is the speaker's photo: everything that reads a
   * speaker's `images` (the public speaker list, the avatar, a season's copy, a photo's replacement) would take the
   * slides for photos. Kept, with no uploader, if the speaker is deleted.
   */
  @ManyToOne(() => Speaker, { nullable: true, onDelete: 'SET NULL' })
  public uploadedBy?: Relation<Speaker>;
}

/**
 * A personal link that lets one speaker propose changes to their own presenter profile without an account (#2936). Only
 * a hash of its token is kept, so a copy of the database holds no working links. It works until `expires`, as often as
 * the speaker likes; each use replaces their pending edit.
 */
@Entity({ name: 'speaker_edit_links' })
export class SpeakerEditLink extends GuidIdentity {
  @ManyToOne(() => Speaker, { nullable: false, onDelete: 'CASCADE' })
  public speaker: Relation<Speaker>;

  /** SHA-256 of the token, hex. */
  @Column({ length: 64 })
  public tokenHash: string;

  @Column({ type: 'datetimeoffset' })
  public expires: Date;

  /** The address the link was emailed to. */
  @Column({ nullable: true })
  public sentTo: string;

  /**
   * What the link opens (#3183): `profile`, the speaker's presenter page and their sessions' slides, or `judging`, the
   * competition they judge. Each link's own routes accept only their own purpose, so neither opens the other's page.
   */
  @Column({ type: 'nvarchar', length: 20, nullable: false, default: 'profile' })
  public purpose: SpeakerLinkPurpose;
}

/** What a speaker's link opens (#3183). */
export type SpeakerLinkPurpose = 'profile' | 'judging';

/**
 * One email the site sent one speaker (#3167): which email, about which session, when, to which address and from whom.
 * The admin pages read these to show how many times, and when, each person was sent each email, and to tick only those
 * not yet sent one. A "together" email is one row per speaker on it. Kept with the speaker, and gone with them.
 *
 * The session is its id, not a relation: a session deleted later leaves the record of what was sent.
 */
@Entity({ name: 'speaker_email_sends' })
export class SpeakerEmailSend extends GuidIdentity {
  @ManyToOne(() => Speaker, { nullable: false, onDelete: 'CASCADE' })
  public speaker: Relation<Speaker>;

  /** Which email: `PROFILE_EMAIL_KIND`, `SESSION_DETAILS_EMAIL_KIND`, `SLIDES_REQUEST_EMAIL_KIND`. */
  @Column({ length: 50 })
  public kind: string;

  /** The session it was about, for a session's emails; none for the profile email. */
  @Column({ nullable: true, length: 36 })
  public eventGuid: string | null;

  /** The address it was sent to. */
  @Column({ nullable: true })
  public sentTo: string | null;

  /** Who it was from, as the From line said. */
  @Column({ nullable: true })
  public sentFrom: string | null;
}

/**
 * Changes a speaker proposed to their own profile (#2936), waiting for an admin. Nothing here reaches the public site
 * until it is approved. A speaker has at most one pending edit; sending another replaces it.
 */
@Entity({ name: 'speaker_edits' })
export class SpeakerEdit extends GuidIdentity {
  @ManyToOne(() => Speaker, { nullable: false, onDelete: 'CASCADE' })
  public speaker: Relation<Speaker>;

  @Column({ nullable: true, length: 'MAX' })
  public description: string | null;

  @Column({ nullable: true })
  public affiliation: string | null;

  @Column({ nullable: true })
  public socialMedia: string | null;

  /** The class year a presenter card shows after the name, as the admin form takes it: "2018", or "2014, 2016" (#2953). */
  @Column({ nullable: true, length: 50 })
  public graduationYear: string | null;

  /** The university, chosen from the season's list (#2953). Kept if the university is deleted, without it. */
  @ManyToOne(() => University, { nullable: true, onDelete: 'SET NULL' })
  public university?: Relation<University> | null;

  /** A proposed photo, under APP_DATA, until it is approved or rejected. */
  @Column({ nullable: true })
  public photoPath: string | null;

  @Column({ default: 'pending' })
  public status: 'pending' | 'approved' | 'rejected' | string;

  @Column({ type: 'datetimeoffset', nullable: true })
  public reviewedAt: Date | null;

  /** The admin's account id. */
  @Column({ nullable: true })
  public reviewedBy: string | null;
}

/**
 * The repeat guard of a session's speaker emails (#3098, #3260): one row a speaker was sent one email about one session,
 * claimed before the email goes, with when (`created`). Every copy of the API reads these (`RepeatGuard`), so a send
 * repeated within `REPEAT_SEND_MINUTES` is caught whichever copy it reaches. Who it was from, and to which address, is
 * the send record's (`SpeakerEmailSend`, #3167), which is written once the email has gone.
 */
@Entity({ name: 'speaker_email_claims' })
export class SpeakerEmailClaim extends GuidIdentity {
  /** Which email: `SESSION_DETAILS_EMAIL_KIND`, `SLIDES_REQUEST_EMAIL_KIND`, `JUDGING_EMAIL_KIND`. */
  @Column({ length: 50 })
  public kind: string;

  @ManyToOne(() => Event, { nullable: false, onDelete: 'CASCADE' })
  public session: Relation<Event>;

  @ManyToOne(() => Speaker, { nullable: false, onDelete: 'CASCADE' })
  public speaker: Relation<Speaker>;
}

@Entity({
  name: 'checkins'
})
export class CheckIn extends GuidIdentity {
  @ManyToOne(() => Event, { nullable: true, cascade: false, onDelete: 'SET NULL' })
  public event: Event;

  @Column({ nullable: false })
  public accountGuid: string;

  /**
   * Made outside the session's time, which a session open at any time allows (#2635). Decided when the
   * check-in is made, so moving the session later does not change it. Organizers' check-ins are never marked.
   */
  @Column({ nullable: false, default: false })
  public outsideSessionTime: boolean;
}

@Entity({
  name: 'classes'
})
export class Class extends GuidIdentity {
  @Column({ nullable: true })
  public professorName: string;

  @Column({ nullable: true })
  public title: string;

  @Column({ nullable: true })
  public code: string;

  @Column({ nullable: true })
  public number: string;

  @Column({ nullable: true })
  public section: string;

  @ManyToOne(() => Season, (season) => season.classes, { nullable: true, onDelete: 'CASCADE' })
  public season: Season;

  @OneToMany(() => UserClass, (userClass) => userClass.class)
  public students: UserClass[];
}

@Entity({
  name: 'course_credits'
})
export class CourseCredit extends GuidIdentity {
  @ManyToOne(() => Event, { nullable: true })
  public event?: Event;

  @ManyToOne(() => Class, { nullable: true })
  public class?: Class;
}

@Entity({
  name: 'submission_types'
})
export class SubmissionType extends GuidIdentity {
  @Column({ nullable: false })
  public type: 'presentation' | 'poster' | 'high_school' | string;
}

@Entity({
  name: 'rsvp_types'
})
export class RsvpType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;
}

@Entity({
  name: 'user_info'
})
export class UserInfo extends GuidIdentity {
  @Column({ nullable: true })
  public accountGuid: string;

  @Column({ nullable: true })
  public uin: string;

  @Column({ nullable: true })
  public fieldOfStudy: string;

  @Column({ nullable: true })
  public classification: string;

  @Column({ nullable: true })
  public participantType: string;

  @Column({ nullable: true })
  public hasCompletedInitialSurvey: string;
}

@Entity({
  name: 'user_classes'
})
export class UserClass extends GuidIdentity {
  @Column({ nullable: false })
  public accountGuid: string;

  @ManyToOne(() => Class, { eager: true, orphanedRowAction: 'nullify', onDelete: 'SET NULL' })
  @JoinColumn()
  public class: Class;
}

@Entity({
  name: 'user_rsvps'
})
export class UserRsvp extends GuidIdentity {
  @Column({ nullable: false })
  public accountGuid: string;

  @ManyToOne(() => Event, { nullable: true, eager: true, onDelete: 'SET NULL' })
  public event: Event;

  @ManyToOne(() => RsvpType, { eager: true })
  public rsvpType: RsvpType;
}

export enum PRESENTATION_SUBMISSION_TYPE {
  PRESENTATION = 'presentation',
  PAPER = 'paper',
  POSTER = 'poster',
  CARTOGRAPHY = 'cartography'
}

export enum PRESENTATION_FORMAT {
  INDIVIDUAL = 'individual',
  GROUP = 'group'
}

export enum PRESENTATION_STUDENT_TYPE {
  UNDERGRADUATE = 'undergraduate',
  GRADUATE = 'graduate'
}

@Entity({
  name: 'submissions'
})
export class Submission extends GuidIdentity {
  @Column({ nullable: true })
  public accountGuid: string;

  @Column({ nullable: true })
  public title: string;

  @Column({ nullable: true, type: 'simple-json' })
  public participants: Array<{ name: string; email: string; studentId?: string }>;

  @Column({ nullable: true, length: 'MAX' })
  public abstract: string;

  @Column({ nullable: true, length: 'MAX' })
  public link: string;

  @Column({ default: false })
  public reviewed: boolean;

  @Column({ default: false })
  public acceptance: boolean;

  @Column({ length: 'MAX', nullable: true })
  public message: string | null;

  @Column({ nullable: true })
  public format: PRESENTATION_FORMAT | string;

  @Column({ nullable: true })
  public submissionType: PRESENTATION_SUBMISSION_TYPE | string;

  @Column({ nullable: true })
  public classificationType: PRESENTATION_STUDENT_TYPE | string;

  @ManyToOne(() => Season, (season) => season.submissions, { nullable: true })
  public season: Season;

  /** The slides or poster the student attached (#2933). Not loaded unless asked for. */
  @OneToMany(() => Asset, (asset) => asset.submission)
  public files?: Asset[];
}

/**
 * The rubric judges score a season's competition against (#3183): one per season for posters and one for research
 * presentations, graduate and undergraduate alike. Its criteria are rows of their own, so a judge's score for a criterion
 * is kept by the criterion's id. It goes with its season.
 */
@Entity({ name: 'rubrics' })
@Unique(['season', 'competitionType'])
export class Rubric extends GuidIdentity {
  @ManyToOne(() => Season, { nullable: false, onDelete: 'CASCADE' })
  public season: Relation<Season>;

  /** `poster` or `presentation`: `RUBRIC_COMPETITION_TYPES` in `@tamu-gisc/gisday/common`. */
  @Column({ type: 'nvarchar', length: 20, nullable: false })
  public competitionType: string;

  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: true, length: 'MAX' })
  public description: string | null;

  @OneToMany(() => RubricCriterion, (criterion) => criterion.rubric)
  public criteria?: Array<RubricCriterion>;
}

/** One criterion of a rubric (#3183): what is judged, the most it scores, and the levels of work it describes. */
@Entity({ name: 'rubric_criteria' })
export class RubricCriterion extends GuidIdentity {
  @ManyToOne(() => Rubric, (rubric) => rubric.criteria, { nullable: false, onDelete: 'CASCADE' })
  public rubric: Relation<Rubric>;

  /** Its place in the rubric, from 0. */
  @Column({ type: 'int', nullable: false })
  public position: number;

  @Column({ nullable: false })
  public name: string;

  @Column({ type: 'int', nullable: false })
  public maxPoints: number;

  /** Each level of work, best first: its label ("Excellent (A)") and what work at that level looks like. */
  @Column({ type: 'simple-json', nullable: false })
  public levels: Array<{ label: string; description: string }>;
}

/**
 * One judge's scores for one submission (#3183): a score per criterion of the rubric, by the criterion's id, their total,
 * worked out by the API, and a comment. A judge has one per submission, which they change until judging closes. It goes
 * with the judge or the submission; the session is its id, as the email record keeps it, and the rubric is kept if it is
 * deleted, without it.
 */
@Entity({ name: 'assessments' })
@Unique(['judge', 'submission'])
export class Assessment extends GuidIdentity {
  @ManyToOne(() => Speaker, { nullable: false, onDelete: 'CASCADE' })
  public judge: Relation<Speaker>;

  @ManyToOne(() => Submission, { nullable: false, onDelete: 'CASCADE' })
  public submission: Relation<Submission>;

  /** The session the judge scored it for. */
  @Column({ type: 'nvarchar', length: 36, nullable: false })
  public eventGuid: string;

  @ManyToOne(() => Rubric, { nullable: true, onDelete: 'SET NULL' })
  public rubric?: Relation<Rubric> | null;

  /** Each criterion's score, by the criterion's id. */
  @Column({ type: 'simple-json', nullable: false })
  public scores: Record<string, number>;

  @Column({ type: 'int', nullable: false })
  public total: number;

  @Column({ nullable: true, length: 'MAX' })
  public comment: string | null;
}

/**
 * One place a season's competition was won in (#3239): 1st, 2nd or 3rd of a judged competition, by a submission, picked
 * on the admins' Winners page and shown on gisday.tamu.edu's homepage once the season's GIS Day is over. The name and
 * title shown are the submission's, read when shown, so nothing is copied. A trail challenge (VGI) winner is a person,
 * kept by account (`accountGuid`), which has no picker yet. It goes with its season or its submission.
 */
@Entity({ name: 'season_winners' })
@Unique(['season', 'competition', 'place'])
export class SeasonWinner extends GuidIdentity {
  @ManyToOne(() => Season, { nullable: false, onDelete: 'CASCADE' })
  public season: Relation<Season>;

  /** A judged competition, as `JUDGED_COMPETITIONS` names them, or `trail`: `WINNER_COMPETITIONS` in `@tamu-gisc/gisday/common`. */
  @Column({ type: 'nvarchar', length: 40, nullable: false })
  public competition: string;

  /** 1, 2 or 3. */
  @Column({ type: 'int', nullable: false })
  public place: number;

  /** The winning submission, for a judged competition. */
  @ManyToOne(() => Submission, { nullable: true, onDelete: 'CASCADE' })
  public submission?: Relation<Submission> | null;

  /** The winner's account, for the trail challenge, whose winners are people rather than submissions. */
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  public accountGuid?: string | null;
}

@Entity({
  name: 'Signage_Categories'
})
export class SignageCategory {
  @Column()
  public id: number;

  @Column()
  public guid: string;

  @Column()
  public added: string;

  @Column()
  public name: string;

  @Column()
  public pointValue: number;
}

@Entity({
  name: 'Signage_Submissions'
})
export class SignageSubmission extends OldCompetitionEntity {
  @Column({
    name: 'SignType'
  })
  public signType: string;

  @Column({
    name: 'Description'
  })
  public description: string;
}

@Entity({
  name: 'Stormwater_Submissions'
})
export class StormwaterSubmission extends OldCompetitionEntity {
  @Column({
    name: 'Depth'
  })
  public depth: string;

  @Column({
    name: 'Flow'
  })
  public flow: string;

  @Column({
    name: 'Drain'
  })
  public drain: string;
}

@Entity({
  name: 'Sidewalk_Conditions'
})
export class SidewalkCondition {
  @PrimaryColumn()
  public id: number;

  @Column({
    name: 'Guid'
  })
  public guid: string;

  @Column({
    name: 'accountGuid'
  })
  public accountGuid: string;

  @Column({
    name: 'Added'
  })
  public added: string;

  @Column({
    name: 'TypeName'
  })
  public typeName: string;
}

@Entity({
  name: 'Sidewalk_Materials'
})
export class SidewalkMaterial {
  @PrimaryColumn()
  public id: number;

  @Column({
    name: 'Guid'
  })
  public guid: string;

  @Column({
    name: 'accountGuid'
  })
  public accountGuid: string;

  @Column({
    name: 'Added'
  })
  public added: string;

  @Column({
    name: 'TypeName'
  })
  public typeName: string;
}

@Entity({
  name: 'Sidewalk_Submissions'
})
export class SidewalkSubmission extends OldCompetitionEntity {
  @Column({
    name: 'MaterialGuid'
  })
  public materialGuid: string;

  @Column({
    name: 'ConditionGuid'
  })
  public conditionGuid: string;

  @Column({
    name: 'ConditionDescription'
  })
  public conditionDescription: string;
}

@Entity({
  name: 'manhole_submissions'
})
export class ManholeSubmission {
  @PrimaryColumn()
  public id: number;

  @Column({
    name: 'Guid'
  })
  public guid: string;

  @Column({
    name: 'accountGuid'
  })
  public accountGuid: string;

  @Column({
    name: 'added'
  })
  public added: string;

  @Column({
    name: 'lat'
  })
  public latitude: number;

  @Column({
    name: 'lon'
  })
  public longitude: number;

  @Column({
    name: 'accuracy'
  })
  public accuracy: number;

  @Column({
    name: 'fixTime'
  })
  public fixTime: string;
}

export const EntityRelationsLUT = {
  // A speaker's organization and university are what a session's presenter list shows under and
  // after their name (#1768).
  // Object form, as typeorm 1 requires: it rejects a string array at run time, and getRelation()'s result is untyped, so
  // the compiler cannot catch one here (#1218).
  event: {
    speakers: { images: true, organization: true, university: true },
    tags: true,
    sponsors: true,
    location: { place: true },
    broadcast: true,
    day: true
  } satisfies FindOptionsRelations<Event>,
  speaker: { images: true, university: true, organization: true } satisfies FindOptionsRelations<Speaker>,
  getRelation: (entity?: string) => {
    if (!entity) {
      return undefined;
    } else {
      return EntityRelationsLUT[entity.toLowerCase()];
    }
  }
};

export type EntityName = 'event' | 'speaker';

export const GISDAY_ENTITIES = [
  Season,
  SeasonCompetition,
  SeasonDay,
  CheckIn,
  Class,
  CourseCredit,
  Place,
  Event,
  EventBroadcast,
  EventLocation,
  InitialSurveyQuestion,
  InitialSurveyResponse,
  QuestionType,
  EventRatingQuestion,
  EventRatingResponse,
  Organization,
  RsvpType,
  Speaker,
  SpeakerRole,
  SpeakerEditLink,
  SpeakerEmailSend,
  SpeakerEdit,
  SpeakerEmailClaim,
  SubmissionType,
  Sponsor,
  Tag,
  UserClass,
  UserInfo,
  UserRsvp,
  Submission,
  University,
  Asset,
  PlaceLink,
  // Judging the research competitions (#3183).
  Rubric,
  RubricCriterion,
  Assessment,
  // A season's winners, on the homepage (#3239).
  SeasonWinner
];

export interface IGeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: ValidObject;
}
