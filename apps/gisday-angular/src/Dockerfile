FROM nginx:1.23.2-alpine

RUN apk add --no-cache bash

COPY . /usr/share/nginx/html
COPY .nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --chmod=0755 tokenSubstitute.sh /usr/share/nginx/html/tokenSubstitute.sh

ENTRYPOINT ["/usr/share/nginx/html/tokenSubstitute.sh"]