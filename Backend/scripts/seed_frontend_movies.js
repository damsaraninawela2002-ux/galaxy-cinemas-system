require('dotenv').config();
const db = require('../config/db');

const moviesToEnsure = [
  {
    title: 'Spider-Man: Brand New Day',
    description: 'The culmination of the Multiverse Saga. Heroes from across the multiverse unite to defend reality from total collapse in a desperate final battle.',
    genre: 'Action, Sci-Fi, Adventure',
    release_date: '2026-07-24',
    duration: 180,
    duration_minutes: 180,
    language: 'English',
    age_rating: 'PG-13',
    director: 'Destin Daniel Cretton',
    cast: 'Tom Holland, Zendaya, Mark Ruffalo',
    poster_url: '/images/1.jfif',
    backdrop_url: '/images/1.jfif',
    trailer_url: 'https://www.youtube.com/watch?v=8TZMtslA3UY',
    status: 'now_showing',
    rating: '4.9'
  },
  {
    title: 'Avengers: Doomsday',
    description: 'Earth\'s mightiest heroes unite with cosmic allies to defend reality from total collapse against Doctor Doom in an epic clash that determines the fate of the multiverse.',
    genre: 'Adventure, Fantasy, Action',
    release_date: '2026-05-01',
    duration: 190,
    duration_minutes: 190,
    language: 'English',
    age_rating: 'PG-13',
    director: 'Anthony & Joe Russo',
    cast: 'Robert Downey Jr., Benedict Cumberbatch, Anthony Mackie',
    poster_url: '/images/pp.jfif',
    backdrop_url: '/images/pp.jfif',
    trailer_url: 'https://youtu.be/irVNGjRFZGk?si=eYIASNJpU_N6Ca-j',
    status: 'now_showing',
    rating: '4.8'
  },
  {
    title: 'The Odyssey',
    description: 'Based on Homer\'s legendary Greek epic, this sweeping historical epic follows King Odysseus\'s perilous, decade-long voyage home to Ithaca after the Trojan War.',
    genre: 'Sci-Fi, Drama, Mystery',
    release_date: '2026-11-20',
    duration: 165,
    duration_minutes: 165,
    language: 'English',
    age_rating: 'PG-13',
    director: 'Christopher Nolan',
    cast: 'Ralph Fiennes, Juliette Binoche, Charlie Plummer',
    poster_url: '/images/77.jfif',
    backdrop_url: '/images/77.jfif',
    trailer_url: 'https://youtu.be/Mzw2ttJD2qQ?si=yjp-ZCe1pComJ_IV',
    status: 'now_showing',
    rating: '4.7'
  },
  {
    title: 'Toy Story 5',
    description: 'As kids increasingly turn to smart screens and electronics over traditional toys, Woody, Buzz Lightyear and Jessie must face their biggest challenge yet.',
    genre: 'Animation, Action, Adventure',
    release_date: '2026-06-19',
    duration: 140,
    duration_minutes: 140,
    language: 'English',
    age_rating: 'G/PG',
    director: 'Andrew Stanton',
    cast: 'Tom Hanks, Tim Allen, Joan Cusack',
    poster_url: '/images/ff.jfif',
    backdrop_url: '/images/ff.jfif',
    trailer_url: 'https://youtu.be/c51ND9Hdbw0?si=YEGIqiJ49McnnzNj',
    status: 'coming_soon',
    rating: '4.9'
  },
  {
    title: 'Frozen 3',
    description: 'Elsa and Anna embark on a breathtaking new adventure beyond Arendelle to discover the ancient origin of seasonal magic and protect the enchanted realms.',
    genre: 'Sci-Fi, Thriller, Action',
    release_date: '2026-11-25',
    duration: 155,
    duration_minutes: 155,
    language: 'English',
    age_rating: 'PG',
    director: 'Jennifer Lee',
    cast: 'Idina Menzel, Kristen Bell, Josh Gad',
    poster_url: '/images/rr.jfif',
    backdrop_url: '/images/rr.jfif',
    trailer_url: 'https://youtu.be/h2--eZ66iR4?si=7xJ1D79JcqAnokO4',
    status: 'coming_soon',
    rating: '4.6'
  },
  {
    title: 'Shrek 5',
    description: 'Shrek, Fiona, Donkey and Puss in Boots return to Far Far Away, facing a new hilarious and thrilling challenge in the magical kingdom — a fun-filled family adventure from DreamWorks.',
    genre: 'Fantasy, Family, Adventure',
    release_date: '2026-07-01',
    duration: 110,
    duration_minutes: 110,
    language: 'English',
    age_rating: 'PG',
    director: 'Walt Dohrn',
    cast: 'Mike Myers, Eddie Murphy, Cameron Diaz',
    poster_url: '/images/hh.jfif',
    backdrop_url: '/images/hh.jfif',
    trailer_url: 'https://youtu.be/Swiz1XyfhcI',
    status: 'coming_soon',
    rating: '4.4'
  }
];

async function seedFrontendMovies() {
  console.log('Ensuring all frontend movies exist in database...');

  for (const m of moviesToEnsure) {
    const [existing] = await db.query('SELECT movie_id FROM movies WHERE LOWER(title) = ?', [m.title.toLowerCase()]);
    if (existing.length > 0) {
      const id = existing[0].movie_id;
      await db.query(
        `UPDATE movies SET 
          description = ?, genre = ?, release_date = ?, duration = ?, duration_minutes = ?,
          language = ?, age_rating = ?, director = ?, cast = ?, poster_url = ?, backdrop_url = ?,
          trailer_url = ?, status = ?, rating = ?
        WHERE movie_id = ?`,
        [
          m.description, m.genre, m.release_date, m.duration, m.duration_minutes,
          m.language, m.age_rating, m.director, m.cast, m.poster_url, m.backdrop_url,
          m.trailer_url, m.status, m.rating, id
        ]
      );
      console.log(`Updated existing movie [${id}]: ${m.title}`);
    } else {
      const [res] = await db.query(
        `INSERT INTO movies (
          title, description, genre, release_date, duration, duration_minutes,
          language, age_rating, director, cast, poster_url, backdrop_url,
          trailer_url, status, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.title, m.description, m.genre, m.release_date, m.duration, m.duration_minutes,
          m.language, m.age_rating, m.director, m.cast, m.poster_url, m.backdrop_url,
          m.trailer_url, m.status, m.rating
        ]
      );
      console.log(`Inserted new movie [${res.insertId}]: ${m.title}`);
    }
  }

  await db.query("UPDATE movies SET genre = 'Action, Sci-Fi', backdrop_url = poster_url WHERE movie_id = 1");
  await db.query("UPDATE movies SET genre = 'Biography, Drama', backdrop_url = poster_url WHERE movie_id = 2");
  await db.query("UPDATE movies SET genre = 'Sci-Fi, Action', backdrop_url = poster_url WHERE movie_id = 3");
  await db.query("UPDATE movies SET genre = 'Animation, Action', backdrop_url = poster_url WHERE movie_id = 4");
  await db.query("UPDATE movies SET genre = 'Sci-Fi, Adventure', backdrop_url = poster_url WHERE movie_id = 5");

  const [all] = await db.query('SELECT movie_id, title, status, genre, duration FROM movies');
  console.log('\nAll movies in DB now:');
  console.table(all);
  process.exit(0);
}

seedFrontendMovies().catch(err => {
  console.error('Error seeding movies:', err);
  process.exit(1);
});
