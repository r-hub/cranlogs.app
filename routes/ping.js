var express = require('express');
var router = express.Router();
var async = require('async');

var last_pkg = require('../lib/last_pkg');
var missing_urls = require('../lib/missing_urls');
var update_pkg_db_day = require('../lib/update_pkg_db_day');
var update_r_db_day = require('../lib/update_r_db_day');

var conString = process.env.DATABASE_URL;

var base_url = 'http://cran-logs.rstudio.com/2017/<date>.csv.gz';
var r_base_url = 'http://cran-logs.rstudio.com/2017/<date>-r.csv.gz';

router.get('/', function(req, res) {

    res.set('Content-Type', 'application/json')
	.set(200)
	.end('{ "operation": "ping",' +
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

module.exports = router;
