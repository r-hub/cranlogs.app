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

	var q = 'SELECT * FROM trending2';

	client.query(q, function(err, result) {
	    if (err) {
		handle_error(client, done, res)
		return true
	    }

	    done(client);
	    res.status(200);
	    res.end(JSON.stringify(result['rows']));

	});

    });

});

function handle_error(client, done, res) {
    done(client);
    res.status(500);
    res.end('{ "error": "Cannot connect to DB",' +
            '  "email": "csardi.gabor+cranlogs@gmail.com" }');
}

module.exports = router;
