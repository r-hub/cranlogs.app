var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {

    console.log("PING");
    res.set('Content-Type', 'application/json')
	.set(200)
	.end('{ "operation": "ping",' +
             '  "message": "Thanks! Live long and prosper!" }');
});

module.exports = router;
