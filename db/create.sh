#! /bin/sh

PSQL="psql -h localhost -p 5432 -U cran -w crandownloads"

# Create the DB
$PSQL -f db.sql 

# Add the data
files=$(find . -regex ".*[0-9][0-9].csv.gz")
for f in $files; do
    echo $f
   
    # Add the child table, if it does not exist
    date=$(gunzip -c $f  | head -2 | tail -1 | cut -f1 -d,)
    month=$(echo $date | sed 's/^.*\([0-9][0-9][0-9][0-9]-[0-9][0-9]\).*$/\1/')
    child=$(echo $month | tr '-' '_')
    start="${month}-01"

    $PSQL -c "CREATE TABLE IF NOT EXISTS downloads_$child (
       CHECK(day >= DATE '$start' AND day < (DATE '$start' + INTERVAL '1 month'))
      ) INHERITS (downloads);" 2>/dev/null || true

    # Add data
    
    gunzip -c $f |
	$PSQL -c "COPY downloads_$child FROM stdin (DELIMITER ',',
           HEADER, FORMAT CSV, NULL 'NA')"

    # Remove NULL packages
    $PSQL -c "DELETE FROM downloads_$child WHERE package IS NULL;"
    $PSQL -c "DELETE FROM downloads_$child WHERE day IS NULL;"

done

# Add indices
for f in $files; do
    echo $f
   
    # Add the child table, if it does not exist
    date=$(gunzip -c $f  | head -2 | tail -1 | cut -f1 -d,)
    month=$(echo $date | sed 's/^.*\([0-9][0-9][0-9][0-9]-[0-9][0-9]\).*$/\1/')
    child=$(echo $month | tr '-' '_')

    $PSQL -c "CREATE INDEX idx_package_day_$child ON downloads_${child}(package,day);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_day_$child ON downloads_${child}(day);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_hour_$child ON downloads_${child}(hour);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_size_$child ON downloads_${child}(size);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_rversion_$child ON downloads_${child}(rversion);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_rarch_$child ON downloads_${child}(rarch);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_ros_$child ON downloads_${child}(ros);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_package_$child ON downloads_${child}(package);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_package_version_$child ON downloads_${child}(package, version);" 2>/dev/null || true
    $PSQL -c "CREATE INDEX idx_country_$child ON downloads_${child}(country);" 2>/dev/null || true

done

# Views, these must be periodially updated
$PSQL -f views.sql 
