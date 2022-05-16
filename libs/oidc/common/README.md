# TAMU GISC OIDC Common

# tamu-gisc/nest-admin-guard

## Library Scope

`@tamu-gisc/oidc/common`

## Modules

- AuthModule

## Guards

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

This configuration takes care of initializing passport and registering a global JWT passport strategy that is implemented by the `AdminGuard`.

## Utilization

Apply the `AdminGuard` to any endpoints that should be validated against the registered `AuthModule` public keys endpoint. In addition to validating against the public keys this JWT must also have a `role` claim. This claim has two properites: `client_id` and `level`. The `client_id` must equal the site / client the user is trying to access and the `level` must be `99`. If both of these conditions are satisfied then the user may proceed.

```js
import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminGuard } from '@tamu-gisc/oidc/common';

@Controller('puppies')
export class PuppiesController {
  @UseGuards(AdminGuard)
  @Get('')
  public getAllPuppies() {
    return [...] // Returns list of adorable puppies
  }
}
```

# tamu-gisc/nest-jwt-guard

This library contains a series of utilities used in the OIDC provider NestJS application and some more generic authentication utilities for use in back-end data NestJS-based data API's .

## Library Scope

`@tamu-gisc/oidc/common`

### Modules

- AuthModule

### Guards

- JwtGuard

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

This configuration takes care of initializing passport and registering a global JWT passport strategy that is implemented by the `JwtGuard`.

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
