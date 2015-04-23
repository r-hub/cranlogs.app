var express = require('express');
var router = express.Router();
var pg = require('pg');
var multiline = require('multiline');

var conString = process.env.DATABASE_URL;

var badge_svg = multiline(function(){/*
<svg xmlns="http://www.w3.org/2000/svg" width="108" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="108" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)"><path fill="#555" d="M0 0h70v20H0z"/>
    <path fill="#007ec6" d="M70 0h38v20H70z"/>
    <path fill="url(#b)" d="M0 0h108v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" 
     font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="36" y="15" fill="#010101" fill-opacity=".3">
      downloads
    </text>
    <text x="36" y="14">
      downloads
    </text>
    <text x="88" y="15" fill="#010101" fill-opacity=".3">
      :XXX:
    </text>
    <text x="88" y="14">
      :XXX:
    </text>
  </g>
</svg>
*/});

var re_pre = '^\\/';
var re_pkg = '([\\w\\.,]+)';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_pkg + re_suf, 'i');

router.get(re_full, function(req, res) {
    var package = req.params[0];
    res.set('Content-Type', 'image/svg+xml');
    do_query(res, package);
});

function do_query(res, package) {
    pg.connect(conString, function(err, client, done) {

	if (err) {
	    done(client);
	    res.set(500);
	    res.end('{ "error": "Cannot connect to DB",' +
                    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
	    return true;
	}

	var q = 'SELECT SUM(count) FROM DAILY WHERE package = \'' +
	    package + '\'';
	client.query(q, function(err, result) {
	    if (err) {
		done();
		res.set(500);
		res.end('{ "error": Cannot query DB", ' +
			'  "email": "csardi.gabor+cranlogs@gmail.com" }');
		return true;
	    }

	    var sum = result['rows'][0]['sum'];
	    if (sum >= 1000000) {
		sum = Math.round(sum / 100000) / 10 + 'M';
	    } else if (sum >= 10000) {
		sum = Math.round(sum / 1000) + 'K';
	    }
	    var svg = badge_svg.replace(/:XXX:/g, sum);

	    done();
	    res.set(200);
	    res.send(svg);
	    res.end();
	});
    });
}

module.exports = router;
