# AggieMap & Friends Monorepo

![AggieMap Logo](/libs/assets/images/logo/TAM-PrimaryMarkBB.svg) [![Build Status](https://dev.azure.com/tamugeoinnovation/tamu.geoinnovation.js.monorepo/_apis/build/status/Monorepo?branchName=development)](https://dev.azure.com/tamugeoinnovation/tamu.geoinnovation.js.monorepo/_apis/build/status/Monorepo?branchName=development) ![Coveralls github](https://img.shields.io/coveralls/github/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo)

This monorepo is maintained by the Texas A&M GeoInnovation Service Center and contains everything related to the Aggiemap platform. The goal of this platform is to create a re-usable set of building blocks that can be used not only for the purposes of the public-facing website @ aggiemap.tamu.edu but also on various projects ranging from derivatives of Aggiemap for campus operations (utilities and energy services, transportation), multidisciplinary applications, and internal websites and services for use within our service center. We invite anyone in the Aggie community to contribute and share their feedback.

## Repository Structure

This repository is powered by [Nx](https://nx.dev/). It provides the development tooling that enables many applications and libraries to co-exist in the same repository.

Of interest are two root-level directories `apps` and `libs`. `apps` contains application entry points but contain very little actual logic. This is by design. 

`libs` on the other hand contain all the business logic for any given application. Libraries can be used in one or many different applications and it's this flexibility that allows to create re-usable units across the entire repository.

Nx supports multiple frameworks but we primarily use Angular for front-end and NestJS for back-end API's due to their opinionated nature and shared style and architectural patterns.

While there is a long list of applications in the `apps` directory, some of them require secret configuration files not included in version control, for security purposes, that effectively "break" them. The main Aggiemap application does not require any special configuration or setup apart from the basic installation steps listed below.

## Installation

1. Clone this repo
2. Install [Node and NPM](https://nodejs.org/en/)
3. On the repo root, install dependencies with `npm ci`
4. Run an application

## Running an application

All applications are "served" locally with a simple command with the pattern:

`nx run [project-name]:serve`

The project name is exactly the name of the directory. For example, the command to run Aggiemap locally is:

`nx run aggiemap-angular:serve`

*Note: On MacOS systems it might be required to prepend the command with `npx`*

Once the application is running, it will be available locally @ http://localhost:4200.

As you make changes to the project, the local web server will automatically rebuild affected chunks and refresh the page.

## Contributing

If you would like to contribute, please be sure to read the[ contribution guidelines](CONTRIBUTING.md). 


## I can't contribute but have feedback about Aggiemap

That's OK! We value any and all feedback. If your feedback relates to a bug in Aggiemap, please [submit an issue](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues). Issues are a place for feature or bug discourse and anything you post in there is PUBLIC for everyone to see!

For general questions or feedback that requires private communication, please email gis@tamu.edu.