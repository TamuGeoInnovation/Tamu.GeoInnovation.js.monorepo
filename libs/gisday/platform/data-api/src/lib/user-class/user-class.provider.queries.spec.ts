import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Class, UserClass } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { UserClassProvider } from './user-class.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). user-class.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
describe('UserClassProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: UserClassProvider;
  let userClassRepo: Repository<UserClass>;
  let classRepo: Repository<Class>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // A class as the API loads it: its nullable columns come back null, not undefined.
  const loadedClass = () =>
    Object.assign(new Class(), {
      guid: 'c-1',
      code: 'GEOG',
      number: '361',
      section: null,
      professorName: null,
      season: null
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
  });

  beforeEach(() => {
    statements.length = 0;
    userClassRepo = queryCheckingRepository(dataSource, UserClass);
    classRepo = queryCheckingRepository(dataSource, Class);
    provider = new UserClassProvider(userClassRepo, classRepo);
  });

  it('registers a user for a loaded class whose columns are null', async () => {
    const build = classRepo.findOne;
    classRepo.findOne = async (options) => (await build(options), loadedClass());

    const registration = await provider.insertUserClass('c-1', 'auth0|someone');

    expect(registration.class.guid).toBe('c-1');
  });

  it("lists a user's classes", async () => {
    await expect(provider.getUserClasses('auth0|someone')).resolves.toEqual([]);
  });

  it("deletes a user's registration for a class by its key", async () => {
    const build = userClassRepo.findOne;
    userClassRepo.findOne = async (options) => (
      await build(options),
      Object.assign(new UserClass(), { guid: 'uc-1', accountGuid: 'auth0|someone', class: loadedClass() })
    );

    await provider.deleteUserClassRegistration('c-1', 'auth0|someone');

    const deletes = statements.filter((s) => /^\s*DELETE FROM "user_classes"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['uc-1']]);
  });

  it('refuses to delete a registration that does not exist', async () => {
    await expect(provider.deleteUserClassRegistration('c-1', 'auth0|someone')).rejects.toThrow(NotFoundException);
  });
});
