import { Entity, PrimaryColumn, UpdateDateColumn, BaseEntity, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PersistanceRecord extends BaseEntity {
  @PrimaryColumn()
  public id: string;

  @Column()
  public value: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  public static async findOrCreate(key: string, value: string): Promise<PersistanceRecord> {
    const existing = await PersistanceRecord.findOne({
      where: {
        id: key
      }
    });

    if (existing !== undefined) {
      return existing;
    } else {
      const persistanceRecord = await PersistanceRecord.create({ id: key, value: value }).save();

      return PersistanceRecord.findOrCreate(key, value);
    }
  }
}
