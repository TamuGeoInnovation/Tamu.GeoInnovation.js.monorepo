import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { v4 as guid } from 'uuid';

import { ValidObject } from '@tamu-gisc/oidc/common';

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
  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
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
      this.guid = guid();
    }
  }
}

@Entity({ name: 'seasons' })
export class Season extends GuidIdentity {
  @Column({ nullable: false })
  public year: number;

  @Column({ default: false })
  public active: boolean;

  // Season has multiple days
  @OneToMany(() => SeasonDay, (seasonDay) => seasonDay.season, { cascade: true })
  public days: SeasonDay[];

  @OneToMany(() => InitialSurveyResponse, (response) => response.season, { cascade: true })
  public initialSurveyResponses: InitialSurveyResponse[];

  @OneToMany(() => EventRatingQuestion, (question) => question.season, { cascade: true })
  public eventRatingQuestions: EventRatingQuestion[];

  @OneToMany(() => Speaker, (speaker) => speaker.season, { cascade: true })
  public speakers: Speaker[];

  @OneToMany(() => Organization, (organization) => organization.season)
  public organizations: Organization[];

  @OneToMany(() => Sponsor, (sponsor) => sponsor.season)
  public sponsors: Sponsor[];

  @OneToMany(() => Class, (cl) => cl.season, { cascade: true })
  public classes: Class[];

  @OneToMany(() => Submission, (submission) => submission.season, { cascade: true })
  public submissions: Submission[];
}

@Entity({ name: 'seasons_days' })
export class SeasonDay extends GuidIdentity {
  @Column({ nullable: false })
  date: Date;

  // Season day belongs to a season
  @ManyToOne(() => Season, (season) => season.days, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  season: Season;

  @OneToMany(() => Event, (event) => event.day)
  events: Event[];
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

  @OneToMany(() => EventLocation, (location) => location.place)
  public locations?: EventLocation[];
}

@Entity({
  name: 'event_broadcast'
})
export class EventBroadcast extends GuidIdentity {
  @Column({ nullable: true })
  public name?: string;

  @Column({ nullable: true })
  public presenterUrl?: string;

  @Column({ nullable: true })
  public password?: string;

  @Column({ nullable: true })
  public phoneNumber?: string;

  @Column({ nullable: true })
  public meetingId?: string;

  @Column({ nullable: true })
  public publicUrl?: string;

  @Column({ nullable: true, length: 'MAX' })
  public details?: string;

  @OneToMany(() => Event, (event) => event.broadcast)
  public events?: Event[];
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

  @OneToMany(() => Event, (event) => event.location)
  public events?: Event[];

  @ManyToOne(() => Place, (place) => place.locations, {
    cascade: true,
    nullable: true,
    orphanedRowAction: 'nullify',
    onDelete: 'SET NULL'
  })
  public place: Place;
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

  @Column({ nullable: true, default: 0 })
  public observedAttendeeStart: number;

  @Column({ nullable: true, default: 0 })
  public observedAttendeeEnd: number;

  @Column({ nullable: true })
  public capacity: number;

  @Column({ nullable: true, length: 'MAX' })
  public resources: string;

  @Column({ nullable: true })
  public requiresRsvp: boolean;

  @Column({ nullable: true })
  public qrCode: string;

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
  public requirements: string;

  @ManyToOne(() => SeasonDay, (day) => day.events)
  public day: SeasonDay;

  @ManyToMany(() => Speaker, { cascade: true, nullable: true })
  @JoinTable({
    name: 'event_speakers'
  })
  public speakers?: Speaker[];

  @ManyToMany(() => Tag, { cascade: true, nullable: true })
  @JoinTable({
    name: 'event_tags'
  })
  public tags?: Tag[];

  @ManyToOne(() => EventBroadcast, (broadcast) => broadcast.events, {
    cascade: true,
    nullable: true,
    orphanedRowAction: 'nullify',
    onDelete: 'SET NULL'
  })
  public broadcast?: EventBroadcast;

  @ManyToOne(() => EventLocation, (location) => location.events, {
    cascade: true,
    nullable: true,
    orphanedRowAction: 'nullify',
    onDelete: 'SET NULL'
  })
  public location?: EventLocation;

  @ManyToMany(() => CourseCredit, { cascade: true })
  @JoinTable({ name: 'event_course_credits' })
  public courseCredit?: CourseCredit[];

  @ManyToMany(() => Sponsor, { cascade: true })
  @JoinTable({
    name: 'event_sponsors'
  })
  public sponsors?: Sponsor[];
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

  @Column({ nullable: true, length: 'max' })
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

  @Column({ nullable: true, length: 'max' })
  public text: string;

  @Column({ nullable: true })
  public contactFirstName: string;

  @Column({ nullable: true })
  public contactLastName: string;

  @Column({ nullable: true })
  public contactEmail: string;

  @OneToMany(() => Asset, (asset) => asset.organization, { cascade: true, nullable: true })
  public logos?: Asset[];

  @ManyToOne(() => Season, (season) => season.organizations, { cascade: true, orphanedRowAction: 'nullify' })
  public season: Season;

  @OneToMany(() => Speaker, (speaker) => speaker.organization, { orphanedRowAction: 'nullify' })
  public speakers: Speaker[];

  @OneToMany(() => OrganizationLink, (link) => link.organization, { cascade: true })
  public links: OrganizationLink[];
}

@Entity({
  name: 'organization_links'
})
export class OrganizationLink extends GuidIdentity {
  @Column({ nullable: false })
  public label: string;

  @Column({ nullable: false })
  public url: string;

  @ManyToOne(() => Organization, (o) => o.links, { orphanedRowAction: 'delete' })
  public organization: Organization;
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

  @Column({ nullable: true, length: 'max' })
  public description: string;

  @Column({ nullable: true })
  public socialMedia: string;

  @Column({ nullable: true })
  public accountGuid: string;

  @ManyToOne(() => Season, (season) => season.speakers, { cascade: false, nullable: true })
  public season: Season;

  @ManyToOne(() => Organization, (o) => o.speakers, {
    nullable: true,
    orphanedRowAction: 'nullify',
    onDelete: 'SET NULL'
  })
  public organization: Organization;

  @ManyToOne(() => University, { cascade: true, nullable: true })
  public university?: University;

  @OneToMany(() => Asset, (asset) => asset.speaker, { cascade: true, nullable: true })
  public images?: Asset[];
}

@Entity({
  name: 'tags'
})
export class Tag extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;
}

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

  @Column({ nullable: true, length: 'max' })
  public description: string;

  @Column({ nullable: true })
  public sponsorshipLevel: 'point' | 'line' | 'polygon' | 'raster' | string;

  @Column({ nullable: true })
  public sponsorshipAmount: string;

  @ManyToOne(() => Season, (season) => season.sponsors, { cascade: true, nullable: true })
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

  @ManyToOne(() => Organization, (o) => o.logos, { nullable: true, orphanedRowAction: 'nullify' })
  public organization?: Organization;

  @ManyToOne(() => Speaker, (s) => s.images, { nullable: true, orphanedRowAction: 'nullify' })
  public speaker?: Speaker;

  @ManyToOne(() => Sponsor, (s) => s.logos, { nullable: true, orphanedRowAction: 'nullify' })
  public sponsor?: Sponsor;
}

@Entity({
  name: 'checkins'
})
export class CheckIn extends GuidIdentity {
  @ManyToOne(() => Event, { cascade: false })
  public event: Event;

  @Column({ nullable: false })
  public accountGuid: string;
}

@Entity({
  name: 'classes'
})
export class Class extends GuidIdentity {
  @ManyToOne(() => Season, (season) => season.classes, { cascade: false, nullable: true })
  public season: Season;

  @Column({ nullable: true })
  public professorAccountGuid: string;

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: true })
  public dept: string;

  @Column({ nullable: false })
  public code: string;

  public userInClass = false;
}

@Entity({
  name: 'course_credits'
})
export class CourseCredit extends GuidIdentity {
  @ManyToOne(() => Event, { cascade: false, nullable: true })
  public event?: Event;

  @ManyToOne(() => Class, { cascade: false, nullable: true })
  public class?: Class;
}

@Entity({
  name: 'submission_types'
})
export class SubmissionType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;
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
  @OneToOne(() => Class, { cascade: true, eager: true })
  @JoinColumn()
  public class: Class;

  @Column({ nullable: false })
  public accountGuid: string; // User
}

@Entity({
  name: 'user_rsvps'
})
export class UserRsvp extends GuidIdentity {
  @Column({ nullable: false })
  public accountGuid: string; // User

  @OneToOne(() => Event, { cascade: true, eager: true })
  @JoinColumn()
  public event: Event;

  @OneToOne(() => RsvpType, { cascade: true, eager: true })
  @JoinColumn()
  public rsvpType: RsvpType;
}

@Entity({
  name: 'submissions'
})
export class Submission extends GuidIdentity {
  @ManyToOne(() => Season, (season) => season.submissions, { cascade: false, nullable: true })
  public season: Season;

  @Column({ nullable: true })
  public accountGuid: string; // User

  @Column({ nullable: true })
  public title: string;

  @Column({ nullable: true, length: 'max' })
  public author: string;

  @Column({ nullable: true, length: 'max' })
  public abstract: string;

  @Column({ nullable: true })
  public link: string;

  @Column({ nullable: true })
  public submissionType: 'Poster' | 'Presentation' | string;

  @Column({ nullable: true })
  public studentType: 'Undergraduate' | 'Graduate' | string;
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
  event: ['speakers', 'speakers.images', 'tags', 'sponsors', 'location', 'location.place', 'broadcast', 'day'],
  speaker: ['images', 'university'],
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
  SubmissionType,
  Sponsor,
  Tag,
  UserClass,
  UserInfo,
  UserRsvp,
  Submission,
  University,
  Asset,
  OrganizationLink
];

export interface IGeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: ValidObject;
}
