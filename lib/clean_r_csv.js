
function clean_r_csv(csv, callback) {

    // Empty?
    if (csv.length <= 1) { callback(null, csv); return; }

    // First line is the header
    var header = csv[0];
    csv = csv.splice(1);

    // Date, take from first record
    var date = csv[1][ header.indexOf('date') ];

    // Which fields are version and os?
    var ver_idx = header.indexOf('version');
    var os_idx  = header.indexOf('os');

    // Count by version and os
    var count = { };
    csv.forEach(function(x) {
	var key = x[os_idx] + '@' + x[ver_idx];
	if (count.hasOwnProperty(key)) {
	    count[key] ++;
	} else {
	    count[key] = 1;
	}
    })

    var recs = [ ];
    for (k in count) {
	var os = k.split('@')[0];
	var ver = k.split('@')[1];
	recs.push({ 'day': date, 'version': ver, 'os': os,
		    'count': count[k] });
    }
    callback(null, recs);
}

export default clean_r_csv;
