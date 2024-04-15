import express from 'express';
var router = express.Router();
import pool from '../lib/pool.js';

var re_pre = "^\\/";
var re_key = '(last-day|last-week|last-month)';
var re_num = '(?:\\/([0-9]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_key + re_num + re_suf, 'i');

router.get(re_full, async function (req, res, next) {
	try {
		var interval = req.params[0];
		var howmany = req.params[1] || 9;
		res.set('Content-Type', 'application/json');
		await do_query(req, res, interval, howmany);
	} catch (err) {
		next(err);
	}
});

async function do_query(req, res, interval, howmany) {
	const table = interval.replace(/^last-/, 'top_');
	const q = 'SELECT *, cl_get_period(\'' + interval + '\') FROM ' +
		table + ' LIMIT ' + howmany;

	const result = await pool.query(q);
	const start = result['rows'][0]['cl_get_period'][0];
	const end = result['rows'][0]['cl_get_period'][1];
	const downloads = result['rows'].map(
		function (x) {
			return {
				'package': x['package'],
				'downloads': x['downloads']
			}
		}
	);

	var resobj = {
		'start': start,
		'end': end,
		'downloads': downloads
	};

	res.status(200)
	res.end(JSON.stringify(resobj))
}

export default router;
