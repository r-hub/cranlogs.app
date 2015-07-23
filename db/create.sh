
read -r -d '' CREATE_DB <<'EOF'
CREATE TABLE daily (
  day DATE,
  package VARCHAR(50),
  count BIGINT
);
CREATE INDEX idx_daily ON daily(package, day);
CREATE INDEX idx_daily_day ON daily(day);
CREATE INDEX idx_daily_package ON daily(package);
EOF

echo "$CREATE_DB" | dokku psql:restore_sql cranlogs

read -r -d '' ADD_VIEWS <<'EOF'
CREATE MATERIALIZED VIEW top_day AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-day'))[1])
    AND day <  (SELECT (cl_get_period('last-day'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW top_week AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-week'))[1])
    AND day <  (SELECT (cl_get_period('last-week'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW top_month AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-month'))[1])
    AND day <  (SELECT (cl_get_period('last-month'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW trending AS
SELECT t1.package, 24 * t1.cnt / t2.cnt * 100 AS increase FROM
  (SELECT package, SUM(count) AS cnt
    FROM daily
    WHERE day >= (NOW() - INTERVAL '8 DAYS')
      AND day <  NOW()
    GROUP BY package
    HAVING SUM(count) >= 1000) AS t1,
  (SELECT package, SUM(count) AS cnt
    FROM daily
    WHERE day >= (NOW() - INTERVAL '176 DAYS')
      AND day <  (NOW() - INTERVAL '8 DAYS')
    GROUP BY package) AS t2
  WHERE t1.package = t2.package
  ORDER BY increase DESC
  LIMIT 100;

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

CREATE TRIGGER trig_refresh_views AFTER TRUNCATE OR INSERT OR UPDATE OR DELETE
   ON daily FOR EACH STATEMENT
   EXECUTE PROCEDURE refresh_views();

EOF

echo "$ADD_VIEWS" | dokku psql:restore_sql cranlogs

read -r -d '' CREATE_DB_R <<'EOF'
CREATE TABLE dailyr (
  day DATE,
  version VARCHAR(50),
  os VARCHAR(5),
  count BIGINT
);
CREATE INDEX idx_dailyr_day ON dailyr(day);
CREATE INDEX idx_dailyr_day_version ON dailyr(day, version);
CREATE INDEX idx_dailyr_day_os ON dailyr(day, os);
ALTER TABLE dailyr OWNER TO cranlogs;
EOF

echo "$CREATE_DB_R" | dokku psql:restore_sql cranlogs
