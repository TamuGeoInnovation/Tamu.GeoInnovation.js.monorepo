import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Fields } from '../fields/fields.entity';

@Entity({ name: 'dataGroupFlds' })
export class DataGroupFlds extends BaseEntity {
  @PrimaryGeneratedColumn()
  public dataGroupFlds_ID: number;

  @Column()
  public dataGroupID: number;

  @Column()
  public fieldID: number;

  @JoinColumn({
    name: 'fieldID'
  })
  @OneToOne((type) => Fields, (f) => f.fieldID)
  public field: Fields;
}
