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
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable
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

  @CreateDateColumn()
  public added: Date;

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
  // @OneToMany(type => EventSession, eventSession => eventSession.eventGuid)
  public sessions: Session[]; // Session[]

  // @OneToMany(type => EventSpeaker, eventSpeaker => eventSpeaker.eventGuid)
  public speakers: Speaker[]; // Speaker[]

  // @OneToMany(type => EventSponsor, eventSponsor => eventSponsor.eventGuid)
  public sponsors: Sponsor[]; // Sponsor[]

  // @OneToMany(type => EventTag, eventTag => eventTag.eventGuid)
  public tags: Tag[]; // Tag[]

  // @OneToMany(type => UserRsvp, userRsvp => userRsvp.eventGuid)
  currentRsvps: unknown[]; // UserRsvp[]

  // @OneToMany(type => CourseCredit, credit => credit.eventGuid)
  public courseCredit: CourseCredit[]; // CourseCredit[]

  // @OneToMany(type => UserCheckin, userCheckin => userCheckin.eventGuid)
  public userCheckins: CheckIn[]; // UserCheckin[]

  @Column({
    name: 'userGuid',
    type: 'varchar',
    nullable: true
  })
  user: unknown; // User

  @Column({
    type: 'varchar',
    nullable: true
  })
  speaker: unknown; // Speaker

  @Column({
    name: 'ObservedAttendeeStart',
    type: 'int',
    nullable: true
  })
  observedAttendeeStart: number;

  @Column({
    name: 'ObservedAttendeeEnd',
    type: 'int',
    nullable: true
  })
  observedAttendeeEnd: number;

  @Column({
    name: 'OnlineBroadcastURL',
    type: 'varchar',
    nullable: true
  })
  onlineBroadcastUrl: string;

  @Column({
    name: 'OnlinePresenterURL',
    type: 'varchar',
    nullable: true
  })
  onlinePresenterUrl: string;

  @Column({
    name: 'GoogleDriveURL',
    type: 'varchar',
    nullable: true
  })
  googleDriveUrl: string;

  @Column({
    name: 'PresentationURL',
    type: 'varchar',
    nullable: true
  })
  presentationUrl: string;

  @Column({
    name: 'EventName',
    type: 'varchar',
    nullable: true
  })
  name: string;

  @Column({
    name: 'Time',
    type: 'varchar',
    nullable: true
  })
  time: Date;

  @Column({
    name: 'Title',
    type: 'varchar',
    nullable: true
  })
  title: string;

  @Column({
    name: 'Abstract',
    type: 'varchar',
    nullable: true
  })
  abstract: string;

  @Column({
    name: 'LocationRoom',
    type: 'varchar',
    nullable: true
  })
  locationRoom: string;

  @Column({
    name: 'LocationBuilding',
    type: 'varchar',
    nullable: true
  })
  locationBuilding: string;

  @Column({
    name: 'Capacity',
    type: 'int',
    nullable: true
  })
  capacity: number;

  @Column({
    name: 'RequiresRSVP',
    type: 'bit',
    nullable: true
  })
  requiresRsvp: boolean;

  @Column({
    name: 'QRcode',
    type: 'varchar',
    nullable: true
  })
  qrCode: string;

  @Column({
    name: 'LocationLink',
    type: 'varchar',
    nullable: true
  })
  locationLink: string;

  @Column({
    name: 'Date',
    type: 'varchar',
    nullable: true
  })
  date: string;

  @Column({
    name: 'EventType',
    type: 'varchar',
    nullable: true
  })
  type: string;

  @Column({
    name: 'PresentationType',
    type: 'varchar',
    nullable: true
  })
  presentationType: string;

  @Column({
    name: 'IsAcceptingRSVPs',
    type: 'bit',
    nullable: true
  })
  isAcceptingRsvps: boolean;

  @Column({
    name: 'Duration',
    type: 'numeric',
    nullable: true
  })
  duration: number;

  constructor() {
    super();
  }
}

@Entity({
  name: 'sessions'
})
export class Session extends GuidIdentity {
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
  name: 'speakers'
})
export class Speaker extends GuidIdentity {
  @Column({ nullable: false })
  public user: unknown; // User

  @Column({ nullable: false })
  public firstName: string;

  @Column({ nullable: false })
  public lastName: string;

  @Column({ nullable: false })
  public email: string;

  @Column({ nullable: false })
  public organization: string;

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
  @Column({ nullable: false })
  public event: Event;

  @Column({ nullable: false })
  public user: unknown; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'checkins'
})
export class Class extends GuidIdentity {
  @Column({ nullable: false })
  public professor: unknown; // User

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: false })
  public code: string; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'course_credits'
})
export class CourseCredit extends GuidIdentity {
  @Column({ nullable: false })
  public event: Event;

  @Column({ nullable: false })
  public class: Class;

  constructor() {
    super();
  }
}

@Entity({
  name: 'user_classes'
})
export class UserClass extends GuidIdentity {
  @Column({ nullable: false })
  public class: Class;

  @Column({ nullable: false })
  public user: unknown; // User

  constructor() {
    super();
  }
}

@Entity({
  name: 'user_rsvps'
})
export class UserRsvp extends GuidIdentity {
  @Column({ nullable: false })
  public user: unknown; // User

  @Column({ nullable: false })
  public event: Event;

  @Column({ nullable: false })
  public rsvpType: unknown; // What is an RSVP Type?

  constructor() {
    super();
  }
}

@Entity({
  name: 'submissions'
})
export class UserSubmission extends GuidIdentity {
  @Column({ nullable: false })
  public user: unknown; // User

  @Column({ nullable: false })
  public title: string;

  @Column({ nullable: false })
  public author: string;

  @Column({ nullable: false })
  public abstract: string;

  @Column({ nullable: false })
  public link: string;

  @Column({ nullable: false })
  public submissionType: SubmissionType; // Submission Type?

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
