# GIS Day Angular

Front-end application for TxGIS Day.

## Dependencies

- `gisday-nest`: Backend API for TxGIS Day.

## Deployment

This application is designed to be deployed as a container using a container runtime.

Container image: `ghcr.io/tamugeoinnovation/gisday-angular`

Registry URL: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pkgs/container/gisday-angular

The following environment variables are required:

- `G_TAG`: Google Tag Manager ID
- `ANGULAR_API_URL`: URL for the backend API
- `ANGULAR_AUTH0_DOMAIN`: Auth0 domain
- `ANGULAR_AUTH0_CLIENT_ID`: Auth0 client ID
- `ANGULAR_AUTH0_AUDIENCE`: Auth0 audience
- `ANGULAR_AUTH0_ROLES_CLAIM`: Auth0 roles claim
- `ANGULAR_AUTH0_URLS`: Auth0 URLs

Additionally, assets uploaded by the API should be inside `/assets/uploads/`. The API returns a relative path, that when combined with the previously mentioned path, will give the full URL to the asset. This was an unintended side effect of poor performance by the API and streaming the file directly to the front-end which caused event-loop blocking. In this way, the file streaming is handled by the backing NGINX server that this application container is served by.
