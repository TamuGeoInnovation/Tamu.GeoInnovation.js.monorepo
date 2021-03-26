# ORM Config

This directory must have an `ormconfig.ts` with the exports:

- config: Used in local development
- devConfig: Used for development staging
- prodConfig: Used for production staging

The format for each of the exports is:

```js
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const config: TypeOrmModuleOptions = {
  type: '',
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
