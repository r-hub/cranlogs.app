var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = process.env.DATABASE_URL;

var re_full = new RegExp("^\\/?$");

router.get(re_full, function(req, res) {
    res.set('Content-Type', 'application/json');

    pg.connect(conString, function(err, client, done) {

	if (err) {
	    handle_error(client, done, res)
	    return  true
	}

	var select1 = 'SELECT package, SUM(count) AS cnt ' +
	    'FROM daily ' +
	    'WHERE day >= (NOW() - INTERVAL \'8 DAYS\') ' +
	    'AND day < NOW() ' +
	    'GROUP BY package ' +
	    'HAVING SUM(count) >= 1000 ' +
	    'ORDER BY package ';

	var select2 = 'SELECT package, SUM(count) AS cnt ' +
	    'FROM daily ' +
	    'WHERE day >= (NOW() - INTERVAL \'176 DAYS\') ' +
	    'AND day < (NOW() - INTERVAL \'8 DAYS\') ' +
	    'GROUP BY package ' +
	    'ORDER BY package';

	var q = 'SELECT t1.package, 24 * t1.cnt / t2.cnt * 100 AS increase ' +
	    'FROM (' + select1 + ') AS t1, ' +
	    '(' + select2 + ') AS t2 ' +
	    'WHERE t1.package = t2.package ' +
	    'ORDER BY increase DESC ' +
	    'LIMIT 20';

	client.query(q, function(err, result) {
	    if (err) {
		handle_error(client, done, res)
		return true
	    }

	    done(client);
	    res.set(200);
	    res.end(JSON.stringify(result['rows']));

	});

    });

});

function handle_error(client, done, res) {
    done(client);
    res.set(500);
    res.end('{ "error": "Cannot connect to DB",' +
            '  "email": "csardi.gabor+cranlogs@gmail.com" }');
}

module.exports = router;
