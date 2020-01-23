import { Entity, Column, JoinTable, ManyToMany } from 'typeorm';

import { CPABaseEntity } from '../base/cpaBase.entity';

// import { Scenario } from '../scenarios/scenarios.entity';

@Entity()
export class Workshop extends CPABaseEntity {
  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column({ nullable: true })
  public date: Date;

  @ManyToMany((type) => Scenario)
  @JoinTable()
  public scenarios: Scenario[];
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

  @ManyToMany((type) => Workshop)
  public workshops: Workshop[];
}
