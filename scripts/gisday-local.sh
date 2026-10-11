#!/usr/bin/env bash
# Runs the GIS Day stack (database, Redis, gisday-nest, gisday-angular) in Docker on this machine.
# docs/gisday-local.md explains each step and what works locally.
#
#   scripts/gisday-local.sh <step> [...]
#
#   db                  start SQL Server (gisday-db, port 14330, volume gisday-db-data)
#   restore <file.bak>  restore a backup from GISDAY_LOCAL_DIR into gisday-db, and map the app login
#   install             npm ci into the shared node_modules volume (tamu-js-dev-nm)
#   api                 build gisday-nest and start it (gisday-api, port 3333), with Redis
#   web                 start the gisday-angular dev server (gisday-dev, port 4201)
#   status              list the containers
#   stop                stop and remove the containers; the database volume is kept
#
# Settings never live in the repository. GISDAY_LOCAL_DIR (default C:/TAMU/gisday-local) holds:
#   local-db.env            SA_PASSWORD and GISDAY_APP_PASSWORD
#   gisday-api.local.env    gisday-nest's settings, started from apps/gisday-nest/local.env.sample
#   *.bak                   the backup to restore
# Run from Git Bash at the root of a checkout.
set -euo pipefail

export MSYS_NO_PATHCONV=1
LOCAL_DIR="${GISDAY_LOCAL_DIR:-C:/TAMU/gisday-local}"
REPO="$(pwd -W 2>/dev/null || pwd)"
NODE_IMAGE=node:22.23.3
SQL_IMAGE=mcr.microsoft.com/mssql/server:2022-latest
NET=gisday-local
DB_NAME=gisday-nest-eh

need() {
  [ -f "$1" ] || { echo "Missing $1. See docs/gisday-local.md." >&2; exit 2; }
}

network() {
  docker network inspect "$NET" >/dev/null 2>&1 || docker network create "$NET" >/dev/null
}

sql() {
  # Runs a query as sa inside the container; the password never leaves the container's environment.
  docker exec gisday-db sh -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -b "$@"' sqlcmd "$@"
}

case "${1:-}" in
  db)
    need "$LOCAL_DIR/local-db.env"
    network
    docker run -d --name gisday-db -m 4g --network "$NET" -p 14330:1433 \
      -e ACCEPT_EULA=Y -e MSSQL_PID=Developer --env-file "$LOCAL_DIR/local-db.env" \
      -v gisday-db-data:/var/opt/mssql -v "$LOCAL_DIR:/backups" \
      "$SQL_IMAGE"
    echo "Waiting for SQL Server..."
    for _ in $(seq 1 60); do
      sql -Q 'SELECT 1' >/dev/null 2>&1 && { echo "gisday-db is ready."; exit 0; }
      sleep 2
    done
    echo "gisday-db did not answer in 2 minutes: docker logs gisday-db" >&2
    exit 1
    ;;

  restore)
    bak="${2:?usage: restore <file.bak in $LOCAL_DIR>}"
    need "$LOCAL_DIR/$bak"
    sql -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = N'/backups/$bak' WITH REPLACE, STATS = 10,
      MOVE N'$DB_NAME' TO N'/var/opt/mssql/data/$DB_NAME.mdf',
      MOVE N'${DB_NAME}_log' TO N'/var/opt/mssql/data/${DB_NAME}_log.ldf'"
    # A backup carries the database user but not the server login, so create the login and map it.
    docker exec -i --env-file "$LOCAL_DIR/local-db.env" gisday-db sh -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -b -v APP_PASSWORD="$GISDAY_APP_PASSWORD" -i /dev/stdin' <<SQL
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'gisday_app')
  CREATE LOGIN gisday_app WITH PASSWORD = '\$(APP_PASSWORD)', CHECK_POLICY = OFF;
GO
USE [$DB_NAME];
ALTER USER gisday_app WITH LOGIN = gisday_app;
GRANT VIEW DEFINITION TO gisday_app;
GO
SQL
    echo "Restored $bak into $DB_NAME and mapped gisday_app."
    ;;

  install)
    docker run --rm -m 16g -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w \
      -e CYPRESS_INSTALL_BINARY=0 "$NODE_IMAGE" npm ci --no-audit --no-fund
    ;;

  api)
    need "$LOCAL_DIR/gisday-api.local.env"
    network
    docker inspect gisday-redis >/dev/null 2>&1 || docker run -d --name gisday-redis --network "$NET" redis:7-alpine
    docker run --rm -m 8g -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w -e NX_DAEMON=false \
      "$NODE_IMAGE" node node_modules/nx/dist/bin/nx.js build gisday-nest
    docker run -d --name gisday-api -m 2g --network "$NET" -p 3333:3333 \
      --env-file "$LOCAL_DIR/gisday-api.local.env" \
      -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w \
      "$NODE_IMAGE" node dist/apps/gisday-nest/main.js
    echo "gisday-api started: docker logs -f gisday-api"
    ;;

  web)
    network
    docker run -d --name gisday-dev -m 8g --network "$NET" -p 4201:4201 -e NX_DAEMON=false \
      -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w \
      "$NODE_IMAGE" sh -c "node node_modules/nx/dist/bin/nx.js serve gisday-angular --configuration=local --host 0.0.0.0 --port 4201 --poll=2000"
    echo "gisday-dev started; the first compile takes several minutes: docker logs -f gisday-dev"
    echo "Then open http://localhost:4201"
    ;;

  status)
    docker ps -a --filter "network=$NET" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    ;;

  stop)
    docker rm -f gisday-dev gisday-api gisday-redis gisday-db 2>/dev/null || true
    echo "Stopped. The database is kept in volume gisday-db-data."
    ;;

  *)
    sed -n '2,20p' "$0"
    exit 2
    ;;
esac
