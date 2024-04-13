
CREATE TABLE IF NOT EXISTS daily (
  day DATE,
  package VARCHAR(50),
  count BIGINT
);
CREATE INDEX IF NOT EXISTS idx_daily ON daily(package, day);
CREATE INDEX IF NOT EXISTS idx_daily_day ON daily(day);
CREATE INDEX IF NOT EXISTS idx_daily_package ON daily(package);

CREATE MATERIALIZED VIEW IF NOT EXISTS top_day AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-day'))[1])
    AND day <  (SELECT (cl_get_period('last-day'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW IF NOT EXISTS top_week AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-week'))[1])
    AND day <  (SELECT (cl_get_period('last-week'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW IF NOT EXISTS top_month AS
SELECT package, SUM(count) AS downloads FROM daily
  WHERE day >= (SELECT (cl_get_period('last-month'))[1])
    AND day <  (SELECT (cl_get_period('last-month'))[3])
  GROUP BY package
  ORDER BY downloads DESC
  LIMIT 100;

CREATE MATERIALIZED VIEW IF NOT EXISTS trending AS
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

CREATE OR REPLACE TRIGGER trig_refresh_views AFTER TRUNCATE OR INSERT OR UPDATE OR DELETE
   ON daily FOR EACH STATEMENT
   EXECUTE PROCEDURE refresh_views();

CREATE TABLE IF NOT EXISTS dailyr (
  day DATE,
  version VARCHAR(50),
  os VARCHAR(5),
  count BIGINT
);
CREATE INDEX IF NOT EXISTS idx_dailyr_day ON dailyr(day);
CREATE INDEX IF NOT EXISTS idx_dailyr_day_version ON dailyr(day, version);
CREATE INDEX IF NOT EXISTS idx_dailyr_day_os ON dailyr(day, os);
