
CREATE MATERIALIZED VIEW daily AS
       SELECT day, package, COUNT(*) AS count
       FROM downloads
       WHERE package IS NOT NULL
       GROUP BY day, package;

CREATE INDEX idx_daily ON daily(package, day);

CREATE MATERIALIZED VIEW monthly AS
       SELECT date_trunc('month', day) AS month, package, count(*) AS count
       FROM downloads
       WHERE package IS NOT NULL
       GROUP BY month, package;

CREATE INDEX idx_monthly ON monthly(package, month);
