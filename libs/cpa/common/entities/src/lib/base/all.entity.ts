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

import * as guid from 'uuid/v4';

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

  @Column({ nullable: true })
  public date: Date;

  @ManyToMany((type) => Scenario, (s) => s.workshops)
  @JoinTable()
  public scenarios: Scenario[];

  @OneToMany((type) => Response, (r) => r.workshop)
  public responses: Response[];
}

@Entity()
export class Scenario extends CPABaseEntity {
  @Column()
  public title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  public description: string;

  @Column({ nullable: true })
  public mapCenter: string;

  @Column({ nullable: true })
  public zoom: number;

  @Column({ type: 'simple-json', nullable: true })
  public layers: string;

  @ManyToMany((type) => Workshop, (w) => w.scenarios)
  public workshops: Workshop[];

  @OneToMany((type) => Response, (r) => r.scenario)
  public responses: Response[];
}

@Entity()
export class Response extends CPABaseEntity {
  @Column()
  public name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public notes: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  public shapes: string;

  @ManyToOne((type) => Scenario, (s) => s.responses, { onDelete: 'CASCADE' })
  public scenario: Scenario;

  @ManyToOne((type) => Workshop, (w) => w.responses, { onDelete: 'CASCADE' })
  public workshop: Workshop;
}
