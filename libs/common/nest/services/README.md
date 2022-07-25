# TAMU GISC NestJS Services

This library contains a module and a service that can be used in NestJS applications to simply and reliably send emails without having to implement `nodemailer` each time.

## Library Scope

`@tamu-gisc/common/nest/services`

### Modules

- CommonNestServicesModule

### Services

- MailerService

### Required environment variables

- mailroomUrl: string

## Setup

This module, at the moment, requires that you import the `EnvironmentModule` from `@tamu-gisc/common/nest/environment` into the root module of your NestJS application. This will allow us to define a `mailroomUrl` inside our `environment` that will point to the running `mailroom-nest` instance the application will utilize.

With the `EnvironmentModule` imported in our root module, import `CommonNestServicesModule` into the module where email sending functionality is required.

```js
import { Module } from '@nestjs/common';

import { CommonNestServicesModule } from '@tamu-gisc/common/nest/services';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { OidcModule } from '../oidc/oidc.module';

@Module({
  imports: [OidcModule, CommonNestServicesModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}
```

Afterwards, inject the `MailerService` and call the `sendMail()` method:

```js
import { CommonNestServicesModule } from '@tamu-gisc/common/nest/services';

@Injectable()
export class SomeService {
  constructor(private readonly mailerService: MailerService) {}
}

public sendEmail(){
  const email: IMailroomEmailOutbound = {
	to: ''
	from: '',
	subject: '',
	text: '',
	html: '',
  }

  this.mailerService.sendMail(email);
}
```
