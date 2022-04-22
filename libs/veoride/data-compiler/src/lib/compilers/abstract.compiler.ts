import { createWriteStream, promises, constants } from 'fs';
import { BaseEntity, getRepository, ObjectType, SelectQueryBuilder } from 'typeorm';
import { ReadStream } from 'typeorm/platform/PlatformTools';

import { DataTask } from '@tamu-gisc/veoride/common/entities';
import { Stringify } from '../utils/stringify.stream';
import { RawDataRowToDto } from '../utils/rawRowToDto.stream';

export abstract class AbstractVeorideDataCompiler<T extends BaseEntity> {
  public entity: ObjectType<T>;
  public alias: string;
  public task: DataTask;

  constructor(task: DataTask, entity: ObjectType<T>, alias: string) {
    this.task = task;
    this.entity = entity;
    this.alias = alias;
  }

  private async getStream(): Promise<ReadStream> {
    return (await this.getQueryBuilder()).stream();
  }

  private async getQueryBuilder() {
    const builder = await getRepository(this.entity).createQueryBuilder(this.alias);

    return this.select(builder, this.serializeParameters());
  }

  /**
   * Applies the select conditions for the resource query builder.
   *
   * The returned builder will be wrapped around a read stream.
   * @param {SelectQueryBuilder<T>} builder Constructed resource query builder
   * @param {*} resourceQueryParameters Serialized query parameters from the data task parameters column
   */
  // tslint:disable-next-line: no-any
  public abstract select(builder: SelectQueryBuilder<T>, resourceQueryParameters: unknown): SelectQueryBuilder<T>;

  public writeTo(path: string): Promise<void> {
    return new Promise((r, rj) => {
      try {
        // Remove the file name and extension from the provided path.
        const directoryParts = path.split('/');
        directoryParts.pop();
        directoryParts.join('/');
        const directory = directoryParts.join('/');

        this.verifyWritePath(directory)
          .then(() => {
            return this.getStream();
          })
          .then((readStream) => {
            const writeStream = createWriteStream(path, { encoding: 'utf8' });
            const stringify = new Stringify('json');
            const dtoer = new RawDataRowToDto(this.entity);

            readStream.pipe(dtoer).pipe(stringify).pipe(writeStream);

            writeStream.on('error', (err) => {
              throw new Error(err.message);
            });

            writeStream.on('close', () => {
              r();
            });
          });
      } catch (err) {
        rj(err.message);
      }
    });
  }

  public serializeParameters() {
    return JSON.parse(this.task.parameters);
  }

  /**
   * Ensures that the write path exists
   */
  private async verifyWritePath(path: string) {
    try {
      await promises.access(path, constants.R_OK);

      // Directory exists
      return;
    } catch (err) {
      // If error, the directory does not exist.

      await promises.mkdir(path);

      return;
    }
  }
}
