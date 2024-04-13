import pg from 'pg';

const pg_url = process.env.DATABASE_URL;
const pg_host = process.env.PG_HOST || 'postgres';
const pg_user = process.env.PG_USER || 'postgres';
const pg_db = process.env.PG_DB || 'postgres';
const pg_pass = process.env.PG_PASSWORD;

const creds = pg_url ?
    { url: pg_url } :
    { host: pg_host, user: pg_user, db: pg_db, password: pg_pass };

const pool = new pg.Pool(creds);

export default pool;
