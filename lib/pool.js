import pg from 'pg';
import url from 'url';

const pg_url = process.env.DATABASE_URL;
const pg_host = process.env.PG_HOST || 'postgres';
const pg_user = process.env.PG_USER || 'postgres';
const pg_db = process.env.PG_DB || 'postgres';
const pg_pass = process.env.PG_PASSWORD;

var creds;

if (pg_url) {
    const params = url.parse(pg_url);
    const auth = params.auth.split(':');
    creds = {
        user: auth[0],
        password: auth[1],
        host: params.hostname,
        port: params.port,
        database: params.pathname.split('/')[1]
    };
} else {
    creds = {
        host: pg_host,
        user: pg_user,
        db: pg_db,
        password: pg_pass
    };
}

const pool = new pg.Pool(creds);

export default pool;
