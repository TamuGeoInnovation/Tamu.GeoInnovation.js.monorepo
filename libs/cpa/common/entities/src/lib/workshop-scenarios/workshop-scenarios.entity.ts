import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'WorkshopScenarios' })
export class WorkshopScenarios extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @Column()
  public workshopGuid: string;

  @Column()
  public scenarioGuid: string;
}
