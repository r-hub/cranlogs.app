
var download_csv = require('../lib/download_csv');
var clean_r_csv = require('../lib/clean_r_csv');
var append_csv_to_db = require('../lib/append_csv_to_db');

function update_r_db_day(url, callback) {

    download_csv(url, function(err, csv) {
	// If the file does not exist, that is fine
	if (err && err.code == 404) { callback(null, false); return; }
	if (err) { callback(err); return; }
	clean_r_csv(csv, function(err, cleaned) {
	    append_csv_to_db(cleaned, 'dailyr',
			     [ 'day', 'version', 'os', 'count' ],
			     function(err, status) {
		if (err) { callback(err); return; }
		callback(null, status);
	    })
	})
    })
}

module.exports = update_r_db_day;
