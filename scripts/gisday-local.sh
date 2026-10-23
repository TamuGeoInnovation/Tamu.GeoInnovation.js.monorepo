#!/usr/bin/env bash
# Runs the GIS Day stack (database, Redis, gisday-nest, gisday-angular) in Docker on this machine.
# docs/gisday-local.md explains each step and what works locally.
#
#   scripts/gisday-local.sh <step> [...]
#
#   db                  start SQL Server (gisday-db, port 14330, volume gisday-db-data)
#   restore [file.bak]  restore the repository's scrubbed copy into gisday-db, or a backup named here
#                       from GISDAY_LOCAL_DIR, and map the app login
#   install             npm ci into the shared node_modules volume (tamu-js-dev-nm)
#   api                 build gisday-nest and start it (gisday-api, port 3333), with Redis
#   web [--site <key>]  start the gisday-angular dev server (gisday-dev, port 4201); with --site, serve it
#                       as that site on 4201 (gisday-site) and as txgisday.org on 4202
#   migrate <step>      show, run or revert migrations, or generate <Name>, on gisday-db (docs/gisday-migrations.md)
#   scrub               rewrite the repository's scrubbed copy from the database now restored
#   status              list the containers
#   stop                stop and remove the containers; the database volume is kept
#
# Settings never live in the repository. GISDAY_LOCAL_DIR (default C:/TAMU/gisday-local) holds:
#   local-db.env            SA_PASSWORD and GISDAY_APP_PASSWORD; `db` writes it on first use
#   gisday-api.local.env    gisday-nest's settings, started from apps/gisday-nest/local.env.sample
#   auth0-dev.local.env     optional: the development Auth0 tenant's credentials and test admin, written
#                           by scripts/gisday-auth0-dev.ps1 (#1623); passed after the file above
#   *.bak                   only for someone restoring a backup of production
# Run from Git Bash at the root of a checkout.
set -euo pipefail

export MSYS_NO_PATHCONV=1
LOCAL_DIR="${GISDAY_LOCAL_DIR:-C:/TAMU/gisday-local}"
REPO="$(pwd -W 2>/dev/null || pwd)"
NODE_IMAGE=node:24.22.1
SQL_IMAGE=mcr.microsoft.com/mssql/server:2022-latest
NET=gisday-local
DB_NAME=gisday-nest-eh
SCRUB_DB=gisday-scrubbed
# The starting database for local development: a copy with nobody's real data in it (docs/gisday-local.md).
SEED=apps/gisday-nest/src/database/gisday-local.bak

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

migration() {
  # Runs a gisday-nest:migration-* target on database $1. As sa: gisday_app can read and write data
  # but cannot change tables. The password stays in the container.
  local db="$1" step="$2"
  shift 2
  docker run --rm -m 4g --network "$NET" --env-file "$LOCAL_DIR/local-db.env" \
    -e TYPEORM_HOST=gisday-db -e TYPEORM_DATABASE="$db" -e TYPEORM_USERNAME=sa -e NX_DAEMON=false \
    -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w "$NODE_IMAGE" \
    sh -c 'TYPEORM_PASSWORD="$SA_PASSWORD" node node_modules/nx/dist/bin/nx.js run "$@"' nx "gisday-nest:migration-$step" "$@"
}

case "${1:-}" in
  db)
    if [ ! -f "$LOCAL_DIR/local-db.env" ]; then
      # Passwords for this container only. SQL Server wants upper case, lower case, a digit and a symbol.
      mkdir -p "$LOCAL_DIR"
      printf 'SA_PASSWORD=Sa1!%s\nGISDAY_APP_PASSWORD=App1!%s\n' "$(openssl rand -hex 12)" "$(openssl rand -hex 12)" \
        > "$LOCAL_DIR/local-db.env"
      echo "Wrote new local passwords to $LOCAL_DIR/local-db.env"
    fi
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
    need "$LOCAL_DIR/local-db.env"
    if [ -n "${2:-}" ]; then
      need "$LOCAL_DIR/$2"
      bak="$2" from="/backups/$2"
    else
      need "$SEED"
      docker cp "$SEED" gisday-db:/tmp/restore.bak
      bak="$SEED" from=/tmp/restore.bak
    fi
    # A running API holds connections open, and a restore needs the database to itself.
    sql -Q "IF DB_ID(N'$DB_NAME') IS NOT NULL ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE"
    sql -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = N'$from' WITH REPLACE, STATS = 10,
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
    need "$LOCAL_DIR/local-db.env"
    network
    docker inspect gisday-redis >/dev/null 2>&1 || docker run -d --name gisday-redis --network "$NET" redis:7-alpine
    docker run --rm -m 8g -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w -e NX_DAEMON=false \
      "$NODE_IMAGE" node node_modules/nx/dist/bin/nx.js build gisday-nest
    # Later --env-file values win, so the dev tenant's management credentials (#1623) override the
    # sample's blanks when that file exists.
    dev_tenant=()
    [ -f "$LOCAL_DIR/auth0-dev.local.env" ] && dev_tenant=(--env-file "$LOCAL_DIR/auth0-dev.local.env")
    docker run -d --name gisday-api -m 2g --network "$NET" -p 3333:3333 \
      --env-file "$LOCAL_DIR/gisday-api.local.env" "${dev_tenant[@]}" \
      -e TYPEORM_PASSWORD="$(sed -n 's/^GISDAY_APP_PASSWORD=//p' "$LOCAL_DIR/local-db.env")" \
      -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w \
      "$NODE_IMAGE" node dist/apps/gisday-nest/main.js
    echo "gisday-api started: docker logs -f gisday-api"
    ;;

  web)
    # --site serves the app as another site (a key of GISDAY_SITES in libs/gisday/common/src/lib/sites.ts),
    # through a proxy on 4201, the only port the local Auth0 application accepts sign-ins on.
    site="" port=4201
    if [ "${2:-}" = --site ]; then
      site="${3:?usage: web [--site <key>]}" port=4202
      grep -q "^  $site: {" libs/gisday/common/src/lib/sites.ts || { echo "No site '$site' in libs/gisday/common/src/lib/sites.ts." >&2; exit 2; }
    fi
    network
    # Nx records each running task, keyed by process id, in its workspace-data directory. `stop` kills this
    # container, so its record is never cleared, and every container's Nx gets the same process id. Kept in
    # the checkout, the record would make the next start wait for itself forever (#1626); kept in the
    # container, it goes when the container does. The cost is a project graph computed on every start.
    # UV_THREADPOOL_SIZE: --poll=2000 keeps Node's 4 default file-system threads busy checking the
    # checkout over the Windows bind mount, and Vite's dependency optimizer then waits behind them for
    # good, so the first page load never finishes (#1955). 64 threads leave it room.
    docker run -d --name gisday-dev -m 8g --network "$NET" -p "$port:4201" -e NX_DAEMON=false -e UV_THREADPOOL_SIZE=64 \
      -e NX_WORKSPACE_DATA_DIRECTORY=/tmp/nx-workspace-data \
      -v "$REPO:/w" -v tamu-js-dev-nm:/w/node_modules -w /w \
      "$NODE_IMAGE" sh -c "node node_modules/nx/dist/bin/nx.js serve gisday-angular --configuration=local --host 0.0.0.0 --port 4201 --poll=2000"
    echo "gisday-dev started; the first compile takes several minutes: docker logs -f gisday-dev"
    if [ -n "$site" ]; then
      docker run -d --name gisday-site --network "$NET" -p 4201:4201 -v "$REPO/scripts:/s:ro" \
        "$NODE_IMAGE" node /s/gisday-site-proxy.js "$site" gisday-dev 4201 4201 >/dev/null
      echo "Then open http://localhost:4201 for $site, and http://localhost:4202 for txgisday.org (no sign-in there)"
    else
      echo "Then open http://localhost:4201"
    fi
    ;;

  migrate)
    step="${2:?usage: migrate <show|run|revert|generate <Name>>}"
    need "$LOCAL_DIR/local-db.env"
    [ "$step" != generate ] || name="--name=${3:?usage: migrate generate <Name>}"
    migration "$DB_NAME" "$step" ${name:-}
    ;;

  scrub)
    need "$LOCAL_DIR/local-db.env"
    # A new, empty database with the same logical file names, so `restore` takes its backup unchanged.
    sql -Q "DROP DATABASE IF EXISTS [$SCRUB_DB];
      CREATE DATABASE [$SCRUB_DB]
        ON (NAME = N'$DB_NAME', FILENAME = N'/var/opt/mssql/data/$SCRUB_DB.mdf')
        LOG ON (NAME = N'${DB_NAME}_log', FILENAME = N'/var/opt/mssql/data/${SCRUB_DB}_log.ldf');
      ALTER DATABASE [$SCRUB_DB] SET RECOVERY SIMPLE"
    migration "$SCRUB_DB" run
    docker exec -i gisday-db sh -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -C -b -I -d "$1" -i /dev/stdin' sqlcmd "$DB_NAME" \
      < apps/gisday-nest/src/database/scrub.sql
    # The user a backup has to carry; `restore` maps it to the login on the machine that restores it.
    sql -d "$SCRUB_DB" -Q "CREATE USER gisday_app FOR LOGIN gisday_app;
      ALTER ROLE db_datareader ADD MEMBER gisday_app; ALTER ROLE db_datawriter ADD MEMBER gisday_app"
    sql -Q "BACKUP DATABASE [$SCRUB_DB] TO DISK = N'/tmp/scrubbed.bak' WITH INIT, COMPRESSION, CHECKSUM;
      DROP DATABASE [$SCRUB_DB]"
    docker cp gisday-db:/tmp/scrubbed.bak "$SEED"
    echo "Wrote $SEED. It is public once pushed: read docs/gisday-local.md before committing it."
    ;;

  status)
    docker ps -a --filter "network=$NET" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    ;;

  stop)
    docker rm -f gisday-site gisday-dev gisday-api gisday-redis gisday-db 2>/dev/null || true
    echo "Stopped. The database is kept in volume gisday-db-data."
    ;;

  *)
    sed -n '2,20p' "$0"
    exit 2
    ;;
esac
