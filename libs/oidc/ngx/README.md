# OIDC Ngx Common Routes

This library contains a couple of logic-less routes and components that can be imported into an Angular application that utilizes the `angular-auth-oidc-client` for certain authentication flows. It is meant to be used in conjunction with the built-in `angular-auth-oidc-client` router guards for auto-login and redirection.

## Motivation

SPA's implementing the implicit flow require a static callback/redirect uri that the IdP will return the client to once authentication has completed. The return point can be a simple lightweight component or on the other side of the spectrum, a component that renders many additional components before redirecting to the application url that initiated the authentication flow. By having common routes:

- All applications can use the same callback/return/redirect URL (e.g. `/auth/callback`).
- The component loaded by (`/auth/callback`) is purposefully lightweight to guarantee no wasted time loading unnecessary components and logic and reduce the time to application destination redirection.

## Library Scope

`@tamu-gisc/oidc/ngx`

## Modules

- AuthRoutingModule

## Using

In any angular application root (preferably in the same module that imports the `oidc-auth-oidc-client` `AuthModule`), import the `AuthRoutingModule`.

```js
import { AuthModule } from 'angular-auth-oidc-client';

import { AuthRoutingModule } from '@tamu-gisc/oidc/ngx';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule.forRoot({
      config: {
        redirectUrl: window.location.origin + '/auth/callback',
        ...
      }
    }),
    RouterModule.forRoot([...]),
    AuthRoutingModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})

```

The `AuthRoutingModule` will add the following routes to the application and should therefore be reserved and not overwritten by other feature modules:

- auth/
  - callback
