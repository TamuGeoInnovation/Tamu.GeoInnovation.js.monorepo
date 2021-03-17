import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeUpdate,
  BeforeInsert,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne
} from 'typeorm';

import { v4 as guid } from 'uuid';

@Entity()
export class CPABaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @UpdateDateColumn()
  public updated: Date;

  @CreateDateColumn()
  public created: Date;

  @BeforeUpdate()
  @BeforeInsert()
  private generateGuid(): void {
    if (this.guid === undefined) {
      this.guid = guid();
    }
  }
}

@Entity()
export class Workshop extends CPABaseEntity {
  @Column()
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  public description: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public alias: string;

  @Column({ nullable: true })
  public date: Date;

  @OneToMany((type) => WorkshopSnapshots, (s) => s.workshop)
  public snapshots: WorkshopSnapshots[];


  @OneToMany((type) => Scenario, (s) => s.workshop)
  public scenarios: Scenario[];

  @OneToMany((type) => Response, (r) => r.workshop)
  public responses: Response[];
}

@Entity()
export class Snapshot extends CPABaseEntity {
  @Column({ nullable: true })
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public description: string;

  @Column({ nullable: true })
  public mapCenter: string;

  @Column({ nullable: true })
  public zoom: number;

  @Column({ type: 'simple-json', nullable: true })
  public extent: string;

  @Column({ type: 'simple-json', nullable: true })
  public layers: string;

  @OneToMany((type) => WorkshopSnapshots, (w) => w.snapshot)
  public workshops: WorkshopSnapshots[];

  @OneToMany((type) => Response, (r) => r.snapshot)
  public responses: Response[];
}

@Entity()
export class WorkshopSnapshots extends CPABaseEntity {
  @ManyToOne((type) => Workshop, (w) => w.snapshots)
  public workshop: Workshop;

  @ManyToOne((type) => Snapshot, (s) => s.workshops)
  public snapshot: Snapshot;
}

@Entity()
export class Scenario extends CPABaseEntity {
  @Column({ nullable: true })
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public description: string;

  @Column({ nullable: true })
  public mapCenter: string;

  @Column({ nullable: true })
  public zoom: number;

  @Column({ type: 'simple-json', nullable: true })
  public extent: string;

  @Column({ type: 'simple-json', nullable: true })
  public layers: string;

  @ManyToOne((type) => Workshop, (w) => w.scenarios)
  public workshop: Workshop;

  @OneToMany((type) => Response, (r) => r.scenario)
  public responses: Response[];
}

@Entity()
export class Response extends CPABaseEntity {
  @Column({ nullable: true })
  public name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public notes: string;

  @Column({ type: 'simple-json', nullable: true })
  public shapes: string | object;

  @ManyToOne((type) => Snapshot, (s) => s.responses, { onDelete: 'CASCADE' })
  public snapshot: Snapshot;

  @ManyToOne((type) => Scenario, (s) => s.responses, { onDelete: 'CASCADE' })
  public scenario: Scenario;

  @ManyToOne((type) => Workshop, (w) => w.responses, { onDelete: 'CASCADE' })
  public workshop: Workshop;
}
