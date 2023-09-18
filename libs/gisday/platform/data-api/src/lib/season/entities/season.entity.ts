import { Column } from 'typeorm';

import { GuidIdentity } from '../../entities/all.entity';

export class Season extends GuidIdentity {
  @Column({ nullable: false })
  year: number;

  @Column({ default: false })
  active: boolean;
}
