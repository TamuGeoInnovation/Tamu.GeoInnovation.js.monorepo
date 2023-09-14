# Mailroom Helper

## Purpose

This application implements the mailroom helper module which is a NestJS module that includes a set of REST endpoints that forwards emails to the Mailroom API, effectively a proxy.

This application is intended to be used by other applications that need to send emails but do not have an established backend to do so. See the mailroom helper module for information on the endpoints.

For applications with an established backend, it is recommended to import the mailroom helper module to mount the endpoints in the existing application and avoid the overhead of running a separate application.

## Configuration

The following environment variables are required:

- `MAILROOM_API_URL`: The URL of the Mailroom API
- `MAILROOM_API_KEY`: The API key to use when sending emails to the Mailroom API
- `MAILROOM_API_SECRET`: The API secret to use when sending emails to the Mailroom API
