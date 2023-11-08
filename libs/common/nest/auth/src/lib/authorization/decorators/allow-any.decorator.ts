import { SetMetadata } from '@nestjs/common';

export /**
 * To be used with `JWTGuard`. Provides a convenient way to include user context in the request object.
 * for resources that should be accessible by any user, regardless of authentication status, but have
 * different behavior based on authentication status (e.g. adding or removing properties from a standard response).
 */
const AllowAny = () => SetMetadata('AllowAny', 'true');
