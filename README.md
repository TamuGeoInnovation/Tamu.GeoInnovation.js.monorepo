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

# Viewing on mobile device

1. Use `ng serve --aot --project=myapp --host 0.0.0.0`

# Running AggieMap

Run `ng serve --project=aggiemap-angular --aot` to start a local webserver at https://localhost:4200.

As you make changes to the project, the local webserver will automatically rebuild and, if AggieMap is open in a webbrowser, the page will reload automatically


# Generate a lib
- `ng g @nrwl/web:library projectlib/sublib`

# Anything NestJS
- Bring up a list of NestJS commands: `nx list @nestjs/schematics`
- Using a schematic: `nx g @nestjs/schematics:module MODULENAME`
    - Can specify project with `--source-root=BLAHBLAHBLAHBLAHBLAH`
- How to use a schematic: `nx g @nestjs/schematics:module --help`

# Submitting Pull Requests

When submitting PRs be sure that your changes pass Continuous Integration.
