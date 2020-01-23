import { Entity, Column } from 'typeorm';

import { CPABaseEntity } from '../base/cpaBase.entity';

@Entity()
export class WorkshopScenario extends CPABaseEntity {
  @Column()
  public workshopGuid: string;

  @Column()
  public scenarioGuid: string;
}
