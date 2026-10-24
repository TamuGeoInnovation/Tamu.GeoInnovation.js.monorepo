# The build agent's only way out: a Squid proxy that refuses private and local addresses (#2212). See ../README.md.
FROM ubuntu:24.04

RUN apt-get update \
  && apt-get install -y --no-install-recommends squid \
  && rm -rf /var/lib/apt/lists/* \
  && install -d -o proxy -g proxy /var/run/squid

COPY squid.conf /etc/squid/squid.conf

# Squid runs as 'proxy' from the start; it needs no root, as it listens on a high port and keeps no cache.
USER proxy
EXPOSE 3128
ENTRYPOINT ["squid", "-N", "-f", "/etc/squid/squid.conf"]
