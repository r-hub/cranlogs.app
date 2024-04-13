
function clean_pkg_csv(csv, callback) {

    // Empty?
    if (csv.length <= 1) { callback(null, csv); return; }

    // First line is the header
    var header = csv[0];
    csv = csv.splice(1);

    // Date, take from first record
    var date = csv[1][ header.indexOf('date') ];

    // Which field is the package?
    var pkg_idx = header.indexOf('package');

    // Take package names
    var pkg = csv.map(function(x) { return x[pkg_idx]; });

    // Count their downloads
    var count = { };
    pkg.forEach(function(x) {
	if (count.hasOwnProperty(x)) {
	    count[x]++;
	} else {
	    count[x] = 1;
	}
    });

    // Unique package names
    var upkg = Object.keys(count);

    // Proper records
    var recs = upkg
	.map(function(x) {
	    return { 'day': date, 'package': x, 'count': count[x] };
	});
    callback(null, recs);
}

export default clean_pkg_csv;
