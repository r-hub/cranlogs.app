
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION cl_get_period(
  _period VARCHAR DEFAULT NULL)
RETURNS DATE[] AS $$
DECLARE
  _period2 VARCHAR[];
  _start DATE;
  _end DATE;
  _end1 DATE;
  _max_day DATE;
  _result DATE[];
BEGIN

  -- -------------------------------------------
  -- Latest day
  SELECT MAX(day) INTO _max_day FROM daily;

  IF _period = 'last-day' THEN
    _start := _max_day;
    _end := _max_day;
    _end1 := _max_day + INTERVAL '1 day';

  ELSIF _period = 'last-week' THEN
    _start := _max_day - INTERVAL '6 days';
    _end := _max_day;
    _end1 := _max_day + INTERVAL '1 day';

  ELSIF _period = 'last-month' THEN
    _start := _max_day - INTERVAL '29 days';
    _end := _max_day;
    _end1 := _max_day + INTERVAL '1 day';

  ELSE

    _period2 := string_to_array(_period, ':');

    IF array_length(_period2, 1) = 1 THEN
      _start := DATE (_period2[1]);
      _end := _start;
      _end1 := _start + INTERVAL '1 day';
    ELSE
      _start := DATE (_period2[1]);
      _end := DATE (_period2[2]);
      _end1 := DATE (_period2[2]) + INTERVAL '1 day';
    END IF;

  END IF;

  _result[1] := _start;
  _result[2] := _end;
  _result[3] := _end1;
  RETURN _result;

END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------


CREATE OR REPLACE FUNCTION cl_total(
  _period VARCHAR DEFAULT NULL,
  _package VARCHAR DEFAULT NULL)
RETURNS RECORD AS $$
DECLARE
  _start DATE;
  _end DATE;
  _end1 DATE;
  _result RECORD;
  _start_end DATE[];
BEGIN

  _start_end := cl_get_period(_period);
  _start := _start_end[1];
  _end := _start_end[2];
  _end1 := _start_end[3];

  -- -------------------------------------------
  -- Do the actual query

  IF _package IS NULL THEN
    SELECT _start AS start, _end AS end, SUM(count) AS downloads
    INTO _result
    FROM daily WHERE day >= _start AND day < _end1;

  ELSIF _package = 'R' THEN
    SELECT _start AS start, _end AS end, SUM(count) AS downloads
    INTO _result
    FROM dailyr WHERE day >= _start AND day < _end1;

  ELSE
    SELECT _start AS start, _end AS end, SUM(count) AS downloads, _package AS package
    INTO _result
    FROM daily WHERE day >= _start AND day < _end1 AND package = _package;

  END IF;

  -- -------------------------------------------
  -- If no results, then return zero

  IF _result.downloads IS NULL THEN
    _result.downloads := 0;
  END IF;

  RETURN _result;

END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------


CREATE OR REPLACE FUNCTION cl_total_json(
  _period VARCHAR DEFAULT NULL,
  _package VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  _rec RECORD;
BEGIN

  _rec := cl_total(_period, _package);
  RETURN row_to_json(_rec);

END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------


CREATE OR REPLACE FUNCTION cl_daily_json(
  _period VARCHAR DEFAULT NULL,
  _package VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  _start DATE;
  _end DATE;
  _end1 DATE;
  _start_end DATE[];
  _result RECORD;
BEGIN

  _start_end := cl_get_period(_period);
  _start := _start_end[1];
  _end := _start_end[2];
  _end1 := _start_end[3];

  -- -------------------------------------------
  -- Do the actual query

  IF _package IS NULL THEN
    SELECT json_agg(row) AS downloads, _start AS start, _end AS end
      INTO _result FROM (
      SELECT daily.day AS day, sum(daily.count) AS downloads
      FROM daily WHERE daily.day >= _start AND daily.day < _end1
      GROUP BY daily.day
      ORDER BY daily.day
    ) row;

  ELSIF _package = 'R' THEN
    SELECT json_agg(row) AS downloads, _start AS start, _end AS end
      INTO _result FROM (
      SELECT dailyr.day AS day, dailyr.os AS os, dailyr.version AS version,
             sum(dailyr.count) AS downloads
      FROM dailyr WHERE dailyr.day >= _start AND dailyr.day < _end1
      GROUP BY dailyr.day, dailyr.os, dailyr.version
      ORDER BY dailyr.day
    ) row;

  ELSE
    SELECT json_agg(row) AS downloads, _start AS start, _end AS end,
           _package AS package
      INTO _result FROM (
      SELECT daily.day AS day, sum(daily.count) AS downloads
      FROM daily where daily.day >= _start AND daily.day < _end1 AND
           daily.package = _package
      GROUP BY daily.day
      ORDER BY daily.day
    ) row;

  END IF;

  RETURN row_to_json(_result);

END;
$$ LANGUAGE plpgsql;
