import express from 'express';
var router = express.Router();

router.get("/", function(req, res) {
    res.render('layout.html', {
	partials: { body: 'index.html' }
    })
});

export default router;
