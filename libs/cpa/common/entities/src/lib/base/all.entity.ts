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
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

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
export class Workshop extends CPABaseEntity implements IWorkshop {
  @Column()
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  public description: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public alias: string;

  @Column({ nullable: true })
  public date: Date;

  @OneToMany(() => WorkshopSnapshot, (s) => s.workshop, { cascade: true })
  public snapshots: WorkshopSnapshot[];

  @OneToMany(() => WorkshopScenario, (s) => s.workshop)
  public scenarios: WorkshopScenario[];

  @OneToMany(() => WorkshopContext, (s) => s.workshop)
  public contexts: WorkshopContext[];

  @OneToMany(() => Response, (r) => r.workshop)
  public responses: Response[];

  @ManyToMany(() => Participant)
  public participants: Participant[];
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
  public extent: __esri.Extent;

  @Column({ type: 'simple-json', nullable: true })
  public layers: Array<CPALayer>;

  @Column({ type: 'bit', nullable: false })
  public isContextual = false;

  @OneToMany(() => WorkshopSnapshot, (w) => w.snapshot, { onDelete: 'CASCADE' })
  public workshops: WorkshopSnapshot[];

  @OneToMany(() => Response, (r) => r.snapshot)
  public responses: Response[];
}

@Entity({ name: 'workshop_snapshots' })
export class WorkshopSnapshot extends CPABaseEntity {
  @ManyToOne(() => Workshop, (w) => w.snapshots, { onDelete: 'CASCADE' })
  public workshop: Workshop;

  @ManyToOne(() => Snapshot, (s) => s.workshops, {
    onDelete: 'CASCADE'
  })
  public snapshot: Snapshot;
}

@Entity()
export class Scenario extends CPABaseEntity implements IScenario {
  @Column({ nullable: true })
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public description: string;

  @Column({ nullable: true })
  public mapCenter: string;

  @Column({ nullable: true, default: null })
  public zoom: number;

  @Column({ type: 'simple-json', nullable: true })
  public extent: __esri.Extent;

  @Column({ type: 'simple-json', nullable: true })
  public layers: Array<LayerReference>;

  @OneToOne(() => WorkshopScenario, (w) => w.scenario)
  public workshopScenario: IWorkshopScenario;

  @OneToMany(() => Response, (r) => r.scenario)
  public responses: Response[];
}

@Entity({ name: 'workshop_scenarios' })
export class WorkshopScenario extends CPABaseEntity implements IWorkshopScenario {
  @ManyToOne(() => Workshop, (w) => w.scenarios, { onDelete: 'CASCADE' })
  public workshop: IWorkshop;

  @OneToOne(() => Scenario, (s) => s.workshopScenario, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public scenario: IScenario;
}

@Entity({ name: 'workshop_contexts' })
export class WorkshopContext extends CPABaseEntity {
  @ManyToOne(() => Workshop, (w) => w.contexts, { onDelete: 'CASCADE' })
  public workshop: IWorkshop;

  @ManyToOne(() => Snapshot, (s) => s.workshops, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public snapshot: Snapshot;
}

@Entity()
export class Participant extends CPABaseEntity {
  @Column()
  public name: string;

  @ManyToMany(() => Workshop)
  @JoinTable()
  public workshops: Workshop[];
}

@Entity()
export class Response extends CPABaseEntity {
  @ManyToOne(() => Participant, { onDelete: 'CASCADE' })
  public participant: Participant;

  /**
   * @deprecated Since the addition of the participant relationship
   */
  @Column({ nullable: true })
  public name: string;

  /**
   * @deprecated Since the addition of the participant relationship
   */
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public notes: string;

  @Column({ type: 'simple-json', nullable: true })
  public shapes: string | object;

  @ManyToOne(() => Snapshot, (s) => s.responses, { onDelete: 'CASCADE' })
  public snapshot: Snapshot;

  @ManyToOne(() => Scenario, (s) => s.responses, { onDelete: 'CASCADE' })
  public scenario: Scenario;

  @ManyToOne(() => Workshop, (w) => w.responses, { onDelete: 'CASCADE' })
  public workshop: Workshop;
}

//
// Abstract interfaces to prevent circular dependencies and any entity initialization errors due to ordering.
//
export interface IWorkshop extends CPABaseEntity {
  title: string;

  description: string;

  alias: string;

  date: Date;

  snapshots: WorkshopSnapshot[];

  scenarios: WorkshopScenario[];

  responses: Response[];
}

export interface IScenario extends CPABaseEntity {
  title: string;

  description: string;

  mapCenter: string;

  zoom: number;

  extent: __esri.Extent;

  layers: Array<LayerReference>;

  workshopScenario: WorkshopScenario;

  responses: Response[];
}

export interface IWorkshopScenario extends CPABaseEntity {
  workshop: IWorkshop;

  scenario: IScenario;
}

export interface CPALayer {
  /**
   * Esri layer definition.
   *
   * Used when the layer group is 'feature'.
   */
  url?: string;

  /**
   * Esri graphics in their JSON portal representation.
   *
   * Used when the layer type is 'graphics'.
   */
  graphics?: Array<IGraphic>;

  /**
   * Esri layer definitions.
   *
   * Used when the layer type is 'group'
   */
  layers?: Array<CPALayer>;

  /**
   * Layer metadata
   */
  info?: ILayerConfiguration;
}

export interface LayerReference {
  guid: string;
  type: 'snapshot' | 'response' | 'scenario' | 'snapshot-responses';
}

export type ScenarioLayers = CPALayer | LayerReference;

export interface IParticipant extends CPABaseEntity {
  name: string;
  workshops: Workshop[];
}
