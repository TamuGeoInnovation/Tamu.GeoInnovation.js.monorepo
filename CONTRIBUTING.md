# Contributing to Aggiemap and Friends

We're pumped that you're considering contributing, thank you! As a member of the Aggie community, contributing to Aggiemap is a great way to leave your mark and improve a tool that so many rely on every day.

#### Table of Contents
---

How can I contribute?
- [Reporting issues/bugs](#reporting-issuesbugs)
- [Suggesting enhancements](#suggesting-enhancements)
- [Pull requests](#pull-requests)
- [General feedback](#general-feedback-or-inquiries)


### Reporting issues/bugs
---

Despite our best efforts, bugs will occasionally slip through the cracks. If you find one, from text issues to functionality issues please [submit an issue](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues). Issues allow us to keep track of and prioritize fixes. Before submitting an issue, please take a quick stroll through the posted issues and check if it has been submitted already.

When submitting an issue, please try to be as descriptive as possible and include details such as:

- Description of current behavior
- Description of what the behavior should be 
- Steps to reproduce
- Screenshots
- Your device information
  - Device type (e.g. laptop, desktop, phone, etc)
  - Model (e.g. iPhone 11, Samsung Galaxy S11, Dell XPS 15, etc)
  - OS and version (e.g. Windows 10, MacOS 12.5, Ubuntu 16.04)
  - Browser name and version (e.g. Chrome 103, Firefox 103, Safari, etc)

As the issue gets picked up, we might reach out for more information and you might receive emails from us.

### Suggesting enhancements
---

Aggiemap is far from perfect; if you have any ideas for features or changes that would improve the usability and experience we would love to hear from you. Like bugs, enhancements are tracked as [issues with the "enhancement" label](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement).

Before submitting a feature or enhancement, please glance over the outstanding list and make sure it hasn't already been suggested.

The format for a suggestion/enhancement is as follows:

- Description of the current behavior (if any)
- Explanation on the utility and usefulness of the suggested change
- Step-by-step description of what the proposed behavior would look like and how a user would interact with it
- If you have the technical background, a list of resources such as required data, libraries, packages, etc. Pseudo-code is also acceptable

Additionally, the following would be particularly useful for UI, design, and complex user flows:
- Sketches or diagrams
- Animations


### Pull requests
---

In order to make everyone's life easier, there are some guidelines that must be followed to ensure that contributions improve not only the functionality but also the quality of the code base to maintain some resemblance of maintainability and extensibility.

Pull requests should be born out of bug reports or feature suggestions or enhancements. Before spending your valuable development time, please make an issue or select an existing one to make sure that your changes are something that:

- Users will benefit from
- Benefits the quality of the codebase

#### Format

In your PR, please be as descriptive as possible, providing screenshots as necessary to illustrate your changes.

Your PR must follow the following naming pattern:

`scope(project-name): Short description`

The above format serves to keep a consistent history format, glance-able understanding in a `log` format, and allows for filtering by project and scope. Please use any of the [closed PR's as examples for titles](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pulls?q=is%3Apr+is%3Aclosed)

*Scope* can be broken down into a few common categories:

- fix
  - General bug fixes
- feat
  - Refactor
  - New feature
  - Enhancements
- chore:
  - Updates to documentation
  - Updates to workspace dependencies
- ci
  - Updates related to ci/cd pipelines

*Project name* is typically the workspace project name (whether an app or lib). Most aggiemap-related PR's will use `aggiemap-angular` as the project name. A full list of project names can be found by opening the `workspace.json` file at the root of the repository. Each key represents a project name.

Given that in a monorepo it's not uncommon to cross app/lib boundaries in a PR, the name of the app/lib that was the reason for the PR will be used. 

In cases where a PR affects various projects, and quite likely, the entire workspace, the project name can be omitted.

#### PR atomicity

It can be a difficult habit to break but it is imperative to maintaining a clean and meaningful merge history that is traceable, easily `bisect`able. Limit the scope of a pull request to only one feature/change.

#### Commit messages and history

We are all about keeping clean and meaningful commit history. Please make sure all of your commit messages are descriptive and relevant to the changes made. Avoid overly concise and vague first-line messages like "fixes" or "fixed bug". Try and keep your first-line character count under 72 and use separate lines to include additional details as needed.

Your resulting commit history should describe a journey from beginning to end.

#### Style guide

Please review and follow the [code style guide](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/wiki/Style-Guide). The overall goal for following a style guide is to ensure consistency and improve readability.

#### Repository Structure

This repository is powered by [Nx](https://nx.dev/). It provides the development tooling that enables many applications and libraries to co-exist in the same repository.

Of interest are two root-level directories `apps` and `libs`. `apps` contains application entry points but contain very little actual logic. This is by design. 

`libs` on the other hand contain all the business logic for any given application. Libraries can be used in one or many different applications and it's this flexibility that allows to create re-usable units across the entire repository.

Nx supports multiple frameworks but we primarily use Angular for front-end and NestJS for back-end API's due to their opinionated nature and shared style and architectural patterns.

While there is a long list of applications in the `apps` directory, some of them require secret configuration files not included in version control, for security purposes, that effectively "break" them. The main Aggiemap application does not require any special configuration or setup apart from the basic installation steps listed below.

#### Regressions and status checks

All changes cannot break Aggiemap or other applications. Continuous integration pipelines will catch most show-stopping problems but keep in mind the potential for downstream breaking changes. 

Nx provides a nifty interactive dependency graph tool that allows you to select applications/libraries and displays a full diagram of apps/libs that depend on it and that it depends on. You can use this tool to get insight on the impact of your changes.

`nx dep-graph`



#### Unit tests

This is an area where we could see a lot of improvement. Unit tests are NOT required at the moment, but are highly appreciated. Unit tests are written with Jest and e2e tests with Cypress.

### General feedback or inquiries
---

For general questions, feedback, or inquiries that require private communication, please email gis@tamu.edu.
