var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = process.env.DATABASE_URL;

var re_pre = "^\\/";
var re_key = '(last-day|last-week|last-month)';
var re_num = '(?:\\/([0-9]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_key + re_num + re_suf, 'i');

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

	var table = interval.replace(/^last-/, 'top_');
	var q = 'SELECT *, cl_get_period(\'' + interval + '2\') FROM ' +
	    table + ' LIMIT ' + howmany;

	console.log(q)
	
	client.query(q, function(err, result) {
	    if (err) {
		handle_error(client, done, res)
		return true
	    }

	    done(client)

	    var start = result['rows'][0]['cl_get_period'][0];
	    var end = result['rows'][0]['cl_get_period'][1];
	    var downloads = result['rows'].map(
		function(x) { return { 'package': x['package'],
				       'downloads': x['downloads'] }
			    });
	    
	    var resobj = { 'start': start,
			   'end': end,
			   'downloads': downloads };
	    
	    res.status(200)
	    res.end(JSON.stringify(resobj))
	    
	});

    });
}

function handle_error(client, done, res) {
    done(client);
    res.status(500);
    res.end('{ "error": "Cannot connect to DB",' +
            '  "email": "csardi.gabor+cranlogs@gmail.com" }');
}

module.exports = router;
