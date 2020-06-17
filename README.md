# AggieMap & Friends Monorepo

![CircleCI](https://img.shields.io/circleci/build/github/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/master)
![Coveralls github](https://img.shields.io/coveralls/github/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo)
![https://aggiemap.tamu.edu](https://img.shields.io/website?url=https%3A%2F%2Faggiemap.tamu.edu)


![AggieMap Logo](/libs/assets/images/logo/TAM-PrimaryMarkBB.svg)

# Installation

1. Clone this repo
2. `npm install` from the root of the directory

# Creating a new app

1. Use `ng g app myapp --style=scss` to scaffold the app

# Create NestJS app

1. `nx list @nrwl/nest`
2. `ng g @nrwl/nest:application`

# Create NestJS modules / controllers / services / etc

1. `nx list @nestjs/schematics`
2. `ng g @nestjs/schematics:service`
3. `ng g @nestjs/schematics:module test --source-root=libs/two/data-api/src/lib/modules --dry-run`

# Creating libraries

1. `ng g @nrwl/web:library`

# Viewing on mobile device

1. Use `ng serve --aot --project=myapp --host 0.0.0.0`

# Running AggieMap

Run `ng serve --project=aggiemap-angular --aot` to start a local webserver at https://localhost:4200.

As you make changes to the project, the local webserver will automatically rebuild and, if AggieMap is open in a webbrowser, the page will reload automatically

# Submitting Pull Requests

When submitting PRs be sure that your changes pass Continuous Integration.

# Starting inspector on localhost:7777 failed: address already in use
1. https://github.com/nrwl/nx/issues/1248
2. Use `ng serve {projectname} --configuration=development` to launch