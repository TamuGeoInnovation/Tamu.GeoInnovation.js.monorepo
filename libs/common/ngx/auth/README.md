# common-ngx-auth

This library contains several pieces that can be used in unison to restrict the access of angular application routes or service request and optionally redirect to request user authentication.

Exposed are:

- A simple route guard that implements `CanActivate`. More interface implementations will be added in the future.
- An http interceptor service that automatically redirects to a URL for authentication whenever an http request returns a 401/403 status code. Also exports a custom provider for the http interceptor.
- An auth service that can be used to test if a user is authenticated or not. Used in the route guard.

## Using the Guard

`import { AuthGuard } from '@tamu-gisc/common/ngx/auth';`

In Angular route definitions:

```js
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('path/to/module').then((m) => m.LazyModule),
    canActivate: [AuthGuard]
  }
];
```

## Using the HTTP interceptor

`import { AuthProvider } from '@tamu-gisc/common/ngx/auth';`

In the root application module include it in the providers array:

```js
@NgModule({
imports: [...],
declarations: [...],
providers: [AuthProvider],
bootstrap: [...]
})
export class AppModule {}
```

## Using the auth service

`import { AuthService } from '@tamu-gisc/common/ngx/auth';`

In a component or guard:

```js
export class CustomComponent implements OnInit {
  constructor(private auth: AuthService) {}

  public ngOnInit() {
    this.auth.isAuthenticated().subscribe(status => {
      console.log(`User is authenticated: $status`);
    })
  }

}
```

### App environment requirements

The auth interceptor and service require the variable `auth_url` to be exported from the application environments. This URL should point to the base API that itself implements idp client sub-routes (`oidc/login`).

Alternatively the variable `auth_options` of type `AuthOptions`, from `@tamu-gisc/oidc/client`, can be exported from the same environment.

## Running unit tests

Run `nx test common-ngx-auth` to execute the unit tests.
