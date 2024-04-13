import express from 'express';
var router = express.Router();

router.get('/', function(req, res) {

    res.set('Content-Type', 'application/json')
	.status(200)
	.send('{ "operation": "ping",' +
              '  "message": "Thanks! Live long and prosper!" }');

});

export default router;
