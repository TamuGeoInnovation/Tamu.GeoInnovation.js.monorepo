# TAMU GISC NestJS Environment

This library contains a module and a service that can be used in NestJS applications to manage and centralize environment variable access downstream from applications to libraries.

## Library Scope

`@tamu-gisc/common/nest/environment`

### Modules

- EnvironmentModule

### Services

- EnvironmentService

### Tokens

- ENVIRONMENT

## Setup

In a root module of a NestJS application, import the `EnvironmentModule` and pass in the desired environment config using the `forRoot` static method to globally register the `EnvironmentService`.

```js
import { Module } from '@nestjs/common';

import { EnvironmentModule } from '@tamu-gisc/common/nest/environment';

import * as env from '../environments/environment';

@Module({
  imports: [EnvironmentModule.forRoot(env)]
})
export class AppModule {}
```

## Utilization

Once the `EnvironmentModule` has been registered, the `EnvironmentService` can be injected into any class that is registered on the global DI container.

The `EnvironmentService` exposes one public method `value()` which accepts the token of a config property. If it is found in the configured environment object, it will return its value and `undefined` otherwise.

```js
import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

@Injectable()
export class SomeService {
  constructor(private readonly env: EnvironmentService) {
    super(repo);
  }
}

public doWork(){
  const valueFromEnv = this.env.value('somePropertyInRegisteredEnv');
}
```
