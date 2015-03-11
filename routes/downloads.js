var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = process.env.DATABASE_URL;

var re_pre = '^\\/(total|daily)\\/';
var re_key = 'last-day|last-week|last-month'
var re_date = '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
var re_dates = re_date + ':' + re_date;
var re_int = '(' + re_key + '|' + re_date + '|' + re_dates + ')';
var re_pkg = '(?:\\/([\\w\\.,]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_int + re_pkg + re_suf, 'i');

router.get(re_full, function(req, res) {
    var which = req.params[0];
    var interval = req.params[1];
    var package = req.params[2] &&
	req.params[2]
	.split(',')
	.map(function(x) { return "'" + x + "'" });
    res.set('Content-Type', 'application/json');
    do_query(res, which, interval, package);
});

function do_query(res, which, interval, package) {
    pg.connect(conString, function(err, client, done) {

	if (err) {
	    done(client);
	    res.set(500);
	    res.end('{ "error": "Cannot connect to DB",' +
                    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
	    return true;
	}

	var allres = [ ]
	var reslen = package ? package.length : 1
	function save_result(result) {
	    allres.push(result)
	    if (allres.length == reslen) {
		done()
		res.set(200)
		res.send(allres)
		res.end();
	    }
	}

	var fun = which == 'total' ? 'cl_total_json' : 'cl_daily_json';
	(package || ['NULL']).map(function(pkg) {
	    var q = 'SELECT ' + fun + '(\'' + interval + '\', ' + pkg + ')';

	    client.query(q, function(err, result) {
		if (err) {
		    done();
		    res.set(500);
		    res.end('{ "error": Cannot query DB", ' +
			    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
		    return true;
		}

		save_result(result['rows'][0][fun])

	    })
	})
    });
}

router.get('/', function(req, res) {
    res.set('Content-Type', 'application/json');    
    res.send('{ "info": "https://github.com/metacran/cranlogs.app" }');
});

router.get(/.*/, function(req, res) {
    res.set(404, 'Content-Type', 'application/json');
    res.end('{ "error": "Invalid query", ' +
	    '  "info": "https://github.com/metacran/cranlogs.app" }');
});

module.exports = router;
