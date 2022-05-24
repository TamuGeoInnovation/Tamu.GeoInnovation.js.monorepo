# TAMU GISC OIDC Common

This library contains a series of utilities used in the OIDC provider NestJS application and some more generic authentication utilities for use in back-end data NestJS-based data API's .

## Library Scope

`@tamu-gisc/oidc/common`

### Modules

- AuthModule

### Guards

- JwtGuard
- AdminGuard

## Setup

In a root module of a NestJS application, import the `AuthModule` and provide the OIDC JWKS endpoint using the `forRoot` static method.

```js
import { Module } from '@nestjs/common';

import { AuthModule } from '@tamu-gisc/oidc/common';

import * as env from '../environments/environment';

@Module({
  imports: [AuthModule.forRoot({ jwksUrl: env.jwksUrl })]
})
export class AppModule {}
```

This configuration takes care of initializing passport and registering a global JWT passport strategy that is implemented by both `JwtGuard` and `AdminGuard`.

## Utilization

Apply the `JwtGuard` to any endpoints that should be validated against the registered `AuthModule` public keys endpoint.

```js
import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/oidc/common';

@Controller('puppies')
export class PuppiesController {
  @UseGuards(JwtGuard)
  @Get('')
  public getAllPuppies() {
    return [...] // Returns list of adorable puppies
  }
}
```

`AdminGuard` acts similar to the `JwtGuard` but will check to see if the validated JWT has an admin level role associated with the client.
