
var got = require('got');
var gunzip = require('zlib').gunzip;
var csv_parse = require('csv-parse');

function download_csv(url, callback) {

    console.log('Getting ', url);
    got(url,
	{ headers: { 'user-agent':
		     'https://github.com/metacran/cranlogs.app'
		   },
	  encoding: null
	},
	function(err, data, res) {
	    if (err) { callback(err); return; }
	    gunzip(data, function(err, data) {
		if (err) { callback(err); return; }
		csv_parse(data, function(err, data) {
		    if (err) { callback(err); return; }
		    callback(null, data);
		})
	    })
	})
}

module.exports = download_csv;
