
APP=cranlogs
cat create.sql | dokku psql:restore_sql $APP
