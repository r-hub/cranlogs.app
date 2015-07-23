var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.set('Content-Type', 'text/plain')
	.send('I am alive')
	.end();
})

module.exports = router;
