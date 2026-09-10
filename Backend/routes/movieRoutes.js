const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieDetails,
  addMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllMovies);
router.get('/:id', getMovieDetails);
router.post('/', verifyAdmin, addMovie);
router.post('/add', verifyAdmin, addMovie);
router.put('/:id', verifyAdmin, updateMovie);
router.put('/', verifyAdmin, updateMovie);
router.delete('/:id', verifyAdmin, deleteMovie);

module.exports = router;