
var missing_days = require('../lib/missing_days');

function missing_urls(base_url, last, table, callback) {

    missing_days(last, table, function(err, days) {
	if (err) { callback(err); return; }
	var urls = days.map(function(d) {
	    return base_url.replace('<date>', d);
	})
	callback(null, urls);
    })
}

module.exports = missing_urls;
