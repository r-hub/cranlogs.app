import download_csv from '../lib/download_csv.js';
import clean_r_csv from '../lib/clean_r_csv.js';
import append_csv_to_db from '../lib/append_csv_to_db.js';

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

export default update_r_db_day;
