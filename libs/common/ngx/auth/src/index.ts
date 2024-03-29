// Modules
export * from './lib/common-ngx-auth.module';

// Guards
export * from './lib/guards/role/role.guard';

// Services
export * from './lib/services/permissions/permissions.service';
export * from './lib/services/auth/auth.service';

// Injection Tokens
export * from './lib/tokens/claims.token';

// Pipes
export * from './lib/pipes/has-roles/has-roles.pipe';

// ==== LEGACY (DEPRECATED) =====
export * from './lib/legacy/legacy-common-ngx-auth.module';
export * from './lib/legacy/guards/auth.guard';
export * from './lib/legacy/services/auth/auth.service';
export * from './lib/legacy/interceptors/auth-interceptor/auth-interceptor.service';
