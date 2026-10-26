import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';
import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';

import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

// A 5 MiB body to a real local server: 5,248 ms under load, so Jest's 5 s default sat on the edge (#2379).
const UPLOAD_TEST_TIMEOUT_MS = 30000;

describe('OrganizationController upload limits', () => {
  let app: INestApplication;
  let url: string;
  const createOrganization = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [{ provide: OrganizationService, useValue: { createOrganization } }]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions: ['create:organizations'] };
          return true;
        }
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers 413 for an organization logo over the shared file-size limit', async () => {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(DEFAULT_UPLOAD_LIMITS.fileSize + 1)], { type: 'image/png' }),
      'logo.png'
    );

    const response = await fetch(`${url}/organizations`, { method: 'POST', body: form });

    expect(response.status).toBe(413);
    expect(createOrganization).not.toHaveBeenCalled();
  }, UPLOAD_TEST_TIMEOUT_MS);
});
