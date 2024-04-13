
import stream from 'stream';
import pg from 'pg';
import pg_copy_streams from 'pg-copy-streams';
var copy_from = pg_copy_streams.from;

var conString = process.env.DATABASE_URL;

function append_csv_to_db(csv, table, fields, callback) {
    pg.connect(conString, function(err, client, done) {
	if (err) { done(); callback(err); return; }
	var conString = process.env.DATABASE_URL;
	var ps = client.query(copy_from('COPY ' + table + ' FROM STDIN'));
	var rs = new stream.Readable;
	var we_done = false;
	rs.pipe(ps)
	    .on('finish',
		function() {
		    if (!we_done) {
			we_done = true;
			done();
			callback(null, true);
		    }
		})
	    .on('error',
		function(err) {
		    if (!we_done) {
			we_done = true;
			done();
			callback(err);
		    }
		});
	rs.resume();
	csv.forEach(function(x) {
	    var str = '';
	    for (f in fields) {
		if (f != 0) { str = str + '\t'; }
		str = str + x[ fields[f] ];
	    }
	    str = str + '\n';
	    rs.push(str);
	});
	rs.push(null);
    })
}

export default append_csv_to_db;
