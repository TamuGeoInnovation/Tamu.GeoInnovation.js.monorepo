import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';

import { HelperController } from './helper.controller';

describe('HelperController upload limits', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [HelperController],
      providers: [{ provide: EnvironmentService, useValue: { value: jest.fn() } }]
    }).compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers 413 for a forwarded attachment over the shared file-size limit', async () => {
    const form = new FormData();
    form.append(
      'attachments',
      new Blob([new Uint8Array(DEFAULT_UPLOAD_LIMITS.fileSize + 1)], { type: 'application/octet-stream' }),
      'large.bin'
    );

    const response = await fetch(`${url}/mail`, { method: 'POST', body: form });

    expect(response.status).toBe(413);
  });
});
