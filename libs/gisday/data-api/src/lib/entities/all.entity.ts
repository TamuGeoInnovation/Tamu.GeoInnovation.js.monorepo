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
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Repository
} from 'typeorm';
import { v4 as guid } from 'uuid';

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

  @Column()
  public season: string;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
    if (this.season === undefined) {
      this.season = new Date().getFullYear().toString();
    }
  }
}

@Entity({
  name: 'events'
})
export class Event extends GuidIdentity {
  @ManyToMany((type) => Session, { cascade: true })
  @JoinTable({ name: 'event_sessions' })
  public sessions: Session[];

  // @OneToMany(type => EventSpeaker, eventSpeaker => eventSpeaker.eventGuid)
  // public speakers: Speaker[]; // Speaker[]

  @ManyToMany((type) => Sponsor, { cascade: true })
  @JoinTable({ name: 'event_sponsors' })
  public sponsors: Sponsor[];

  @ManyToMany((type) => Tag, { cascade: true })
  @JoinTable({ name: 'event_tags' })
  public tags: Tag[];

  // @OneToMany(type => UserRsvp, userRsvp => userRsvp.eventGuid)
  // public currentRsvps: UserRsvp[]; // UserRsvp[]

  @ManyToMany((type) => CourseCredit, { cascade: true })
  @JoinTable({ name: 'event_course_credits' })
  public courseCredit: CourseCredit[]; // CourseCredit[]

  // @OneToMany(type => UserCheckin, userCheckin => userCheckin.eventGuid)
  // public userCheckins: CheckIn[]; // UserCheckin[]

  // @Column({ nullable: true })
  // user: string; // User

  @Column({ nullable: true })
  observedAttendeeStart: number;

  @Column({ nullable: true })
  observedAttendeeEnd: number;

  @Column({ nullable: true })
  onlineBroadcastUrl: string;

  @Column({ nullable: true })
  onlinePresenterUrl: string;

  @Column({ nullable: true })
  googleDriveUrl: string;

  @Column({ nullable: true })
  presentationUrl: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  abstract: string;

  @Column({ nullable: true })
  locationRoom: string;

  @Column({ nullable: true })
  locationBuilding: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ nullable: true })
  requiresRsvp: boolean;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  locationLink: string;

  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  presentationType: string;

  @Column({ nullable: true })
  isAcceptingRsvps: boolean;

  @Column({ nullable: true })
  duration: number;

  hasRsvp: boolean = false;

  constructor() {
    super();
  }
}

@Entity({
  name: 'sessions'
})
export class Session extends GuidIdentity {
  @ManyToMany((type) => Speaker, { cascade: true })
  @JoinTable({ name: 'session_speakers' })
  public speakers: Speaker[];

  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: false })
  public duration: number;

  @Column({ nullable: false })
  public date: Date;

  @Column({ nullable: false })
  public abstract: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'speaker_info'
})
export class SpeakerInfo extends GuidIdentity {
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

  @Column({ nullable: true, type: 'image' })
  public blob: Buffer;

  constructor() {
    super();
  }
}

@Entity({
  name: 'speakers'
})
export class Speaker extends GuidIdentity {
  // @OneToOne((type) => User, { cascade: true, nullable: true })
  // @JoinColumn()
  @Column({ nullable: true })
  public userGuid: string; // User

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
export class Sponsor extends GuidIdentity {
  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: false })
  public website: string;

  @Column({ nullable: false })
  public logoUrl: string;

  constructor() {
    super();
  }
}

@Entity({
  name: 'checkins'
})
export class CheckIn extends GuidIdentity {
  @OneToOne((type) => Event, { cascade: true })
  @JoinColumn()
  public event: Event;

  // @OneToOne((type) => User, { cascade: true, nullable: true })
  // @JoinColumn()
  @Column({ nullable: false })
  public userGuid: string; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'classes'
})
export class Class extends GuidIdentity {
  // @OneToOne((type) => User, { cascade: true })
  // @JoinColumn({
  //   name: 'professorUserGuid'
  // })
  @Column({ nullable: false })
  public professorUserGuid: string;

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
export class CourseCredit extends GuidIdentity {
  @OneToOne((type) => Event, { cascade: true })
  public event: Event;

  @OneToOne((type) => Class, { cascade: true })
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
export class UserClass extends GuidIdentity {
  @OneToOne((type) => Class, { cascade: true, eager: true })
  @JoinColumn()
  public class: Class;

  // @OneToOne((type) => User, { cascade: true, nullable: true })
  // @JoinColumn()
  @Column({ nullable: false })
  public userGuid: string; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'user_rsvps'
})
export class UserRsvp extends GuidIdentity {
  // @OneToOne((type) => User, { cascade: true, nullable: true })
  // @JoinColumn()
  @Column({ nullable: false })
  public userGuid: string; // User

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
export class UserSubmission extends GuidIdentity {
  // @OneToOne((type) => User, { cascade: true, nullable: true })
  // @JoinColumn()
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

export class CommonRepo<T> extends Repository<T> {}

@EntityRepository(CheckIn)
export class CheckInRepo extends CommonRepo<CheckIn> {}

@EntityRepository(Class)
export class ClassRepo extends CommonRepo<Class> {}

@EntityRepository(CourseCredit)
export class CourseCreditRepo extends CommonRepo<CourseCredit> {}

@EntityRepository(Event)
export class EventRepo extends CommonRepo<Event> {}

@EntityRepository(Session)
export class SessionRepo extends CommonRepo<Session> {}

@EntityRepository(Speaker)
export class SpeakerRepo extends CommonRepo<Speaker> {
  public async getPresenter(guid: string) {
    return getConnection()
      .getRepository(Speaker)
      .createQueryBuilder('speaker')
      .leftJoinAndSelect('speaker.speakerInfo', 'speakerInfo')
      .where(`speaker.guid = :guid`, {
        guid: guid
      })
      .getOne();
  }

  public async getPresenters() {
    return getConnection()
      .getRepository(Speaker)
      .createQueryBuilder('speaker')
      .leftJoinAndSelect('speaker.speakerInfo', 'speakerInfo')
      .getMany();
  }
}

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

@EntityRepository(UserClass)
export class UserClassRepo extends CommonRepo<UserClass> {
  public async getUsersClasses(userGuid: string) {
    return getConnection()
      .getRepository(UserClass)
      .createQueryBuilder('userClass')
      .leftJoinAndSelect('userClass.class', 'class')
      .where(`userClass.userGuid = :guid`, {
        guid: userGuid
      })
      .getMany();
  }
}

@EntityRepository(UserInfo)
export class UserInfoRepo extends CommonRepo<UserInfo> {}

@EntityRepository(UserRsvp)
export class UserRsvpRepo extends CommonRepo<UserRsvp> {
  public async getUserRsvps(userGuid: string) {
    return getConnection()
      .getRepository(UserRsvp)
      .createQueryBuilder('userRsvp')
      .leftJoinAndSelect('userRsvp.event', 'event')
      .leftJoinAndSelect('userRsvp.rsvpType', 'rsvpType')
      .where(`userRsvp.userGuid = :guid`, {
        guid: userGuid
      })
      .getMany();
  }
}

@EntityRepository(UserSubmission)
export class UserSubmissionRepo extends CommonRepo<UserSubmission> {}
