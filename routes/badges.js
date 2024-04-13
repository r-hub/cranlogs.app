import express from 'express';
var router = express.Router();
import pg from 'pg';
import multiline from 'multiline';

var conString = process.env.DATABASE_URL;

var svg_params = {
    "grand-total": { "width": 108, "textwidth": 88,    "path_d": 38 },
    "last-month":  { "width": 149, "textwidth": 108.5, "path_d": 79 },
    "last-week":   { "width": 143, "textwidth": 105.5, "path_d": 73 },
    "last-day":    { "width": 134, "textwidth": 101,   "path_d": 64 }
};

var svg_colors = {
    "brightgreen": "4c1",
    "green": "97CA00",
    "yellowgreen": "a4a61d",
    "yellow": "dfb317",
    "orange": "fe7d37",
    "red": "e05d44",
    "lightgrey": "9f9f9f",
    "blue": "007ec6"
};

var badge_svg = multiline(function(){/*
<svg xmlns="http://www.w3.org/2000/svg" width=":width:" height="20" aria-label="CRAN downloads :count:">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width=":width:" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)"><path fill="#555" d="M0 0h70v20H0z"/>
    <path fill=":color:" d="M70 0h:path_d:v20H70z"/>
    <path fill="url(#b)" d="M0 0h:width:v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle"
     font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="36" y="15" fill="#010101" fill-opacity=".3">
      downloads
    </text>
    <text x="36" y="14">
      downloads
    </text>
    <text x=":textwidth:" y="15" fill="#010101" fill-opacity=".3">
      :count:
    </text>
    <text x=":textwidth:" y="14">
      :count:
    </text>
  </g>
</svg>
*/});

var re_pre = '^';
var re_slash = '\\/';
var re_key = '(last-day|last-week|last-month|grand-total)';
var re_pkg = '(?:\\/([\\w\\.,]+))?';
var re_suf = '$';
var re_full = new RegExp(re_pre + re_slash + re_key + re_pkg + re_suf, 'i');

var re_old = new RegExp(re_pre + re_pkg + re_suf, 'i');

router.get(re_full, function(req, res) {
    var interval = req.params[0];
    var pkg = req.params[1] || req.params[0];
    do_query(res, pkg, interval, req.query);
});

router.get(re_old, function(req, res) {
    var pkg = req.params[0];
    var interval = 'last-month';
    do_query(res, pkg, interval, req.query);
});

function do_query(res, pkg, interval, query) {

    var now = new Date().toUTCString();
    res.set('Content-Type', 'image/svg+xml');
    res.set('Expires', now);
    res.set('Cache-Control', 'no-cache');

    pg.connect(conString, function(err, client, done) {

	if (err) {
	    done(client);
	    res.status(500);
	    res.end('{ "error": "Cannot connect to DB",' +
                    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
	    return true;
	}

	if (interval == "grand-total") {
	    do_total(res, client, pkg, done, query)
	} else {
	    do_interval(res, client, pkg, interval, done, query)
	}
    });
}

function do_total(res, client, pkg, done, query) {

    var q = 'SELECT SUM(count) FROM DAILY WHERE package = \'' +
	pkg + '\'';
    client.query(q, function(err, result) {
	if (err) {
	    done();
	    res.status(500);
	    res.end('{ "error": Cannot query DB", ' +
		    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
	    return true;
	}

	var sum = pretty_count(result['rows'][0]['sum']);
	var params = svg_params['grand-total'];
	params['count'] = sum;
	var svg = svg_template(badge_svg, params, query);

	done();

	res.status(200);
	res.send(svg);
	res.end();
    });
}

function do_interval(res, client, pkg, interval, done, query) {

    var q = 'SELECT cl_total_json(\'' + interval + '\', \'' +
	pkg + '\')';

    client.query(q, function(err, result) {
	if (err) {
	    done();
	    res.status(500);
	    res.end('{ "error": Cannot query DB", ' +
		    '  "email": "csardi.gabor+cranlogs@gmail.com" }');
	    return true;
	}

	var sum = pretty_count(result['rows'][0]['cl_total_json']['downloads']);
	sum = sum + "/" + interval.replace('last-', '');
	var params = svg_params[interval]
	params['count'] = sum;
	var svg = svg_template(badge_svg, params, query);

	done();

	res.status(200);
	res.send(svg);
	res.end();

    });
}

function svg_template(svg, params, query) {
    for (var key in params) {
	if (params.hasOwnProperty(key)) {
	    var regexp = new RegExp(':' + key + ":", 'g')
	    svg = svg.replace(regexp, params[key])
	}
    }

    var color = query['color'] || "blue";
    color = svg_colors[color] || color;
    svg = svg.replace(/:color:/g, '#' + color.replace(/[^\w]/g, ''));

    return svg;
}

function pretty_count(sum) {
    if (sum >= 1000000) {
	sum = Math.round(sum / 100000) / 10 + 'M';
    } else if (sum >= 10000) {
	sum = Math.round(sum / 1000) + 'K';
    }
    return sum
}

export default router;
