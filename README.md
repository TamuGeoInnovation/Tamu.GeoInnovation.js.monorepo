# AggieMap & Friends Monorepo

![AggieMap Logo](/libs/assets/images/logo/TAM-PrimaryMarkBB.svg) [![Build Status](https://dev.azure.com/tamugeoinnovation/tamu.geoinnovation.js.monorepo/_apis/build/status/Monorepo?branchName=development)](https://dev.azure.com/tamugeoinnovation/tamu.geoinnovation.js.monorepo/_apis/build/status/Monorepo?branchName=development) ![Coveralls github](https://img.shields.io/coveralls/github/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo)

This monorepo is maintained by the Texas A&M GeoInnovation Service Center and contains everything related to the Aggiemap platform. The goal of this platform is to create a reusable set of building blocks that can be used not only for the public-facing website @ aggiemap.tamu.edu but also on various projects ranging from derivatives of Aggiemap for campus operations (utilities and energy services, transportation), multidisciplinary applications, and internal websites and services within our service center. We invite anyone in the Aggie community to contribute and share their feedback.

## Getting Started

Please see the [Getting Started Guide](GETTING_STARTED.md) for detailed instructions on setting up your development environment.

## Release notes

Notes for each release live in [docs/releases](docs/releases). This repository is public, so those links can be shared with anyone without a sign-in.

## Running an application

All applications are "served" locally with a simple command with the pattern:

```bash
npx nx run [project-name]:serve
```

The project name is exactly the name of the directory. For example, the command to run Aggiemap locally is:

`npx nx run aggiemap-angular:serve`

Once the application is running, it will be available locally @ http://localhost:4200.

As you make changes to the project, the local web server will automatically rebuild affected chunks and refresh the page.

No Node.js on your machine? See [Path 5: Windows with Docker Only](GETTING_STARTED.md#path-5-windows-with-docker-only-no-local-nodejs) to install dependencies and run AggieMap entirely in Docker.

Using Claude Code? [CLAUDE_SETUP.md](CLAUDE_SETUP.md) is the same setup as a runbook it can execute and verify step by step.

## Contributing

If you would like to contribute, please read the[ contribution guidelines](CONTRIBUTING.md).

For general questions, feedback, or inquiries that require private communication, please email gis@tamu.edu.
