import {
  Entity,
  BaseEntity,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  OneToMany,
  ManyToOne
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

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}

@Entity({ name: 'location' })
export class Location extends GuidIdentity {
  @Column()
  public tier: number;

  @Column()
  public sample: number;

  @OneToMany((type) => Result, (result) => result.location)
  public results: Result[];
}

@Entity({ name: 'results' })
export class Result extends GuidIdentity {
  @Column({ type: 'float' })
  public value: number;

  @Column({ nullable: false })
  public date: Date;

  @ManyToOne((type) => Location, { cascade: true })
  public location: Location;
}
