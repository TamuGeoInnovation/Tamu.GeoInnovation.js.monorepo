FROM node:24.22.1 as builder
ENV NODE_ENV=production
WORKDIR /app
COPY ../../../package-lock.json ../../../package.json ./
# Disable npm postinstall script
RUN npm pkg set scripts.postinstall="echo no-postinstall"
RUN npm ci --omit-dev
COPY . ./

FROM node:24.22.1-alpine
WORKDIR /app
# The APIs run node only; npm in the base image carried every remaining finding in these images (#2117).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app .
CMD ["node", "main.js"] 
