import express from 'express';
var router = express.Router();

router.get('/', function(req, res) {
    res.set('Content-Type', 'text/plain')
	.send('I am alive')
	.end();
})

export default router;
