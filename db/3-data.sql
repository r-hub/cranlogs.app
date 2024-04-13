
COPY dailyr FROM PROGRAM 'gzip -d -c /sampledata/dailyr.dump.gz';
COPY daily FROM PROGRAM 'gzip -d -c /sampledata/daily.dump.gz';
