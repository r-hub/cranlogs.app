var express = require('express');
var router = express.Router();

router.get("/", function(req, res) {
    res.render('layout.html', {
	partials: { body: 'index.html' }
    })
});

module.exports = router;
