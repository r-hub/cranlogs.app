
function missing_days(last_pkg, table, callback) {

    last_pkg(table, function(err, day) {
	if (err) { callback(err); return; }
	var today = new Date();
	var days = [];
	while (day < today) {
	    day.setDate(day.getDate() + 1);
	    days.push(day.toISOString().slice(0, 10));
	}
	callback(null, days);
    })
}

export default missing_days;
