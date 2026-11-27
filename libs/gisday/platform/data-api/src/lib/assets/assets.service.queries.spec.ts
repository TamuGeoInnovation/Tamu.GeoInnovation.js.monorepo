import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Asset } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { AssetsService } from './assets.service';

// The service's queries as typeorm builds them, with the real entity (#2363). assets.service.spec.ts mocks the repository,
// so it would pass a query typeorm 1 refuses. deleteAssets is checked in asset-deletes.queries.spec.ts; saveAsset writes
// to disk and only saves.
describe('AssetsService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: AssetsService;
  let assetRepo: Repository<Asset>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    assetRepo = queryCheckingRepository(dataSource, Asset);
    service = new AssetsService(assetRepo);
  });

  it('looks an asset up by its guid', async () => {
    await expect(service.findOne('a-1')).rejects.toThrow(NotFoundException);
  });

  it("keeps a deleted asset's file while another row still uses its path", async () => {
    // Another row uses it, so the file is left alone and nothing on disk is touched.
    const build = assetRepo.count;
    assetRepo.count = async (options) => (await build(options), 1);

    const asset = Object.assign(new Asset(), {
      guid: 'a-1',
      name: 'logo.png',
      path: 'images/sponsors/logo.png',
      type: null
    });

    await expect(service.deleteAssetFiles([asset])).resolves.toBeUndefined();
  });
});
