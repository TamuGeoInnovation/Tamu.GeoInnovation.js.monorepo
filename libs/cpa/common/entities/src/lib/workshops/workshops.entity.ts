import { Entity, Column, JoinTable, ManyToMany, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

import { CPABaseEntity } from '../base/cpaBase.entity';

@Entity()
export class Workshop extends CPABaseEntity {
  @Column()
  public title: string;

  @Column()
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

  @Column()
  public description: string;

  @Column({ nullable: true })
  public mapCenter: string;

  @Column({ nullable: true })
  public zoom: number;

  @Column({ length: 'max', nullable: true })
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

  @ManyToOne((type) => Scenario, (s) => s.responses)
  public scenario: Scenario;

  @ManyToOne((type) => Workshop, (w) => w.responses)
  public workshop: Workshop;
}
