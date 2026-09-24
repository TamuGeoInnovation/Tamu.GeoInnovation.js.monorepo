import { InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { Repository } from 'typeorm';

import { BaseProvider } from './base-provider';

/**
 * `BaseProvider` is abstract and every provider in this library extends it, so most of them have no
 * methods of their own -- their entire behaviour is what is tested here. A concrete subclass with no
 * additions is the honest way to exercise it.
 */
interface TestEntity {
  guid: string;
  name?: string;
}

class TestProvider extends BaseProvider<TestEntity> {
  constructor(repo: Repository<TestEntity>) {
    super(repo);
  }
}

describe('BaseProvider', () => {
  let provider: TestProvider;
  let repo: jest.Mocked<Repository<TestEntity>>;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<Repository<TestEntity>>;

    provider = new TestProvider(repo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('lookup options', () => {
    // A bare string is shorthand for "by guid"; anything else is passed through as written.
    it('treats a string as a guid lookup', async () => {
      await provider.findOne('e-1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { guid: 'e-1' } });
    });

    it('passes an options object through untouched', async () => {
      const opts = { where: { name: 'thing' }, relations: ['other'] };
      await provider.find(opts);

      expect(repo.find).toHaveBeenCalledWith(opts);
    });
  });

  describe('.create()', () => {
    it('creates through the repository before saving', async () => {
      repo.create.mockReturnValue({ name: 'thing' } as never);
      repo.save.mockResolvedValue({ guid: 'e-1' } as never);

      await expect(provider.create({ name: 'thing' })).resolves.toEqual({ guid: 'e-1' });
      expect(repo.save).toHaveBeenCalledWith({ name: 'thing' });
    });
  });

  describe('.update()', () => {
    /**
     * The lookup decides which row is written. A guid in the body would otherwise override it and
     * redirect the write to a different row.
     */
    it('ignores a guid in the payload and keeps the one that was looked up', async () => {
      repo.findOne.mockResolvedValue({ guid: 'e-1', name: 'old' } as never);
      repo.save.mockImplementation((e) => Promise.resolve(e as never));

      await provider.update('e-1', { guid: 'e-hijack', name: 'new' } as never);

      expect(repo.save).toHaveBeenCalledWith({ guid: 'e-1', name: 'new' });
    });

    it('merges onto the existing row rather than replacing it', async () => {
      repo.findOne.mockResolvedValue({ guid: 'e-1', name: 'old' } as never);
      repo.save.mockImplementation((e) => Promise.resolve(e as never));

      await provider.update('e-1', {} as never);

      expect(repo.save).toHaveBeenCalledWith({ guid: 'e-1', name: 'old' });
    });

    it('reports not found when the row does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(provider.update('missing', { name: 'new' } as never)).rejects.toThrow(
        NotFoundException
      );
    });

    it('creates the row instead when asked to', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ name: 'new' } as never);
      repo.save.mockResolvedValue({ guid: 'e-new' } as never);

      await expect(provider.update('missing', { name: 'new' } as never, true)).resolves.toEqual({
        guid: 'e-new'
      });
    });
  });

  describe('.deleteEntity()', () => {
    it('removes the row it found', async () => {
      const entity = { guid: 'e-1' };
      repo.findOne.mockResolvedValue(entity as never);

      await provider.deleteEntity('e-1');

      expect(repo.remove).toHaveBeenCalledWith(entity);
    });

    it('reports not found rather than removing nothing quietly', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(provider.deleteEntity('missing')).rejects.toThrow(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });

  describe('.deleteEntities()', () => {
    it('splits a comma-separated string', async () => {
      repo.delete.mockResolvedValue({ affected: 2 } as never);

      await provider.deleteEntities('e-1,e-2');

      expect(repo.delete).toHaveBeenCalledWith(['e-1', 'e-2']);
    });

    it('accepts an array as given', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as never);

      await provider.deleteEntities(['e-1']);

      expect(repo.delete).toHaveBeenCalledWith(['e-1']);
    });

    /**
     * Regression coverage.
     *
     * The guard was `if (eventGuidsArray.length === 0)`, but `''.split(',')` yields `['']` -- an
     * array of length one. It never fired, so an empty string reached the repository as a delete
     * for a blank guid.
     */
    it('rejects an empty string instead of deleting a blank guid', async () => {
      await expect(provider.deleteEntities('')).rejects.toThrow(UnprocessableEntityException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    /**
     * Regression coverage.
     *
     * An empty array satisfied neither the string branch nor the `length > 0` array branch, so the
     * method fell off the end and resolved `undefined`. The caller received a success for a delete
     * that never ran.
     */
    it('rejects an empty array instead of resolving undefined', async () => {
      await expect(provider.deleteEntities([])).rejects.toThrow(UnprocessableEntityException);
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('drops blank entries from a trailing or doubled comma', async () => {
      repo.delete.mockResolvedValue({ affected: 2 } as never);

      await provider.deleteEntities('e-1,,e-2,');

      expect(repo.delete).toHaveBeenCalledWith(['e-1', 'e-2']);
    });

    /**
     * Regression coverage.
     *
     * The delete was returned from inside the `try` without being awaited, so its rejection settled
     * outside the block and the catch never ran.
     */
    it('translates a failed delete into a 500 with its own message', async () => {
      repo.delete.mockRejectedValue(new Error('constraint violation'));

      await expect(provider.deleteEntities(['e-1'])).rejects.toThrow(InternalServerErrorException);
    });
  });
});
