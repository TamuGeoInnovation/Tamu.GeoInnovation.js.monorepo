import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm';

@Entity({ name: 'dataGroup' })
export class DataGroups extends BaseEntity {
  @PrimaryGeneratedColumn()
  public dataGroupID: number;

  @Column()
  public node_ID: number;

  @Column()
  public dataGroupName: string;

  @Column()
  public dataGroupDesc: string;
}
