# Application Stacks

This directory contains the applications compose with compose and serve as templates or complete examples for deploying applications with containers. For example, a web application typically consists of a web server, an api server, and a database. Each of these components can be deployed as a container and orchestrated with docker-compose in a declarative manner instead of using flaky shell scripts, manual commands, or inconsistent VM images.

## Usage

To deploy an application stack, simply run `docker-compose up` in the directory of the application stack. For example, to deploy the `gisday` application stack, follow these steps:

```bash
cd stacks/gisday
docker-compose up -d
```

Note, that the compose files expect variables from the `.env` file in the working directory or provided using `--env-file`.

## Dismantling

To dismantle an application stack, simply run `docker-compose down` in the directory of the application stack. For example, to dismantle the `gisday` application stack, follow these steps:

```bash
cd stacks/gisday
docker-compose down
```

This will stop and remove all containers and networks created by the application stack. Note, that this will not remove any images that were built by the application stack. To remove these images, run `docker image rm <image>` for each image created by the application stack. Volumes created by the application stack will also not be removed. To remove these volumes, run `docker volume rm <volume>` for each volume created by the application stack.
