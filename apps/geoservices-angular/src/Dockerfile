FROM ghcr.io/tamugeoinnovation/nginx-base:latest

ENV FILES_DIR=/usr/share/nginx/html

COPY . /usr/share/nginx/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Only run token substitution during build without starting nginx
RUN /usr/local/bin/tokenSubstitute.sh

