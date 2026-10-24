FROM ghcr.io/tamugeoinnovation/nginx-base:sha-b5ba4a5

COPY . /usr/share/nginx/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Only run token substitution during build without starting nginx
RUN /usr/local/bin/tokenSubstitute.sh
