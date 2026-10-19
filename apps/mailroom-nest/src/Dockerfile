FROM node:24.22.0 as builder
ENV NODE_ENV=production
WORKDIR /app
COPY ../../../package-lock.json ../../../package.json ./
# Disable npm postinstall script
RUN npm pkg set scripts.postinstall="echo no-postinstall"
RUN npm ci --omit-dev
COPY . ./

FROM node:24.22.0-alpine
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "main.js"] 