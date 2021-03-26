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
  JoinColumn
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

  @OneToMany((type) => WorkshopSnapshot, (s) => s.workshop)
  public snapshots: WorkshopSnapshot[];

  @OneToMany((type) => WorkshopScenario, (s) => s.workshop)
  public scenarios: WorkshopScenario[];

  @OneToMany((type) => WorkshopContext, (s) => s.workshop)
  public contexts: WorkshopContext[];

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
  public extent: __esri.Extent;

  @Column({ type: 'simple-json', nullable: true })
  public layers: Array<CPALayer>;

  @Column({ type: 'bit', nullable: false })
  public isContextual = false;

  @OneToMany((type) => WorkshopSnapshot, (w) => w.snapshot, { onDelete: 'CASCADE' })
  public workshops: WorkshopSnapshot[];

  @OneToMany((type) => Response, (r) => r.snapshot)
  public responses: Response[];
}

@Entity({ name: 'workshop_snapshots' })
export class WorkshopSnapshot extends CPABaseEntity {
  @ManyToOne((type) => Workshop, (w) => w.snapshots, { onDelete: 'CASCADE' })
  public workshop: Workshop;

  @ManyToOne((type) => Snapshot, (s) => s.workshops, {
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

  @Column({ nullable: true })
  public zoom: number;

  @Column({ type: 'simple-json', nullable: true })
  public extent: __esri.Extent;

  @Column({ type: 'simple-json', nullable: true })
  public layers: Array<LayerReference>;

  @OneToOne((type) => WorkshopScenario, (w) => w.scenario)
  public workshopScenario: IWorkshopScenario;

  @OneToMany((type) => Response, (r) => r.scenario)
  public responses: Response[];
}

@Entity({ name: 'workshop_scenarios' })
export class WorkshopScenario extends CPABaseEntity implements IWorkshopScenario {
  @ManyToOne((type) => Workshop, (w) => w.scenarios, { onDelete: 'CASCADE' })
  public workshop: IWorkshop;

  @OneToOne((type) => Scenario, (s) => s.workshopScenario, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public scenario: IScenario;
}

@Entity({ name: 'workshop_contexts' })
export class WorkshopContext extends CPABaseEntity {
  @ManyToOne((type) => Workshop, (w) => w.contexts)
  public workshop: IWorkshop;

  @ManyToOne((type) => Snapshot, (s) => s.workshops, {
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  public snapshot: Snapshot;
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
  type: 'snapshot' | 'response' | 'scenario';
}

export type ScenarioLayers = CPALayer | LayerReference;
