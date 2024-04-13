import express from 'express';
var router = express.Router();
import pool from '../lib/pool.js';

var re_pre = '^\\/(total|daily)\\/';
var re_key = 'last-day|last-week|last-month'
var re_date = '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
var re_dates = re_date + ':' + re_date;
var re_date_until = re_date + ':' + 'last-day';
var re_int = '(' + re_key + '|' + re_date + '|' + re_dates +
	'|' + re_date_until + ')';
var re_pkg = '(?:\\/([\\w\\.,]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_int + re_pkg + re_suf, 'i');

router.get(re_full, async function (req, res, next) {
	try {
		var which = req.params[0];
		var interval = normalize_interval(req.params[1]);
		var pkg = req.params[2] &&
			req.params[2]
				.split(',')
				.map(function (x) { return "'" + x + "'" });
		res.set('Content-Type', 'application/json');
		await do_query(res, which, interval, pkg);
	} catch (err) {
		next(err);
	}
});

async function do_query(res, which, interval, pkg) {
	// Remove 'R' if not by itself
	if (pkg && pkg.length &&
		(pkg.length != 1 || pkg[0] != 'R')) {
		pkg = pkg.filter(function (x) { return x != 'R'; });
	}

	return do_pkg_query(res, which, interval, pkg);
}

async function do_pkg_query(res, which, interval, pkg) {

	const fun = which == 'total' ? 'cl_total_json' : 'cl_daily_json';
	const pkgs = pkg || ['NULL'];
	var allres = [];
	for (var p of pkgs) {
		const q = 'SELECT ' + fun + '(\'' + interval + '\', ' + p + ')';
		const result = await pool.query(q);
		allres.push(result.rows[0][fun]);
	}
	res.status(200);
	res.send(allres);
	res.end();
}

router.get("/monthly-totals", async function (req, res, next) {
	try {
		var q =
			'SELECT package, SUM(count) AS count ' +
			'FROM daily ' +
			'WHERE day > CURRENT_DATE - INTERVAL \'30 days\' ' +
			'GROUP BY package ORDER BY count DESC';

		const result = await pool.query(q);
		res.status(200);
		res.send(result.rows);
		res.end();
	} catch (err) {
		next(err);
	}
})

router.get('/', function (req, res) {
	res.set('Content-Type', 'application/json');
	res.send('{ "info": "https://github.com/metacran/cranlogs.app" }');
});

router.get(/.*/, function (req, res) {
	res.set('Content-Type', 'application/json');
	res.status(404).end('{ "error": "Invalid query", ' +
		'  "info": "https://github.com/metacran/cranlogs.app" }');
});

function normalize_interval(interval) {
	// All we do currently is replacing last-day with the current date
	// But not for the 'last-day' interval, because that is supported
	// by the DB natively.
	if (interval === 'last-day') { return ('last-day'); }
	var today = new Date();
	var iso_today = today.getFullYear() + '-' + (today.getMonth() + 1) +
		'-' + today.getDate();
	return interval.replace('last-day', iso_today);
}

export default router;
