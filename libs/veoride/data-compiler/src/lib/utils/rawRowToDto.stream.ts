import { Transform } from 'stream';

export class RawDataRowToDto extends Transform {
  private _entity;
  public isPaused;
  public pushedLength;

  constructor(entity) {
    super({ objectMode: true, readableHighWaterMark: 1, writableHighWaterMark: 1 });
    this.isPaused = false;
    this.pushedLength = 0;
    this._entity = entity;
  }

  _transform(chunk, encoding, callback) {
    if (this.isPaused) {
      this.once('resume', () => {
        this._transform(chunk, encoding, callback);
      });
      return;
    }

    // Implement your transformation logic here
    const transformedChunk = this._entity.rawToDto(chunk);
    this.push(transformedChunk);
    this.pushedLength += transformedChunk.length; // increment the length of data that has been pushed

    if (this.pushedLength >= 16 * 1024) {
      // Change the value to adjust the data amount
      this.isPaused = true;
      this.pushedLength = 0;

      this.once('drain', () => {
        this.isPaused = false;
        this.emit('resume');
      });
    }

    callback();
  }
}
