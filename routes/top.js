var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = process.env.DATABASE_URL;

var re_pre = "^\\/";
var re_key = 'last-day|last-week|last-month';
var re_date = '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
var re_dates = re_date + ':' + re_date;
var re_int = '(' + re_key + '|' + re_date + '|' + re_dates + ')';
var re_num = '(?:\\/([0-9]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_int + re_num + re_suf, 'i');

router.get(re_full, function(req, res) {
    var interval = req.params[0];
    var howmany = req.params[1] || 9;
    res.set('Content-Type', 'application/json');
    do_query(req, res, interval, howmany);
});

function do_query(req, res, interval, howmany) {
    pg.connect(conString, function(err, client, done) {

	if (err) {
	    handle_error(client, done, res)
	    return true
	}

	var q = 'SELECT cl_get_period(\'' + interval + '\') AS dates'

	client.query(q, function(err, result) {
	    if (err) {
		handle_error(client, done, res)
		return true
	    }

	    var dates = result['rows'][0]['dates']
	    var start = dates[0]
	    var end = dates[2]
	    do_query2(client, done, res, howmany, start, end)
	});

    });
}

function do_query2(client, done, res, howmany, start, end) {

    var q = 'SELECT package, SUM(count) AS downloads ' +
	'FROM daily ' +
	'WHERE day >= \'' + start.toISOString() +
	'\' AND day < \'' + end.toISOString() + '\' ' +
	'GROUP BY package ' +
	'ORDER BY downloads DESC ' +
	'LIMIT ' + howmany

    client.query(q, function(err, result) {
	if (err) {
	    handle_error(client, done, res)
	    return true
	}
	done(client)

	var resobj = { 'start': formatDate(start),
		       'end': formatDate(end),
		       'downloads': result['rows'] }

	res.set(200)
	res.end(JSON.stringify(resobj))
    })
}

function formatDate(d) {
    return d.getUTCFullYear() + '-' +
	("0" + d.getUTCMonth()).substr(-2, 2) + '-' +
	("0" + d.getUTCDate()).substr(-2, 2)
}

function handle_error(client, done, res) {
    done(client);
    res.set(500);
    res.end('{ "error": "Cannot connect to DB",' +
            '  "email": "csardi.gabor+cranlogs@gmail.com" }');
}

module.exports = router;
