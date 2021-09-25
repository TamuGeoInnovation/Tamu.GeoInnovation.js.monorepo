## Common NestJS Guards

### QueryParamsGuard

Validates a request to ensure it has one or more query parameters. In the absence of ALL provided query parameters, the guard will throw a provided error. **Requires** the use of the `RequiredQueryParams` decorator.

Usage:

```js
import { QueryParamGuard, BadRequestException } from '@tamu-gisc/common/nest/guards';

@Controller('resource')
export class ResourceController {
  @RequiredQueryParams(['resource_id'], BadRequestException)
  @UseGuards(QueryParamGuard)
  @Get('')
  public getData() {
    return {data};
  }
}
```

If the incoming request does not contain the `resource_id` query parameter, NestJS will throw a `BadRequestException`.

```js
{
    "statusCode": 400,
    "message": "Bad Request"
}
```
