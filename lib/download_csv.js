
import got from 'got';
import zlib from 'zlib';
var gunzip = zlib.gunzip;
import { parse } from 'csv-parse';

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
		parse(data, function(err, data) {
		    if (err) { callback(err); return; }
		    callback(null, data);
		})
	    })
	})
}

export default download_csv;
