import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'NodeGroup' })
export class NodeGroups extends BaseEntity {
  @PrimaryGeneratedColumn()
  public node_ID: number;

  @Column()
  public nodeName: string;

  @Column()
  public nodeDescription: string;

  @Column()
  public tableID: number;
}
