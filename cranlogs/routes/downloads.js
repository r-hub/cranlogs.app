var express = require('express');
var router = express.Router();
var pg = require('pg');

var re_pre = '^\\/(total|daily)\\/';

var re_key = 'last-day|last-week|last-month'
var re_date = '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]';
var re_dates = re_date + ':' + re_date;
var re_int = '(' + re_key + '|' + re_date + '|' + re_dates + ')';

var re_pkg = '(?:\\/(\\w+))?';
var re_suf = '$';

var re_full = new RegExp(re_pre + re_int + re_pkg + re_suf, 'i');

router.get(re_full, function(req, res) {
    var which = req.params[0];
    var interval = req.params[1];
    var package = req.params[2];
    res.send(which + ' interval: ' + interval + " package: " + package);
});

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
