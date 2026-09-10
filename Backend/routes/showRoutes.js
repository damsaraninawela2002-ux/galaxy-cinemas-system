const express = require('express');
const router = express.Router();
const { getShowDetails, addShow } = require('../controllers/showController');

router.post('/add', addShow);
router.get('/:showId', getShowDetails);

module.exports = router;