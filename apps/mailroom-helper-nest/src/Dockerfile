FROM node:24.22.1 as builder
ENV NODE_ENV=production
WORKDIR /app
# The build writes this app's own package.json (generatePackageJson), and the publish step puts the repository's
# root package.json and package-lock.json beside it as root-package.json and root-package-lock.json (#2117).
# Install from the root pair, so every version is the root lock's, then prune to what this app's package.json needs.
# The lock Nx generates is not used: it gets nested copies wrong. The root's overrides are put back into the app's
# package.json, because Nx drops "form-data": "$form-data", and without it prune fetches old form-data copies the root
# lock does not have. Everything else in the build output is copied as before.
COPY . /tmp/build/
RUN cp /tmp/build/root-package.json package.json \
  && cp /tmp/build/root-package-lock.json package-lock.json \
  && npm pkg set scripts.postinstall="echo no-postinstall" \
  && npm ci --omit=dev \
  && cp /tmp/build/package.json package.json \
  && node -e "const fs = require('fs'), app = JSON.parse(fs.readFileSync('package.json')); app.overrides = JSON.parse(fs.readFileSync('/tmp/build/root-package.json')).overrides; fs.writeFileSync('package.json', JSON.stringify(app, null, 2))" \
  && npm prune --omit=dev \
  && rm /tmp/build/package.json /tmp/build/package-lock.json /tmp/build/root-package.json /tmp/build/root-package-lock.json \
  && cp -r /tmp/build/. . \
  && rm -rf /tmp/build

FROM node:24.22.1-alpine
WORKDIR /app
# The APIs run node only; npm in the base image carried every remaining finding in these images (#2117).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app .
CMD ["node", "main.js"]
