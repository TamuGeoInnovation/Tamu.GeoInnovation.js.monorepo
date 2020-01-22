import { Entity, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'Responses' })
export class Responses extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @PrimaryColumn()
  public guid: string;

  @Column()
  public workshopGuid: string;

  @Column()
  public scenarioGuid: string;

  @Column()
  public name: string;

  @Column({ length: 'max' })
  public notes: string;

  @Column({ length: 'max' })
  public shapes: string;
}
