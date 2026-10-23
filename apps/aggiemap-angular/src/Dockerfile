FROM ghcr.io/tamugeoinnovation/nginx-base:sha-09b7e41

COPY . /usr/share/nginx/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Only run token substitution during build without starting nginx
RUN /usr/local/bin/tokenSubstitute.sh
