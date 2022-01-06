#! /bin/bash

# RStudio base URL
url="http://cran-logs.rstudio.com/2022/<date>-r.csv.gz"

# Last day in the DB
max_day=$(echo 'SELECT MAX(day) FROM dailyr;' |
          dokku postgres:connect cranlogs |
	  grep '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')

# Start here
day=$(date --date "$max_day 1 day" +%Y-%m-%d)

# First day *not* on the RStudio server is probably today
today=$(date --date today '+%Y-%m-%d')

# Function to add one day
function do_day() {
    day=$1
    filename=$day-r.csv.gz
    trap "rm -f $filename" EXIT
    
    echo -n "Downloading $day,"
    curl -f -s -O $(echo $url | sed "s/<date>/$day/") || return

    echo -n " parsing"
    filename2=$day.sql
    trap "rm -f $filename2" EXIT
    echo 'COPY dailyr (day, version, os, count) FROM stdin;' > $filename2
    zcat $filename       |
	cut -d, -f1,4,5  |	# take day, version, os
	tr -d '"'        |	# remove quotes
	tr , '\t'        |	# replace commas with tabs
	tail -n +2       |	# skip header line
	sort             |	# sort
	uniq -c          |	# count number of downloads per day
	grep -v '\sNA\s' | 	# remove NAs (needed?)
	awk 'BEGIN { OFS="\t"; } { print $2, $3, $4, $1 }' >> $filename2
    echo '\.' >>$filename2

    echo -n " adding"
    dokku postgres:connect cranlogs < $filename2

    echo -n " cleaning"
    rm -f $filename $filename2
    echo " DONE."
}

# Iterate over all days 
while [[ "$day" < "$today" ]]
do
    do_day $day
    day=$(/bin/date --date "$day 1 day" +%Y-%m-%d)
done
