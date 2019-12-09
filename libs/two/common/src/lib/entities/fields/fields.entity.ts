import { Column, PrimaryGeneratedColumn, Entity, BaseEntity } from 'typeorm';

@Entity({ name: 'All_Fields' })
export class Fields extends BaseEntity {
  @PrimaryGeneratedColumn()
  public fieldID: number;

  @Column()
  public tableId: number;

  @Column()
  public fieldUnits: string;

  @Column()
  public fieldDescription: string;

  @Column()
  public fieldEditDate: Date;

  @Column()
  public fieldName: string;

  @Column()
  public updatedBy: string;
}
