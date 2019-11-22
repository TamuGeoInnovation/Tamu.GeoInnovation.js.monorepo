import { Controller, Get, Param } from '@nestjs/common';
import { BaseEntity, FindManyOptions } from 'typeorm';

import { BaseService } from './base.service';

@Controller()
export abstract class BaseController<Entity extends BaseEntity> {
  /**
   * Creates an instance of BaseController.
   *
   *
   * @param s Service class for the respective entity
   * @param [mappings] Optional value that can be provided to override default entity target options for a given action method.
   *
   * For example, the generic GET `/:id` route will, by default, call the entity service class method with the following find options:
   *
   * ```
   * {
   *  id: <paramValue>
   * }
   * ```
   *
   * Different entities can and most often do have different lookup keys. For an entity where the lookup column is not `id` and is instead,
   * `guid` for example, this optional definition enables an extending controller to define the following:
   *
   * ```
   * {
   *   guid: <paramValue>
   * }
   * ```
   */
  constructor(private readonly s: BaseService<Entity>, private mappings?: BaseActions<BaseController<Entity>, Entity>) {}

  @Get()
  public getAll() {
    return this.s.getAll();
  }

  @Get(':id')
  public getMatching(@Param() params) {
    // Default service method options
    let options: FindManyOptions<Entity> = {
      where: { id: params.id }
    };

    options = this.overrideOptions(options, this.mappings, this.getMatching);

    return this.s.getMany(options);
  }

  /**
   * Copies and replaces a `FindManyOptions` configuration object with
   * any overrides specified.
   */
  private overrideOptions(
    options: FindManyOptions<Entity>,
    definitions: BaseActions<BaseController<Entity>, Entity>,
    ref: Function
  ): FindManyOptions<Entity> {
    const targetCollection = definitions[ref.name];

    // Process the options tree recursively, performing any option key replacements.
    const process = (currentObject) => {
      return Object.keys(currentObject).reduce((acc, curr) => {
        // If the current option key has an object for value, nested options need to be evaluated.
        if (typeof currentObject[curr] === 'object') {
          acc[curr] = process(currentObject[curr]);
        } else {
          if (targetCollection.hasOwnProperty(curr)) {
            acc[targetCollection[curr]] = currentObject[curr];
          } else {
            acc[curr] = currentObject[curr];
          }
        }

        return acc;
      }, {});
    };

    if (targetCollection) {
      return process(options);
    } else {
      return options;
    }
  }
}

// Type that maps through class properties and returns them in an object collection.
//
// Each object has, as a value, an object which can be provided with parameter overrides as keys,
// and values of those as respective defined entity class columns.
export type BaseActions<T, U> = {
  [P in keyof T]?: {
    [key: string]: keyof U;
  };
};
