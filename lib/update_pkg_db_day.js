
var download_csv = require('../lib/download_csv');
var clean_pkg_csv = require('../lib/clean_pkg_csv');
var append_csv_to_db = require('../lib/append_csv_to_db');

function update_pkg_db_day(url, callback) {

    download_csv(url, function(err, csv) {
	// If the file does not exist, that is fine
	if (err && err.code == 404) { callback(null, false); return; }
	if (err) { callback(err); return; }
	clean_pkg_csv(csv, function(err, cleaned) {
	    append_csv_to_db(cleaned, 'daily',
			     [ 'day', 'package', 'count' ],
			     function(err, status) {
		if (err) { callback(err); return; }
		callback(null, status);
	    })
	})
    })
}

module.exports = update_pkg_db_day;
