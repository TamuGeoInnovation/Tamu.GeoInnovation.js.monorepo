import { Transform } from 'stream';

export class RawDataRowToDto extends Transform {
  private _entity;

  constructor(entity) {
    super({ objectMode: true });

    this._entity = entity;
  }

  public _transform(chunk, encoding, callback) {
    // Call the expected static method in the provided entity to transform the
    // raw row into a dto
    const dto = this._entity.rawToDto(chunk);

    this.push(dto);
    callback();
  }
}
