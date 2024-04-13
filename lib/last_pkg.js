import pool from '../lib/pool.js';

async function last_pkg(table) {
	const result = await pool.query('SELECT MAX(day) FROM ' + table);
	const day = new Date(result['rows'][0]['max'] || '2012-09-30');
	return day;
}

export default last_pkg;
