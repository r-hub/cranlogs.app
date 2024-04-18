# 2024-04

## Move to api.r-pkg.org

Has a postgres DB, so we need to export that, and import it
into a newer version of Postgres. First stop the updates by
editing the crontab. Then export:

```
dokku postgres:export cranlogs > cranlogs.db
```

On the new machine create app and DB:

```
dokku plugin:install https://github.com/dokku/dokku-postgres.git postgres
dokku apps:create cranlogs
dokku postgres:create cranlogs
dokku postgres:link cranlogs cranlogs
```

Then import:

```
dokku postgres:import cranlogs < cranlogs.db
```

I got
```
pg_restore: error: could not execute query: ERROR:  type "_top_day" does not exist
HINT:  Create the type as a shell type, then create its I/O functions, then do a full CREATE TYPE.
Command was: CREATE TYPE _top_day (
    INTERNALLENGTH = variable,
    INPUT = array_in,
    OUTPUT = array_out,
    RECEIVE = array_recv,
    SEND = array_send,
    ANALYZE = array_typanalyze,
    ELEMENT = ???,
    CATEGORY = 'A',
    ALIGNMENT = double,
    STORAGE = extended
);
```

It is seemingly harmless?

But we need to do some fixup for a hot fix I did once:
```
dokku postgres:connect cranlogs
DROP MATERIALIZED VIEW top_day2;
DROP MATERIALIZED VIEW top_week2;
DROP MATERIALIZED VIEW top_month2;
DROP MATERIALIZED VIEW trending2;

REFRESH MATERIALIZED VIEW top_day;
REFRESH MATERIALIZED VIEW top_week;
REFRESH MATERIALIZED VIEW top_month;
REFRESH MATERIALIZED VIEW trending;

CREATE OR REPLACE FUNCTION refresh_views() RETURNS trigger AS
$$
BEGIN
    REFRESH MATERIALIZED VIEW top_day;
    REFRESH MATERIALIZED VIEW top_week;
    REFRESH MATERIALIZED VIEW top_month;
    REFRESH MATERIALIZED VIEW trending;
    RETURN NULL;
END;
$$
LANGUAGE plpgsql ;

```

Then test that queries the web app is making work from the postgres
shell.

```
dokku postgres:connect cranlogs

SELECT SUM(count) FROM DAILY WHERE package = 'cli';

SELECT cl_total_json('last-day', 'cli');
SELECT cl_total_json('last-week', 'cli');
SELECT cl_total_json('last-month', 'cli');

SELECT cl_daily_json('last-day', 'cli');
SELECT cl_daily_json('last-week', 'cli');
SELECT cl_daily_json('last-month', 'cli');

SELECT package, SUM(count) AS count FROM daily
  WHERE day > CURRENT_DATE - INTERVAL '30 days'
  GROUP BY package ORDER BY count DESC LIMIT 10;

SELECT *, cl_get_period('last-day') FROM top_day LIMIT 10;
SELECT *, cl_get_period('last-week') FROM top_week LIMIT 10;
SELECT *, cl_get_period('last-month') FROM top_month LIMIT 10;

SELECT * FROM trending LIMIT 10;
```

Get some sample data for local dev:

```
dokku postgres:connect cranlogs
COPY (SELECT * FROM daily WHERE day >= '2024-01-01') TO '/var/lib/postgresql/daily.dump';
COPY (SELECT * FROM dailyr WHERE day >= '2024-01-01') TO '/var/lib/postgresql/dailyr.dump';
```

```
docker cp 3f5b6d40e808://var/lib/postgresql/dailyr.dump .
docker cp 3f5b6d40e808://var/lib/postgresql/daily.dump .
```

```
dokku postgres:enter cranlogs
rm /var/lib/postgresql/daily*.dump
```

Copy this into the cranlogs.app project.

Add Dockerfile to project, update node version, etc. and then deploy:

```
git remote set-url dokku dokku@api.r-pkg.org:cranlogs
git push dokku
```

Do the same dance for copying the certs from the old server.

```
dokku domains:add cranlogs cranlogs.r-pkg.org
tar cf cert.tar server.{key,crt}
cat cert.tar | dokku certs:add cranlogs
```

Edit `/etc/hosts` locally to test.

Set up updates. Check up the repo into /root, edit
crontab to run it scripts. Run it now to update.

Update DNS. www is proxied by Cloudflare, so turn off the
proxy temporarily, to make sure everything works correctly.
Turn the proxy back on at the end.

```
dokku letsencrypt:set cranlogs email csardi.gabor@gmail.com
dokku letsencrypt:enable cranlogs
```

Enable proxy again.

Stop old app a couple of hours later.
