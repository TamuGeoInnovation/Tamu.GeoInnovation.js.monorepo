import { VgiArcgisPublisher } from './vgi-arcgis-publisher.service';

/**
 * #2433: each VGI submission, its photos and its review status are published to the season's ArcGIS
 * Online layer. Here ArcGIS Online is a stand-in that records what it was sent.
 */
describe('VgiArcgisPublisher', () => {
  const layer = 'https://services.arcgis.test/org/arcgis/rest/services/VGI_2026/FeatureServer/0';
  const form = {
    model: [
      {
        attribute: 'memorial_type',
        isDiscriminator: true,
        options: [{ name: 'Tree or bench memorial plaque', value: 'tree_bench_plaque', nameAttribute: 'memorial_name' }]
      },
      { attribute: 'memorial_name', options: [] }
    ]
  };

  const saved = (overrides: Record<string, unknown> = {}) => ({
    guid: '0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11',
    created: new Date('2026-11-12T16:00:00Z'),
    userGuid: 'google-oauth2|1234567890',
    value: { memorial_type: 'tree_bench_plaque', memorial_name: 'John Smith' },
    location: { latitude: '30.61316', longitude: '-96.34062', accuracy: '5.00' },
    validationStatus: { status: 'verified', verifiedBy: 'automatic' },
    blobs: [{ blob: Buffer.from('jpeg-1'), mimeType: 'image/jpeg', fieldName: 'head1' }],
    season: { guid: 'cs-2026', form },
    ...overrides
  });

  type Call = {
    url: string;
    address: string;
    method: string;
    body: Record<string, string>;
    headers: Record<string, string>;
    file?: string;
    timed: boolean;
  };
  let calls: Array<Call>;
  let existing: Array<number>;
  let attachments: Array<string>;
  let arcgisError: string | undefined;
  let findOne: jest.Mock;
  let find: jest.Mock;
  let publisher: VgiArcgisPublisher;

  const env = { ...process.env };

  const respond = (call: Call) => {
    if (arcgisError) {
      return { error: { code: 498, message: arcgisError } };
    }
    if (call.url.endsWith('/oauth2/token')) {
      return { access_token: 'token-1', expires_in: 7200 };
    }
    if (call.url.endsWith('/query')) {
      return { objectIdFieldName: 'OBJECTID', objectIds: existing.length ? existing : null };
    }
    if (call.url.endsWith('/addFeatures')) {
      return { addResults: [{ objectId: 41, success: true }] };
    }
    if (call.url.endsWith('/updateFeatures')) {
      return { updateResults: [{ objectId: existing[0], success: true }] };
    }
    if (call.url.endsWith('/attachments')) {
      return { attachmentInfos: attachments.map((name, i) => ({ id: i + 1, name })) };
    }
    if (call.url.endsWith('/addAttachment')) {
      return { addAttachmentResult: { objectId: 1, success: true } };
    }

    throw new Error(`Unexpected call to ${call.url}`);
  };

  const sent = (ending: string) => calls.filter((c) => c.url.endsWith(ending));

  beforeEach(() => {
    calls = [];
    existing = [];
    attachments = [];
    arcgisError = undefined;

    process.env.VGI_ARCGIS_LAYER_URL = layer;
    process.env.VGI_ARCGIS_CLIENT_ID = 'client-id';
    process.env.VGI_ARCGIS_CLIENT_SECRET = 'client-secret';

    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input).split('?')[0];
      const query = Object.fromEntries(new URL(String(input)).searchParams);
      let body: Record<string, string> = query;
      let file: string | undefined;

      if (init?.body instanceof URLSearchParams) {
        body = Object.fromEntries(init.body);
      } else if (init?.body instanceof FormData) {
        const attachment = init.body.get('attachment');
        file = attachment instanceof File ? attachment.name : undefined;
        body = Object.fromEntries([...init.body.entries()].filter(([, v]) => typeof v === 'string')) as Record<
          string,
          string
        >;
      }

      const call = {
        url,
        address: String(input),
        method: init?.method ?? 'GET',
        body,
        headers: Object.fromEntries(new Headers(init?.headers)),
        file,
        timed: init?.signal instanceof AbortSignal
      };
      calls.push(call);

      return new Response(JSON.stringify(respond(call)), { status: 200 });
    });

    findOne = jest.fn(() => Promise.resolve(saved()));
    find = jest.fn(() => Promise.resolve([saved()]));
    publisher = new VgiArcgisPublisher({ findOne, find } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...env };
  });

  it('publishes nothing, and asks nothing of ArcGIS Online, until it is configured', async () => {
    delete process.env.VGI_ARCGIS_LAYER_URL;

    await expect(publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11')).resolves.toBe('not configured');
    expect(calls).toEqual([]);
  });

  it('adds a new submission as a point with its fields, and its photos as attachments', async () => {
    await expect(publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11')).resolves.toBe('added');

    expect(sent('/oauth2/token')).toEqual([
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          client_id: 'client-id',
          client_secret: 'client-secret',
          grant_type: 'client_credentials'
        })
      })
    ]);
    expect(sent('/query')[0].body).toEqual(
      expect.objectContaining({
        where: "submission_id = '0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11'",
        returnIdsOnly: 'true'
      })
    );

    const [added] = JSON.parse(sent('/addFeatures')[0].body.features);
    expect(added).toEqual({
      geometry: { x: -96.34062, y: 30.61316, spatialReference: { wkid: 4326 } },
      attributes: {
        submission_id: '0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11',
        memorial_type: 'tree_bench_plaque',
        memorial_name: 'John Smith',
        submitted: Date.parse('2026-11-12T16:00:00Z'),
        review_status: 'verified',
        accuracy_m: 5,
        participant: expect.stringMatching(/^[0-9a-f]{16}$/)
      }
    });
    expect(sent('/addAttachment')).toEqual([
      expect.objectContaining({ url: `${layer}/41/addAttachment`, file: 'head1.jpeg' })
    ]);
  });

  // #2434 review: addresses end up in proxy and server logs, so the token never goes in one.
  it('sends the access token in a header on every call, never in an address or a form', async () => {
    existing = [7];
    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');
    existing = [];
    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');

    const layerCalls = calls.filter((c) => !c.url.endsWith('/oauth2/token'));

    expect(layerCalls.map((c) => c.url)).toEqual(
      expect.arrayContaining([`${layer}/query`, `${layer}/updateFeatures`, `${layer}/7/attachments`, `${layer}/addFeatures`])
    );
    expect(calls.filter((c) => c.address.includes('token-1'))).toEqual([]);
    expect(calls.filter((c) => JSON.stringify(c.body).includes('token-1'))).toEqual([]);
    expect(layerCalls.every((c) => c.headers['x-esri-authorization'] === 'Bearer token-1')).toBe(true);
  });

  // #2434 review: a hung call must not leave a publish pending for good.
  it('gives every call to ArcGIS Online a timeout', async () => {
    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');

    expect(calls.length).toBeGreaterThan(3);
    expect(calls.every((c) => c.timed)).toBe(true);
  });

  it('never sends who the participant is, only an id that is the same for each of their submissions', async () => {
    await publisher.publish('a');
    const first = JSON.parse(sent('/addFeatures')[0].body.features)[0].attributes.participant;

    findOne.mockResolvedValue(saved({ guid: 'b' }));
    await publisher.publish('b');
    const second = JSON.parse(sent('/addFeatures')[1].body.features)[0].attributes.participant;

    expect(first).toBe(second);
    expect(JSON.stringify(calls)).not.toContain('google-oauth2');
    expect(JSON.stringify(calls)).not.toContain('1234567890');
  });

  it('updates the point already published for a submission, and does not add its photos twice', async () => {
    existing = [7];
    attachments = ['head1.jpeg'];
    findOne.mockResolvedValue(saved({ validationStatus: { status: 'discarded', verifiedBy: 'auth0|reviewer' } }));

    await expect(publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11')).resolves.toBe('updated');

    const [updated] = JSON.parse(sent('/updateFeatures')[0].body.features);
    expect(updated.attributes).toEqual(expect.objectContaining({ OBJECTID: 7, review_status: 'discarded' }));
    expect(sent('/addFeatures')).toEqual([]);
    expect(sent('/addAttachment')).toEqual([]);
  });

  it('adds the photos of a point published without them, after an outage', async () => {
    existing = [7];
    attachments = [];

    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');

    expect(sent('/addAttachment')).toEqual([expect.objectContaining({ url: `${layer}/7/addAttachment` })]);
  });

  // #2434 review: one of several photo uploads failing must not leave the point short of it for good.
  it('adds only the photos the point is missing, by name', async () => {
    existing = [7];
    attachments = ['head1.jpeg'];
    findOne.mockResolvedValue(
      saved({
        blobs: [
          { blob: Buffer.from('jpeg-1'), mimeType: 'image/jpeg', fieldName: 'head1' },
          { blob: Buffer.from('jpeg-2'), mimeType: 'image/jpeg', fieldName: 'head2' }
        ]
      })
    );

    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');

    expect(sent('/addAttachment').map((c) => c.file)).toEqual(['head2.jpeg']);
  });

  it('publishes a submission with no review status yet as unverified', async () => {
    findOne.mockResolvedValue(saved({ validationStatus: null }));

    await publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11');

    expect(JSON.parse(sent('/addFeatures')[0].body.features)[0].attributes.review_status).toBe('unverified');
  });

  it('signs in once and reuses the token until it expires', async () => {
    await publisher.publish('a');
    await publisher.publish('b');

    expect(sent('/oauth2/token')).toHaveLength(1);
  });

  // #2434 review: several saves at once share one sign-in.
  it('shares one sign-in between publishes that start together', async () => {
    await Promise.all([publisher.publish('a'), publisher.publish('b'), publisher.publish('c')]);

    expect(sent('/oauth2/token')).toHaveLength(1);
  });

  it('signs in again after a sign-in fails', async () => {
    arcgisError = 'Unavailable.';
    await expect(publisher.publish('a')).rejects.toThrow();

    arcgisError = undefined;
    await expect(publisher.publish('a')).resolves.toBe('added');
    expect(sent('/oauth2/token')).toHaveLength(2);
  });

  it('fails when ArcGIS Online answers with an error, as it does with status 200', async () => {
    arcgisError = 'Invalid token.';

    await expect(publisher.publish('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11')).rejects.toThrow(/Invalid token/);
  });

  it('publishes in the background without ever failing the caller', async () => {
    arcgisError = 'Service unavailable.';

    expect(() => publisher.publishInBackground('0b8e2f0e-6a0e-4b8a-9d8a-0f6f3b9e2c11')).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it("publishes every one of a season's submissions, and counts what failed", async () => {
    find.mockResolvedValue([saved({ guid: 'a' }), saved({ guid: 'b' })]);
    findOne.mockImplementation(({ where }) =>
      where.guid === 'b' ? Promise.reject(new Error('gone')) : Promise.resolve(saved({ guid: where.guid }))
    );

    await expect(publisher.publishSeason('cs-2026')).resolves.toEqual({ published: 1, failed: 1 });
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ where: { season: { guid: 'cs-2026' } } }));
  });

  // #2434 review: a season of a few hundred submissions takes minutes, longer than a request may.
  it('starts publishing a season in the background, and answers at once with how many', async () => {
    find.mockResolvedValue([saved({ guid: 'a' }), saved({ guid: 'b' })]);
    const waiting: Array<() => void> = [];
    findOne.mockImplementation(
      ({ where }) => new Promise((resolve) => waiting.push(() => resolve(saved({ guid: where.guid }))))
    );

    await expect(publisher.publishSeasonInBackground('cs-2026')).resolves.toEqual({ queued: 2 });
    expect(sent('/addFeatures')).toEqual([]);

    await expect(publisher.publishSeasonInBackground('cs-2026')).resolves.toEqual({ queued: 0, alreadyRunning: true });

    while (waiting.length) {
      waiting.shift()();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });

  it('says publishing is not set up instead of starting', async () => {
    delete process.env.VGI_ARCGIS_CLIENT_SECRET;

    await expect(publisher.publishSeasonInBackground('cs-2026')).resolves.toEqual({ queued: 0, configured: false });
    expect(find).not.toHaveBeenCalled();
  });
});
