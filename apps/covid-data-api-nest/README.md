# NestJS Covid Data API

This project is the data api for the Covid project built using the NestJS framework.

To run this project:

`ng serve covid-data-api-nest`

The following configurations are available:

- Local (Default)
- Development (`development`)
- Production (`production`)

The application can be served using any of the above configuration with:

`ng serve covid-data-api-nest [-c <configuration>]`

## Configuration

To successfully serve and build this application, two configuration files are required in the `environments` folder.

- oidc-client-config.ts
  - OIDC Client configuration
- ormconfig.ts
  - TypeORM database configuration

### OIDC Client Configuration

Requires three exports: `localClientConfig`, `devClientConfig`, `productionClientConfig`. Example of one:

```js
import { ClientConfiguration } from '@tamu-gisc/oidc';

export const localClientConfig: ClientConfiguration = {
  issuer_url: '',
  metadata: {
    client_id: '',
    client_secret: '',
    redirect_uris: [''],
    response_types: [''],
    token_endpoint_auth_method: ''
  },
  parameters: {
    scope: '',
    state: '',
    prompt: ''
  }
};
```

### TypeORM Configuration

Similarly to the above, three exports are required: `localDbConfig`, `devDbConfig`, `productionDbConfig`. An example of one:

```js
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const localDbConfig: Partial<TypeOrmModuleOptions> = {
  type: 'mysql',
  host: '',
  username: '',
  password: '',
  database: '',
  synchronize: false,
  dropSchema: false,
  logging: false,
  extra: {
    options: {
      enableArithAbort: true
    }
  }
};
```
