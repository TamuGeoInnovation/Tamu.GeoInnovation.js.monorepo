import {
  getConnection,
  Entity,
  EntityRepository,
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
  Repository
} from 'typeorm';

import { v4 as guid } from 'uuid';

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
        ...this
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
    if (this.guid === undefined || this.guid === '') {
      this.guid = guid();
    }
  }
}

@Entity()
export class GISDayEntity extends GuidIdentity {
  @Column()
  public season: string;

  @BeforeUpdate()
  @BeforeInsert()
  private setSeason() {
    if (this.season === undefined) {
      this.season = new Date().getFullYear().toString();
    }
  }
}

@Entity({
  name: 'events_old'
})
export class OldEvent extends GISDayEntity {
  // @ManyToMany((type) => Speaker, { cascade: true })
  // @JoinTable({ name: 'event_speakers' })
  // public speakers?: Speaker[];

  // @ManyToMany((type) => Sponsor, { cascade: true })
  // @JoinTable({ name: 'event_sponsors' })
  // public sponsors?: Sponsor[];

  // @ManyToMany((type) => Tag, { cascade: true })
  // @JoinTable({ name: 'event_tags' })
  // public tags?: Tag[];

  // @ManyToMany((type) => CourseCredit, { cascade: true })
  // @JoinTable({ name: 'event_course_credits' })
  // public courseCredit?: CourseCredit[]; // CourseCredit[]

  @Column({ nullable: true })
  public observedAttendeeStart: number;

  @Column({ nullable: true })
  public observedAttendeeEnd: number;

  @Column({ nullable: true })
  public onlineBroadcastUrl: string;

  @Column({ nullable: true })
  public onlinePresenterUrl: string;

  @Column({ nullable: true })
  public googleDriveUrl: string;

  @Column({ nullable: true })
  public presentationUrl: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public startTime: Date;

  @Column({ nullable: true })
  public endTime: Date;

  @Column({ nullable: true })
  public abstract: string;

  @Column({ nullable: true })
  public locationRoom: string;

  @Column({ nullable: true })
  public locationBuilding: string;

  @Column({ nullable: true })
  public capacity: number;

  @Column({ nullable: true })
  public requiresRsvp: boolean;

  @Column({ nullable: true })
  public qrCode: string;

  @Column({ nullable: true })
  public locationLink: string;

  @Column({ nullable: true })
  public date: Date;

  @Column({ nullable: true })
  public type: string;

  @Column({ nullable: true })
  public presentationType: string;

  @Column({ nullable: true })
  public isAcceptingRsvps: boolean;

  @Column({ nullable: true })
  public duration: number;

  public hasRsvp = false;

  constructor() {
    super();
  }
}

@Entity({
  name: 'event_broadcast'
})
export class EventBroadcast extends GuidIdentity {
  @Column({ nullable: false })
  public presenterUrl: string;

  @Column({ nullable: false })
  public password: string;

  @Column({ nullable: false })
  public phoneNumber: string;

  @Column({ nullable: false })
  public meetingId: string;

  @Column({ nullable: false })
  public publicUrl: string;
}

@Entity({
  name: 'event_location'
})
export class EventLocation extends GuidIdentity {
  @Column({ nullable: true })
  public room: string;

  @Column({ nullable: true })
  public building: string;

  @Column({ nullable: true })
  public capacity: number;

  @Column({ nullable: true })
  public link: string;
}

@Entity({
  name: 'events'
})
export class Event extends GISDayEntity {
  @ManyToMany((type) => Speaker, { cascade: true })
  @JoinTable({ name: 'event_speakers' })
  public speakers?: Speaker[];

  // @ManyToMany((type) => Sponsor, { cascade: true })
  // @JoinTable({ name: 'event_sponsors' })
  // public sponsors?: Sponsor[];

  @ManyToMany((type) => Tag, { cascade: true })
  @JoinTable({ name: 'event_tags' })
  public tags?: Tag[];

  // @ManyToMany((type) => CourseCredit, { cascade: true })
  // @JoinTable({ name: 'event_course_credits' })
  // public courseCredit?: CourseCredit[]; // CourseCredit[]

  @OneToOne(() => EventBroadcast, { cascade: true, nullable: true })
  @JoinColumn()
  public broadcast?: EventBroadcast;

  @OneToOne(() => EventLocation, { cascade: true, nullable: true })
  @JoinColumn()
  public location?: EventLocation;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public abstract: string;

  @Column({ nullable: true })
  public startTime: string; // Use Angular pipes to format on frontend

  @Column({ nullable: true })
  public endTime: string;

  // @Column({ nullable: true })
  // public duration: number; // TODO: Can we remove this? If we need it in the future maybe replace with a computed property of endTime - startTime - Aaron H. (3/30/2022)

  @Column({ nullable: true })
  public observedAttendeeStart: number;

  @Column({ nullable: true })
  public observedAttendeeEnd: number;

  @Column({ nullable: true })
  public googleDriveUrl: string;

  @Column({ nullable: true })
  public requiresRsvp: boolean;

  @Column({ nullable: true })
  public qrCode: string;

  @Column({ nullable: true })
  public type: string;

  @Column({ nullable: true })
  public presentationType: string;

  @Column({ nullable: false })
  public isAcceptingRsvps: boolean = true;

  @Column({ nullable: false })
  public isBringYourOwnDevice: boolean = false;

  @Column({ nullable: true })
  public requirements: string;

  public hasRsvp = false;

  constructor() {
    super();
  }
}

@Entity({
  name: 'question_types'
})
export class QuestionType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;

  public question: InitialSurveyQuestion;

  constructor() {
    super();
  }
}

@Entity({
  name: 'initial_survey_questions'
})
export class InitialSurveyQuestion extends GuidIdentity {
  @ManyToOne((type) => QuestionType, (token) => token.question, { eager: true })
  public questionType: QuestionType;

  @Column({ nullable: true })
  public questionText: string;

  @Column({ nullable: true })
  public questionOptions: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'initial_survey_responses'
})
export class InitialSurveyResponse extends GISDayEntity {
  @Column({ nullable: false })
  public accountGuid: string; // User

  @ManyToOne((type) => InitialSurveyQuestion, { cascade: true, eager: true })
  @JoinColumn()
  public question: InitialSurveyQuestion;

  @Column({ nullable: false })
  public responseValue: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'universities'
})
export class University extends GuidIdentity {
  @Column()
  public name: string;

  @Column()
  public acronym?: string;

  @Column()
  public hexTriplet: string;
}

@Entity({
  name: 'speaker_roles'
})
export class SpeakerRole extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  constructor() {
    super();
  }
}

export class MSSQLImage {
  public type: '' | '';
  public data: Uint8Array;
}

@Entity({
  name: 'speaker_info'
})
export class SpeakerInfo extends GuidIdentity {
  @Column({ nullable: true })
  public graduationYear: string;

  @ManyToOne((type) => University, { cascade: true, nullable: true })
  @JoinColumn()
  public university?: University;

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

  @Column({ nullable: true, type: 'image' })
  public blob: MSSQLImage;

  public base64representation: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'speakers'
})
export class Speaker extends GISDayEntity {
  @Column({ nullable: true })
  public accountGuid: string; // User

  @Column({ nullable: false })
  public firstName: string;

  @Column({ nullable: false })
  public lastName: string;

  @Column({ nullable: false })
  public email: string;

  @Column({ nullable: false })
  public organization: string;

  @OneToOne((type) => SpeakerInfo, { cascade: true, nullable: true })
  @JoinColumn()
  public speakerInfo: SpeakerInfo;

  // @ManyToMany((type) => SpeakerRole)
  // @JoinTable({ name: 'speaker_speaker_roles' })
  // public speakerRole: SpeakerRole;

  constructor() {
    super();
  }
}

@Entity({
  name: 'tags'
})
export class Tag extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'sponsors'
})
export class Sponsor extends GISDayEntity {
  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: false })
  public website: string;

  @Column({ nullable: false })
  public logoUrl: string;

  @Column({ nullable: false })
  public contactEmail: string;

  @Column({ nullable: false })
  public description: string;

  @Column({ nullable: true })
  public sponsorshipLevel: 'point' | 'line' | 'polygon' | 'raster';

  constructor() {
    super();
  }
}

@Entity({
  name: 'checkins'
})
export class CheckIn extends GISDayEntity {
  @OneToOne((type) => Event, { cascade: true, eager: true })
  @JoinColumn()
  public event: Event;

  @Column({ nullable: false })
  public accountGuid: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'classes'
})
export class Class extends GISDayEntity {
  @Column({ nullable: true })
  public professorAccountGuid: string;

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: true })
  public dept: string;

  @Column({ nullable: false })
  public code: string;

  public userInClass = false;

  constructor() {
    super();
  }
}

@Entity({
  name: 'course_credits'
})
export class CourseCredit extends GISDayEntity {
  @ManyToOne((type) => Class, { cascade: true })
  @JoinColumn()
  public class: Class;

  constructor() {
    super();
  }
}

@Entity({
  name: 'submission_types'
})
export class SubmissionType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'rsvp_types'
})
export class RsvpType extends GuidIdentity {
  @Column({ nullable: false })
  public type: string;

  constructor() {
    super();
  }
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

  constructor() {
    super();
  }
}

@Entity({
  name: 'user_classes'
})
export class UserClass extends GISDayEntity {
  @OneToOne((type) => Class, { cascade: true, eager: true })
  @JoinColumn()
  public class: Class;

  @Column({ nullable: false })
  public accountGuid: string; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'user_rsvps'
})
export class UserRsvp extends GISDayEntity {
  @Column({ nullable: false })
  public accountGuid: string; // User

  @OneToOne((type) => Event, { cascade: true, eager: true })
  @JoinColumn()
  public event: Event;

  @OneToOne((type) => RsvpType, { cascade: true, eager: true })
  @JoinColumn()
  public rsvpType: RsvpType;

  constructor() {
    super();
  }
}

@Entity({
  name: 'submissions'
})
export class UserSubmission extends GISDayEntity {
  @Column({ nullable: false })
  public accountGuid: string; // User

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: false })
  public author: string;

  @Column({ nullable: false })
  public abstract: string;

  @Column({ nullable: false })
  public link: string;

  @OneToOne((type) => SubmissionType, { cascade: true, eager: true })
  @JoinColumn()
  public submissionType: SubmissionType; // Submission Type?

  constructor() {
    super();
  }
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
  event: ['broadcast', 'location'],
  speaker: ['speakerInfo', 'speakerInfo.university'],
  getRelation: (entity?: string) => {
    if (!entity) {
      return undefined;
    } else {
      return EntityRelationsLUT[entity.toLowerCase()];
    }
  }
};

export type EntityName = 'event' | 'speaker';

export class CommonRepo<T> extends Repository<T> {}

@EntityRepository(CheckIn)
export class CheckInRepo extends CommonRepo<CheckIn> {}

@EntityRepository(Class)
export class ClassRepo extends CommonRepo<Class> {}

@EntityRepository(CourseCredit)
export class CourseCreditRepo extends CommonRepo<CourseCredit> {}

@EntityRepository(Event)
export class EventRepo extends CommonRepo<Event> {
  public async getAllCurrentSeasonByStartTime() {
    return getConnection()
      .getRepository(Event)
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.tags', 'tags')
      .leftJoinAndSelect('events.speakers', 'speakers')
      .orderBy('startTime', 'ASC')
      .where(`events.season = :season`, {
        season: '2019'
      })
      .getMany();
  }
}

@EntityRepository(EventLocation)
export class EventLocationRepo extends CommonRepo<EventLocation> {}

@EntityRepository(EventBroadcast)
export class EventBroadcastRepo extends CommonRepo<EventBroadcast> {}

@EntityRepository(InitialSurveyQuestion)
export class InitialSurveyQuestionRepo extends CommonRepo<InitialSurveyQuestion> {}

@EntityRepository(InitialSurveyResponse)
export class InitialSurveyRepo extends CommonRepo<InitialSurveyResponse> {}

@EntityRepository(QuestionType)
export class QuestionTypeRepo extends CommonRepo<QuestionType> {}

@EntityRepository(Speaker)
export class SpeakerRepo extends CommonRepo<Speaker> {
  public async getPresenter(speakerGuid: string) {
    return getConnection()
      .getRepository(Speaker)
      .createQueryBuilder('speaker')
      .leftJoinAndSelect('speaker.speakerInfo', 'speakerInfo')
      .leftJoinAndSelect('speakerInfo.university', 'university')
      .leftJoinAndSelect('speakerInfo.speakerRole', 'speakerRole')
      .where(`speaker.guid = :guid`, {
        guid: speakerGuid
      })
      .getOne();
  }

  public async getPresenters() {
    return getConnection()
      .getRepository(Speaker)
      .createQueryBuilder('speaker')
      .leftJoinAndSelect('speaker.speakerInfo', 'speakerInfo')
      .leftJoinAndSelect('speakerInfo.university', 'university')
      .leftJoinAndSelect('speakerInfo.speakerRole', 'speakerRole')
      .where('speaker.season = :season', {
        season: '2020'
      })
      .getMany();
  }
}

@EntityRepository(SpeakerRole)
export class SpeakerRoleRepo extends CommonRepo<SpeakerRole> {}

@EntityRepository(SpeakerInfo)
export class SpeakerInfoRepo extends CommonRepo<SpeakerInfo> {}

@EntityRepository(Sponsor)
export class SponsorRepo extends CommonRepo<Sponsor> {}

@EntityRepository(SubmissionType)
export class SubmissionTypeRepo extends CommonRepo<SubmissionType> {}

@EntityRepository(RsvpType)
export class RsvpTypeRepo extends CommonRepo<RsvpType> {}

@EntityRepository(Tag)
export class TagRepo extends CommonRepo<Tag> {}

@EntityRepository(University)
export class UniversityRepo extends CommonRepo<University> {}

@EntityRepository(UserClass)
export class UserClassRepo extends CommonRepo<UserClass> {
  public async getUsersClasses(accountGuid: string) {
    return getConnection()
      .getRepository(UserClass)
      .createQueryBuilder('userClass')
      .leftJoinAndSelect('userClass.class', 'class')
      .where(`userClass.accountGuid = :guid`, {
        guid: accountGuid
      })
      .getMany();
  }
}

@EntityRepository(UserInfo)
export class UserInfoRepo extends CommonRepo<UserInfo> {}

@EntityRepository(UserRsvp)
export class UserRsvpRepo extends CommonRepo<UserRsvp> {
  public async getUserRsvps(accountGuid: string) {
    return getConnection()
      .getRepository(UserRsvp)
      .createQueryBuilder('userRsvp')
      .leftJoinAndSelect('userRsvp.event', 'event')
      .leftJoinAndSelect('userRsvp.rsvpType', 'rsvpType')
      .where(`userRsvp.accountGuid = :guid`, {
        guid: accountGuid
      })
      .getMany();
  }
}

@EntityRepository(UserSubmission)
export class UserSubmissionRepo extends CommonRepo<UserSubmission> {}

@EntityRepository(SignageSubmission)
export class SignageSubmissionRepo extends CommonRepo<SignageSubmission> {}

@EntityRepository(StormwaterSubmission)
export class StormwaterSubmissionRepo extends CommonRepo<StormwaterSubmission> {}

@EntityRepository(SidewalkSubmission)
export class SidewalkSubmissionRepo extends CommonRepo<SidewalkSubmission> {}

@EntityRepository(ManholeSubmission)
export class ManholeSubmissionRepo extends CommonRepo<ManholeSubmission> {}

export interface IGeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {};
}
