// TYPEORM_EXTRA carries the driver's own options (for SQL Server, trustServerCertificate and the like). It used to reach
// TypeORM as the raw string, so the driver never saw any of them (#2201). Each environment file is read when it is
// imported, so every case loads it afresh with the variable as given.
const files = ['./environment', './environment.dev', './environment.prod'];

function ormConfigWith(file: string, extra: string | undefined) {
  const saved = process.env.TYPEORM_EXTRA;

  if (extra === undefined) {
    delete process.env.TYPEORM_EXTRA;
  } else {
    process.env.TYPEORM_EXTRA = extra;
  }

  try {
    let config;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      config = require(file).ormConfig;
    });
    return config;
  } finally {
    if (saved === undefined) {
      delete process.env.TYPEORM_EXTRA;
    } else {
      process.env.TYPEORM_EXTRA = saved;
    }
  }
}

describe.each(files)('%s ormConfig.extra', (file) => {
  it('parses a JSON value into the object the driver reads', () => {
    expect(ormConfigWith(file, '{"trustServerCertificate":true}').extra).toEqual({ trustServerCertificate: true });
  });

  it('is an empty object when the variable is empty', () => {
    expect(ormConfigWith(file, '').extra).toEqual({});
  });

  it('is an empty object when the variable is not set', () => {
    expect(ormConfigWith(file, undefined).extra).toEqual({});
  });
});
