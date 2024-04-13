import pg from 'pg';

var conString = process.env.DATABASE_URL;

function last_pkg(table, callback) {

    pg.connect(conString, function(err, client, done) {

	if (err) {
	    done(client);
	    return;
	}

	var q = 'SELECT MAX(day) FROM ' + table;
	client.query(q, function(err, result) {
	    if (err) {
		done();
		callback(err);
		return;
	    }

	    var day = new Date(result['rows'][0]['max'] || '2012-09-30');
	    callback(null, day);
	    done();
	})
    })
}

export default last_pkg;
