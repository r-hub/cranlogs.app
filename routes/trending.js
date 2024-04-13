import express from 'express';
var router = express.Router();
import pool from '../lib/pool.js';

var re_full = new RegExp("^\\/?$");

router.get(re_full, async function (req, res, next) {
	try {
		res.set('Content-Type', 'application/json');
		const q = 'SELECT * FROM trending';
		const result = await pool.query(q);
		res.status(200);
		res.end(JSON.stringify(result['rows']));
	} catch (err) {
		next(err);
	}
});

export default router;
