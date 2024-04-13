
import download_csv from '../lib/download_csv.js';
import clean_pkg_csv from '../lib/clean_pkg_csv.js';
import append_csv_to_db from '../lib/append_csv_to_db.js';

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

export default update_pkg_db_day;
