import express from 'express';
var router = express.Router();
import async from 'async';

import last_pkg from '../lib/last_pkg.js';
import missing_urls from '../lib/missing_urls.js';
import update_pkg_db_day from '../lib/update_pkg_db_day.js';
import update_r_db_day from '../lib/update_r_db_day.js';

var conString = process.env.DATABASE_URL;

var base_url = 'http://cran-logs.rstudio.com/2024/<date>.csv.gz';
var r_base_url = 'http://cran-logs.rstudio.com/2024/<date>-r.csv.gz';

router.get('/', function(req, res) {

    res.set('Content-Type', 'application/json')
	.status(200)
	.send('{ "operation": "ping",' +
              '  "message": "Thanks! Live long and prosper!" }');

    update_pkg_db();
    update_r_db();
});

function update_pkg_db() {
    missing_urls(base_url, last_pkg, 'daily', function(err, urls) {
	if (err) { console.log('Error ', err); return; }
	async.mapLimit(urls, 2, update_pkg_db_day, function(err, results) {
	    if (err) { console.log('Error ', err); return; }
	    console.log('Pkg update successful');
	});
    });
}

function update_r_db() {
    missing_urls(r_base_url, last_pkg, 'dailyr', function(err, urls) {
	if (err) { console.log('Error ', err); return; }
	async.mapLimit(urls, 2, update_r_db_day, function(err, results) {
	    if (err) { console.log('Error ', err); return; }
	    console.log('R update successful');
	});
    });
}

export default router;
