import { BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseDatestampedEntity {
  /**
   * The date this entity was created.
   */
  @CreateDateColumn({ type: 'datetime', nullable: true })
  added: Date;

  /**
   * The date this entity was last updated.
   */
  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updated: Date;

  @BeforeInsert()
  private _setAdded(): void {
    if (this.added === undefined) {
      this.added = new Date();
    }
  }

  @BeforeUpdate()
  private _setUpdated(): void {
    if (this.updated === undefined) {
      this.updated = new Date();
    }
  }
}

// This class can be extended by other entities to inherit the created and updated date columns.
// It provides a consistent way to track when an entity was created and last modified, which is useful for auditing and data management purposes.
