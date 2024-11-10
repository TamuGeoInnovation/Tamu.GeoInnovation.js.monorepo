FROM nginx-base:latest

ARG GIT_TAG
ARG GIT_COMMIT
ARG BUILD_DATE

ENV GIT_TAG=${GIT_TAG}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BUILD_DATE=${BUILD_DATE}
ENV FILES_DIR=/usr/share/nginx/html

COPY . /usr/share/nginx/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Only run token substitution during build without starting nginx
RUN /usr/local/bin/tokenSubstitute.sh

